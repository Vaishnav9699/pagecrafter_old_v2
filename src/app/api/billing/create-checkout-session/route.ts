import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const environment =
            (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ||
            "live_mode";
        const proProductId = process.env.DODO_PRO_PRODUCT_ID;

        if (!apiKey) {
            return NextResponse.json(
                { error: "DODO_PAYMENTS_API_KEY not configured" },
                { status: 500 }
            );
        }
        if (!proProductId) {
            return NextResponse.json(
                { error: "DODO_PRO_PRODUCT_ID not configured" },
                { status: 500 }
            );
        }

        const origin = request.headers.get("origin") || "";
        const returnUrl =
            process.env.DODO_PAYMENTS_RETURN_URL ||
            `${origin}/pricing?status=completed`;

        const client = new DodoPayments({
            bearerToken: apiKey,
            environment,
        });

        const session = await client.checkoutSessions.create({
            product_cart: [{ product_id: proProductId, quantity: 1 }],
            customer: {
                email: user.email ?? ""
            },
            return_url: returnUrl,
            metadata: {
                supabase_user_id: user.id,
                plan: "pro",
                source: "pagecrafter_pricing",
            } as Record<string, string>,
        });

        return NextResponse.json(
            { checkout_url: session.checkout_url, session_id: session.session_id },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Failed to create Dodo checkout session:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}