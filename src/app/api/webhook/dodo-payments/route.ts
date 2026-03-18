import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createAdminClient } from "@/lib/supabase/admin";

type DodoWebhook = {
    type: string;
    data: Record<string, any>;
};

export async function POST(request: NextRequest) {
    // Read raw body for signature verification
    const rawBody = await request.text();

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    // Support both KEY and SECRET naming from docs/examples
    const webhookKey =
        process.env.DODO_PAYMENTS_WEBHOOK_KEY ||
        process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    if (!apiKey || !webhookKey) {
        return NextResponse.json(
            { error: "Missing Dodo Payments API or webhook key" },
            { status: 500 },
        );
    }

    const webhookHeaders = {
        "webhook-id": request.headers.get("webhook-id") || "",
        "webhook-signature": request.headers.get("webhook-signature") || "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
    };

    try {
        const client = new DodoPayments({
            bearerToken: apiKey,
            webhookKey,
        });

        const event = client.webhooks.unwrap(rawBody, { headers: webhookHeaders }) as DodoWebhook;

        // Process subscription/payment events -> update user's plan
        const payload = event?.data || {};
        const payloadCustomer = payload.customer || {};

        // Prefer metadata.supabase_user_id set during checkout session creation
        const metadata = (payload.metadata || {}) as Record<string, string>;
        const supabaseUserId = metadata["supabase_user_id"];

        // Fallbacks (not ideal, but kept as safe no-ops if user_id is unknown)
        // We intentionally DO NOT attempt to resolve user by email to avoid ambiguity.
        if (!supabaseUserId) {
            // Acknowledge receipt, but skip DB mutation when we can't map to a user
            return NextResponse.json({ received: true, skipped: "no_user_id_metadata" });
        }

        const dodoCustomerId =
            payloadCustomer.customer_id || payload.customer_id || null;
        const subscriptionId = payload.subscription_id || null;
        const nextBillingDate = payload.next_billing_date || null;

        const admin = createAdminClient();

        // Basic handlers to flip plan access
        const activatePro = async () => {
            const { error } = await admin
                .from("user_settings")
                .upsert(
                    {
                        user_id: supabaseUserId,
                        plan_tier: "pro",
                        dodo_customer_id: dodoCustomerId,
                        dodo_subscription_id: subscriptionId,
                        pro_expires_at: nextBillingDate,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" },
                );

            if (error) throw error;
        };

        const downgradeFree = async () => {
            const { error } = await admin
                .from("user_settings")
                .upsert(
                    {
                        user_id: supabaseUserId,
                        plan_tier: "free",
                        dodo_customer_id: dodoCustomerId,
                        dodo_subscription_id: subscriptionId,
                        pro_expires_at: null,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" },
                );

            if (error) throw error;
        };

        // Handle key subscription lifecycle events
        switch (event.type) {
            case "subscription.active":
            case "subscription.renewed":
            case "subscription.plan_changed":
                await activatePro();
                break;

            case "subscription.cancelled":
            case "subscription.expired":
            case "subscription.on_hold":
            case "subscription.failed":
                await downgradeFree();
                break;

            // Optional: on successful one-time payment for a pro upgrade product (if used)
            case "payment.succeeded":
                // If you sell one-time upgrades (not subscription), use metadata.plan === 'pro'
                if (metadata["plan"] === "pro") {
                    await activatePro();
                }
                break;

            default:
                // No-op for unhandled events
                break;
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
        // Signature verification or processing error
        return NextResponse.json(
            { error: "Webhook verification failed or processing error" },
            { status: 401 },
        );
    }
}