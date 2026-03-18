'use client';

import { useState, useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './studio.css';

export default function StudioPage() {
    const editorRef = useRef<Editor | null>(null);
    const [editorReady, setEditorReady] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<'blocks' | 'layers' | 'styles' | 'traits'>('blocks');

    useEffect(() => {
        if (editorRef.current) return;

        const editor = grapesjs.init({
            container: '#gjs-editor',
            height: '100%',
            width: 'auto',
            fromElement: false,
            storageManager: false,
            panels: { defaults: [] },
            blockManager: {
                appendTo: '#gjs-blocks',
            },
            layerManager: {
                appendTo: '#gjs-layers',
            },
            styleManager: {
                appendTo: '#gjs-styles',
                sectors: [
                    {
                        name: 'General',
                        open: true,
                        properties: [
                            { type: 'select', property: 'display', options: [
                                { id: 'block', label: 'Block' },
                                { id: 'flex', label: 'Flex' },
                                { id: 'grid', label: 'Grid' },
                                { id: 'inline-block', label: 'Inline Block' },
                                { id: 'inline', label: 'Inline' },
                                { id: 'none', label: 'None' },
                            ]},
                            { type: 'select', property: 'position', options: [
                                { id: 'static', label: 'Static' },
                                { id: 'relative', label: 'Relative' },
                                { id: 'absolute', label: 'Absolute' },
                                { id: 'fixed', label: 'Fixed' },
                            ]},
                            { type: 'select', property: 'float', options: [
                                { id: 'none', label: 'None' },
                                { id: 'left', label: 'Left' },
                                { id: 'right', label: 'Right' },
                            ]},
                        ],
                    },
                    {
                        name: 'Flex',
                        open: false,
                        properties: [
                            { type: 'select', property: 'flex-direction', options: [
                                { id: 'row', label: 'Row' },
                                { id: 'row-reverse', label: 'Row Reverse' },
                                { id: 'column', label: 'Column' },
                                { id: 'column-reverse', label: 'Column Reverse' },
                            ]},
                            { type: 'select', property: 'flex-wrap', options: [
                                { id: 'nowrap', label: 'No Wrap' },
                                { id: 'wrap', label: 'Wrap' },
                                { id: 'wrap-reverse', label: 'Wrap Reverse' },
                            ]},
                            { type: 'select', property: 'justify-content', options: [
                                { id: 'flex-start', label: 'Start' },
                                { id: 'flex-end', label: 'End' },
                                { id: 'center', label: 'Center' },
                                { id: 'space-between', label: 'Space Between' },
                                { id: 'space-around', label: 'Space Around' },
                                { id: 'space-evenly', label: 'Space Evenly' },
                            ]},
                            { type: 'select', property: 'align-items', options: [
                                { id: 'flex-start', label: 'Start' },
                                { id: 'flex-end', label: 'End' },
                                { id: 'center', label: 'Center' },
                                { id: 'stretch', label: 'Stretch' },
                                { id: 'baseline', label: 'Baseline' },
                            ]},
                            { property: 'gap' },
                        ],
                    },
                    {
                        name: 'Dimension',
                        open: false,
                        properties: [
                            { property: 'width' },
                            { property: 'min-width' },
                            { property: 'max-width' },
                            { property: 'height' },
                            { property: 'min-height' },
                            { property: 'max-height' },
                        ],
                    },
                    {
                        name: 'Spacing',
                        open: false,
                        properties: [
                            { property: 'margin', type: 'composite', properties: [
                                { property: 'margin-top', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'margin-right', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'margin-bottom', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'margin-left', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                            ]},
                            { property: 'padding', type: 'composite', properties: [
                                { property: 'padding-top', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'padding-right', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'padding-bottom', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                                { property: 'padding-left', type: 'integer', units: ['px', '%', 'em', 'rem'] },
                            ]},
                        ],
                    },
                    {
                        name: 'Typography',
                        open: false,
                        properties: [
                            { property: 'font-family', type: 'select', options: [
                                { id: 'Arial, Helvetica, sans-serif', label: 'Arial' },
                                { id: "'Courier New', Courier, monospace", label: 'Courier New' },
                                { id: 'Georgia, serif', label: 'Georgia' },
                                { id: "'Times New Roman', Times, serif", label: 'Times New Roman' },
                                { id: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
                                { id: 'Inter, sans-serif', label: 'Inter' },
                            ]},
                            { property: 'font-size' },
                            { property: 'font-weight' },
                            { property: 'letter-spacing' },
                            { property: 'color' },
                            { property: 'line-height' },
                            { type: 'select', property: 'text-align', options: [
                                { id: 'left', label: 'Left' },
                                { id: 'center', label: 'Center' },
                                { id: 'right', label: 'Right' },
                                { id: 'justify', label: 'Justify' },
                            ]},
                            { type: 'select', property: 'text-decoration', options: [
                                { id: 'none', label: 'None' },
                                { id: 'underline', label: 'Underline' },
                                { id: 'line-through', label: 'Line Through' },
                                { id: 'overline', label: 'Overline' },
                            ]},
                            { type: 'select', property: 'text-transform', options: [
                                { id: 'none', label: 'None' },
                                { id: 'uppercase', label: 'Uppercase' },
                                { id: 'lowercase', label: 'Lowercase' },
                                { id: 'capitalize', label: 'Capitalize' },
                            ]},
                        ],
                    },
                    {
                        name: 'Background',
                        open: false,
                        properties: [
                            { property: 'background-color' },
                            { property: 'background-image' },
                            { property: 'background-repeat', type: 'select', options: [
                                { id: 'repeat', label: 'Repeat' },
                                { id: 'repeat-x', label: 'Repeat X' },
                                { id: 'repeat-y', label: 'Repeat Y' },
                                { id: 'no-repeat', label: 'No Repeat' },
                            ]},
                            { property: 'background-position' },
                            { property: 'background-size', type: 'select', options: [
                                { id: 'auto', label: 'Auto' },
                                { id: 'cover', label: 'Cover' },
                                { id: 'contain', label: 'Contain' },
                            ]},
                        ],
                    },
                    {
                        name: 'Borders',
                        open: false,
                        properties: [
                            { property: 'border-radius' },
                            { property: 'border', type: 'composite', properties: [
                                { property: 'border-width', type: 'integer', units: ['px'] },
                                { property: 'border-style', type: 'select', options: [
                                    { id: 'none', label: 'None' },
                                    { id: 'solid', label: 'Solid' },
                                    { id: 'dashed', label: 'Dashed' },
                                    { id: 'dotted', label: 'Dotted' },
                                ]},
                                { property: 'border-color' },
                            ]},
                            { property: 'box-shadow' },
                        ],
                    },
                    {
                        name: 'Effects',
                        open: false,
                        properties: [
                            { property: 'opacity', type: 'slider', min: 0, max: 1, step: 0.01 },
                            { property: 'transition' },
                            { property: 'transform' },
                            { type: 'select', property: 'overflow', options: [
                                { id: 'visible', label: 'Visible' },
                                { id: 'hidden', label: 'Hidden' },
                                { id: 'scroll', label: 'Scroll' },
                                { id: 'auto', label: 'Auto' },
                            ]},
                            { type: 'select', property: 'cursor', options: [
                                { id: 'auto', label: 'Auto' },
                                { id: 'pointer', label: 'Pointer' },
                                { id: 'move', label: 'Move' },
                                { id: 'text', label: 'Text' },
                                { id: 'not-allowed', label: 'Not Allowed' },
                            ]},
                        ],
                    },
                ],
            },
            traitManager: {
                appendTo: '#gjs-traits',
            },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Tablet', width: '768px', widthMedia: '992px' },
                    { name: 'Mobile', width: '375px', widthMedia: '480px' },
                ],
            },
            canvas: {
                styles: [
                    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                ],
            },
        });

        // Add blocks
        const bm = editor.BlockManager;

        // Layout blocks
        bm.add('section', {
            label: 'Section',
            category: 'Layout',
            content: '<section class="gjs-section"><div class="gjs-container"></div></section>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`,
        });

        bm.add('container', {
            label: 'Container',
            category: 'Layout',
            content: '<div class="gjs-container" style="max-width:1200px;margin:0 auto;padding:20px;"></div>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
        });

        bm.add('column-2', {
            label: '2 Columns',
            category: 'Layout',
            content: `<div style="display:flex;gap:20px;padding:20px;">
                <div style="flex:1;min-height:80px;padding:16px;border:1px dashed #ccc;border-radius:8px;">Column 1</div>
                <div style="flex:1;min-height:80px;padding:16px;border:1px dashed #ccc;border-radius:8px;">Column 2</div>
            </div>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="9" height="16" rx="1"/><rect x="13" y="4" width="9" height="16" rx="1"/></svg>`,
        });

        bm.add('column-3', {
            label: '3 Columns',
            category: 'Layout',
            content: `<div style="display:flex;gap:20px;padding:20px;">
                <div style="flex:1;min-height:80px;padding:16px;border:1px dashed #ccc;border-radius:8px;">Col 1</div>
                <div style="flex:1;min-height:80px;padding:16px;border:1px dashed #ccc;border-radius:8px;">Col 2</div>
                <div style="flex:1;min-height:80px;padding:16px;border:1px dashed #ccc;border-radius:8px;">Col 3</div>
            </div>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="6" height="16" rx="1"/><rect x="9" y="4" width="6" height="16" rx="1"/><rect x="17" y="4" width="6" height="16" rx="1"/></svg>`,
        });

        bm.add('div-block', {
            label: 'Div Block',
            category: 'Layout',
            content: '<div style="padding:20px;min-height:60px;"></div>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4,3"/></svg>`,
        });

        // Basic blocks
        bm.add('text', {
            label: 'Text',
            category: 'Basic',
            content: '<p style="font-size:16px;line-height:1.6;color:#333;">Insert your text here. You can edit it by double-clicking.</p>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>`,
        });

        bm.add('heading', {
            label: 'Heading',
            category: 'Basic',
            content: '<h2 style="font-size:32px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Your heading here</h2>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/></svg>`,
        });

        bm.add('image', {
            label: 'Image',
            category: 'Basic',
            content: { type: 'image' },
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
        });

        bm.add('link', {
            label: 'Link',
            category: 'Basic',
            content: '<a href="#" style="color:#4f46e5;text-decoration:underline;font-size:16px;">Click here</a>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        });

        bm.add('button', {
            label: 'Button',
            category: 'Basic',
            content: '<a href="#" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:white;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;cursor:pointer;">Click Me</a>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="8" rx="4"/></svg>`,
        });

        bm.add('video', {
            label: 'Video',
            category: 'Basic',
            content: { type: 'video', src: '', style: { width: '100%', height: '350px' } },
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
        });

        bm.add('map', {
            label: 'Map',
            category: 'Basic',
            content: { type: 'map', style: { width: '100%', height: '350px' } },
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
        });

        // Pre-built components
        bm.add('hero-section', {
            label: 'Hero Section',
            category: 'Sections',
            content: `<section style="padding:100px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);text-align:center;color:white;">
                <h1 style="font-size:48px;font-weight:800;margin-bottom:20px;color:white;">Build Something Amazing</h1>
                <p style="font-size:20px;max-width:600px;margin:0 auto 32px;opacity:0.9;color:rgba(255,255,255,0.9);">Create beautiful websites with our drag and drop builder. No coding required.</p>
                <a href="#" style="display:inline-block;padding:16px 40px;background:white;color:#4f46e5;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;">Get Started Free</a>
            </section>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 10h10"/><path d="M9 14h6"/></svg>`,
        });

        bm.add('features-grid', {
            label: 'Features Grid',
            category: 'Sections',
            content: `<section style="padding:80px 40px;background:#ffffff;">
                <h2 style="text-align:center;font-size:36px;font-weight:700;margin-bottom:48px;color:#1a1a1a;">Why Choose Us</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1100px;margin:0 auto;">
                    <div style="padding:32px;background:#f8fafc;border-radius:16px;text-align:center;">
                        <div style="width:48px;height:48px;background:#eef2ff;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">⚡</div>
                        <h3 style="font-size:18px;font-weight:600;margin-bottom:8px;color:#1a1a1a;">Lightning Fast</h3>
                        <p style="font-size:14px;color:#6b7280;line-height:1.6;">Optimized for speed. Your sites load instantly.</p>
                    </div>
                    <div style="padding:32px;background:#f8fafc;border-radius:16px;text-align:center;">
                        <div style="width:48px;height:48px;background:#fef3c7;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🎨</div>
                        <h3 style="font-size:18px;font-weight:600;margin-bottom:8px;color:#1a1a1a;">Beautiful Design</h3>
                        <p style="font-size:14px;color:#6b7280;line-height:1.6;">Premium templates and components at your fingertips.</p>
                    </div>
                    <div style="padding:32px;background:#f8fafc;border-radius:16px;text-align:center;">
                        <div style="width:48px;height:48px;background:#dbeafe;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🔒</div>
                        <h3 style="font-size:18px;font-weight:600;margin-bottom:8px;color:#1a1a1a;">Secure</h3>
                        <p style="font-size:14px;color:#6b7280;line-height:1.6;">Enterprise-grade security built right in.</p>
                    </div>
                </div>
            </section>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>`,
        });

        bm.add('navbar', {
            label: 'Navbar',
            category: 'Sections',
            content: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#ffffff;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:20px;font-weight:700;color:#1a1a1a;">Brand</div>
                <div style="display:flex;gap:32px;align-items:center;">
                    <a href="#" style="color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;">Home</a>
                    <a href="#" style="color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;">About</a>
                    <a href="#" style="color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;">Services</a>
                    <a href="#" style="color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;">Contact</a>
                    <a href="#" style="display:inline-block;padding:8px 20px;background:#4f46e5;color:white;border-radius:6px;font-weight:500;text-decoration:none;font-size:14px;">Sign Up</a>
                </div>
            </nav>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>`,
        });

        bm.add('footer', {
            label: 'Footer',
            category: 'Sections',
            content: `<footer style="padding:60px 40px;background:#111827;color:#9ca3af;text-align:center;">
                <div style="font-size:18px;font-weight:600;color:white;margin-bottom:16px;">PageCrafter</div>
                <p style="font-size:14px;margin-bottom:24px;">Build beautiful websites without code.</p>
                <div style="display:flex;justify-content:center;gap:24px;margin-bottom:24px;">
                    <a href="#" style="color:#9ca3af;text-decoration:none;font-size:13px;">Privacy</a>
                    <a href="#" style="color:#9ca3af;text-decoration:none;font-size:13px;">Terms</a>
                    <a href="#" style="color:#9ca3af;text-decoration:none;font-size:13px;">Contact</a>
                </div>
                <p style="font-size:12px;color:#4b5563;">© 2024 PageCrafter. All rights reserved.</p>
            </footer>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 18h12"/></svg>`,
        });

        bm.add('testimonial', {
            label: 'Testimonials',
            category: 'Sections',
            content: `<section style="padding:80px 40px;background:#f8fafc;">
                <h2 style="text-align:center;font-size:32px;font-weight:700;margin-bottom:48px;color:#1a1a1a;">What Our Users Say</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;">
                    <div style="padding:24px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <p style="font-size:14px;color:#4b5563;line-height:1.7;margin-bottom:16px;">"Incredible tool! Built my entire portfolio in just one afternoon. Highly recommend."</p>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;background:#e0e7ff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;color:#4f46e5;">A</div>
                            <div><div style="font-size:14px;font-weight:600;color:#1a1a1a;">Alex Chen</div><div style="font-size:12px;color:#9ca3af;">Designer</div></div>
                        </div>
                    </div>
                    <div style="padding:24px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <p style="font-size:14px;color:#4b5563;line-height:1.7;margin-bottom:16px;">"The drag and drop builder is so intuitive. My clients love the results."</p>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;background:#fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;color:#d97706;">S</div>
                            <div><div style="font-size:14px;font-weight:600;color:#1a1a1a;">Sarah Kim</div><div style="font-size:12px;color:#9ca3af;">Freelancer</div></div>
                        </div>
                    </div>
                    <div style="padding:24px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <p style="font-size:14px;color:#4b5563;line-height:1.7;margin-bottom:16px;">"Switched from Webflow. PageCrafter is faster and more flexible."</p>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;color:#059669;">M</div>
                            <div><div style="font-size:14px;font-weight:600;color:#1a1a1a;">Mike Ross</div><div style="font-size:12px;color:#9ca3af;">Developer</div></div>
                        </div>
                    </div>
                </div>
            </section>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        });

        bm.add('cta-section', {
            label: 'CTA Section',
            category: 'Sections',
            content: `<section style="padding:80px 40px;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;color:white;">
                <h2 style="font-size:36px;font-weight:700;margin-bottom:16px;color:white;">Ready to Get Started?</h2>
                <p style="font-size:18px;opacity:0.9;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;color:rgba(255,255,255,0.9);">Join thousands of creators building amazing websites.</p>
                <div style="display:flex;gap:16px;justify-content:center;">
                    <a href="#" style="display:inline-block;padding:14px 32px;background:white;color:#4f46e5;border-radius:10px;font-weight:600;text-decoration:none;">Start Free Trial</a>
                    <a href="#" style="display:inline-block;padding:14px 32px;background:transparent;color:white;border-radius:10px;font-weight:600;text-decoration:none;border:2px solid rgba(255,255,255,0.3);">Learn More</a>
                </div>
            </section>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        });

        bm.add('pricing-section', {
            label: 'Pricing',
            category: 'Sections',
            content: `<section style="padding:80px 40px;background:#ffffff;">
                <h2 style="text-align:center;font-size:36px;font-weight:700;margin-bottom:12px;color:#1a1a1a;">Simple Pricing</h2>
                <p style="text-align:center;font-size:16px;color:#6b7280;margin-bottom:48px;">Choose the plan that works for you.</p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto;">
                    <div style="padding:32px;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
                        <h3 style="font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:8px;">Starter</h3>
                        <div style="font-size:40px;font-weight:800;color:#1a1a1a;margin-bottom:24px;">$9<span style="font-size:16px;color:#9ca3af;font-weight:400;">/mo</span></div>
                        <div style="font-size:14px;color:#6b7280;line-height:2;">5 Pages<br/>Basic Support<br/>1GB Storage</div>
                        <a href="#" style="display:block;margin-top:24px;padding:12px;background:#f3f4f6;border-radius:8px;color:#1a1a1a;text-decoration:none;font-weight:600;">Get Started</a>
                    </div>
                    <div style="padding:32px;border:2px solid #4f46e5;border-radius:16px;text-align:center;position:relative;background:#fafafe;">
                        <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#4f46e5;color:white;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;">Popular</div>
                        <h3 style="font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:8px;">Pro</h3>
                        <div style="font-size:40px;font-weight:800;color:#1a1a1a;margin-bottom:24px;">$29<span style="font-size:16px;color:#9ca3af;font-weight:400;">/mo</span></div>
                        <div style="font-size:14px;color:#6b7280;line-height:2;">Unlimited Pages<br/>Priority Support<br/>10GB Storage</div>
                        <a href="#" style="display:block;margin-top:24px;padding:12px;background:#4f46e5;border-radius:8px;color:white;text-decoration:none;font-weight:600;">Get Started</a>
                    </div>
                    <div style="padding:32px;border:1px solid #e5e7eb;border-radius:16px;text-align:center;">
                        <h3 style="font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:8px;">Enterprise</h3>
                        <div style="font-size:40px;font-weight:800;color:#1a1a1a;margin-bottom:24px;">$99<span style="font-size:16px;color:#9ca3af;font-weight:400;">/mo</span></div>
                        <div style="font-size:14px;color:#6b7280;line-height:2;">Everything in Pro<br/>Dedicated Support<br/>Unlimited Storage</div>
                        <a href="#" style="display:block;margin-top:24px;padding:12px;background:#f3f4f6;border-radius:8px;color:#1a1a1a;text-decoration:none;font-weight:600;">Contact Sales</a>
                    </div>
                </div>
            </section>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        });

        // Form elements
        bm.add('form', {
            label: 'Form',
            category: 'Forms',
            content: `<form style="max-width:500px;padding:32px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px;">Name</label>
                    <input type="text" placeholder="Your name" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"/>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px;">Email</label>
                    <input type="email" placeholder="your@email.com" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"/>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px;">Message</label>
                    <textarea placeholder="Your message..." style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;min-height:100px;box-sizing:border-box;resize:vertical;"></textarea>
                </div>
                <button type="submit" style="width:100%;padding:12px;background:#4f46e5;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Send Message</button>
            </form>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h6"/></svg>`,
        });

        bm.add('input', {
            label: 'Input',
            category: 'Forms',
            content: '<input type="text" placeholder="Enter text..." style="padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box;"/>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h2"/></svg>`,
        });

        bm.add('textarea', {
            label: 'Textarea',
            category: 'Forms',
            content: '<textarea placeholder="Enter your text..." style="padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;width:100%;min-height:100px;box-sizing:border-box;resize:vertical;"></textarea>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4"/><path d="M7 11h10"/><path d="M7 15h8"/></svg>`,
        });

        bm.add('select', {
            label: 'Select',
            category: 'Forms',
            content: `<select style="padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box;background:white;cursor:pointer;">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
            </select>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="18" height="10" rx="2"/><polyline points="8 12 12 16 16 12"/></svg>`,
        });

        // Extra blocks
        bm.add('divider', {
            label: 'Divider',
            category: 'Basic',
            content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12h18"/></svg>`,
        });

        bm.add('spacer', {
            label: 'Spacer',
            category: 'Basic',
            content: '<div style="height:60px;"></div>',
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14"/><path d="M5 5h14"/><path d="M5 19h14"/></svg>`,
        });

        bm.add('list', {
            label: 'List',
            category: 'Basic',
            content: `<ul style="padding-left:20px;font-size:15px;line-height:2;color:#374151;">
                <li>First item</li>
                <li>Second item</li>
                <li>Third item</li>
            </ul>`,
            media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>`,
        });

        // Listen for component selection
        editor.on('component:selected', (component: any) => {
            if (component) {
                setSelectedComponent(component.getId());
            }
        });

        editor.on('component:deselected', () => {
            setSelectedComponent(null);
        });

        editorRef.current = editor;
        setEditorReady(true);

        return () => {
            editor.destroy();
            editorRef.current = null;
        };
    }, []);

    const handleDeviceChange = (device: string) => {
        if (editorRef.current) {
            editorRef.current.setDevice(device);
        }
    };

    const handleUndo = () => editorRef.current?.UndoManager.undo();
    const handleRedo = () => editorRef.current?.UndoManager.redo();

    const handleClearCanvas = () => {
        if (editorRef.current) {
            editorRef.current.DomComponents.clear();
            editorRef.current.CssComposer.clear();
        }
    };

    const handlePreview = () => {
        if (editorRef.current) {
            const isRunning = editorRef.current.Commands.isActive('preview');
            if (isRunning) {
                editorRef.current.Commands.stop('preview');
            } else {
                editorRef.current.Commands.run('preview');
            }
        }
    };

    const handleFullscreen = () => {
        if (editorRef.current) {
            const isRunning = editorRef.current.Commands.isActive('fullscreen');
            if (isRunning) {
                editorRef.current.Commands.stop('fullscreen');
            } else {
                editorRef.current.Commands.run('fullscreen');
            }
        }
    };

    const handleExportCode = () => {
        if (editorRef.current) {
            const html = editorRef.current.getHtml();
            const css = editorRef.current.getCss();
            const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PageCrafter Export</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
</body>
</html>`;
            const blob = new Blob([fullCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pagecrafter-export.html';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="studio-container">
            {/* Top Toolbar */}
            <div className="studio-toolbar">
                <div className="toolbar-left">
                    <div className="studio-logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M12 3L2 12l10 9 10-9-10-9z"></path>
                            <path d="M2 12h20"></path>
                            <path d="M12 3v18"></path>
                        </svg>
                        <span className="logo-text">PageCrafter Studio</span>
                    </div>

                    <div className="toolbar-divider"></div>

                    {/* Undo/Redo */}
                    <button className="toolbar-icon-btn" onClick={handleUndo} title="Undo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                    </button>
                    <button className="toolbar-icon-btn" onClick={handleRedo} title="Redo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                    </button>
                </div>

                <div className="toolbar-center">
                    {/* Device Switcher */}
                    <div className="device-switcher">
                        <button
                            className="device-btn"
                            onClick={() => handleDeviceChange('Desktop')}
                            title="Desktop"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </button>
                        <button
                            className="device-btn"
                            onClick={() => handleDeviceChange('Tablet')}
                            title="Tablet"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                        </button>
                        <button
                            className="device-btn"
                            onClick={() => handleDeviceChange('Mobile')}
                            title="Mobile"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="toolbar-right">
                    <button className="toolbar-icon-btn" onClick={handleClearCanvas} title="Clear Canvas">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    <button className="toolbar-action-btn secondary" onClick={handlePreview}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview
                    </button>
                    <button className="toolbar-action-btn primary" onClick={handleExportCode}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Export
                    </button>
                    <button className="toolbar-action-btn publish" onClick={handleFullscreen}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginRight: '4px' }}>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                        Fullscreen
                    </button>
                </div>
            </div>

            {/* Main Studio Layout */}
            <div className="studio-layout">
                {/* Left Panel */}
                <div className="studio-panel left-panel">
                    {/* Vertical Icon Sidebar */}
                    <div className="components-sidebar">
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'blocks' ? 'active' : ''}`}
                            title="Blocks"
                            onClick={() => setActivePanel('blocks')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'layers' ? 'active' : ''}`}
                            title="Layers"
                            onClick={() => setActivePanel('layers')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'styles' ? 'active' : ''}`}
                            title="Styles"
                            onClick={() => setActivePanel('styles')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                                <path d="M2 2l7.586 7.586"></path>
                                <circle cx="11" cy="11" r="2"></circle>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'traits' ? 'active' : ''}`}
                            title="Settings"
                            onClick={() => setActivePanel('traits')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Panel Content */}
                    <div className="left-panel-content">
                        {/* Blocks Panel */}
                        <div id="gjs-blocks" className="gjs-panel-content" style={{ display: activePanel === 'blocks' ? 'block' : 'none' }}></div>

                        {/* Layers Panel */}
                        <div id="gjs-layers" className="gjs-panel-content" style={{ display: activePanel === 'layers' ? 'block' : 'none' }}></div>

                        {/* Styles Panel */}
                        <div id="gjs-styles" className="gjs-panel-content" style={{ display: activePanel === 'styles' ? 'block' : 'none' }}></div>

                        {/* Traits Panel */}
                        <div id="gjs-traits" className="gjs-panel-content" style={{ display: activePanel === 'traits' ? 'block' : 'none' }}></div>
                    </div>
                </div>

                {/* Center Panel - GrapesJS Editor Canvas */}
                <div className="studio-canvas">
                    <div id="gjs-editor"></div>
                </div>
            </div>
        </div>
    );
}
