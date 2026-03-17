'use client';

import { useEffect, useRef, useState } from 'react';

interface GrapesEditorProps {
  html: string;
  css: string;
  onClose: () => void;
  onSave: (html: string, css: string) => void;
}

type LeftTab = 'blocks' | 'layers' | 'traits';
type RightTab = 'styles' | 'selector';

export default function GrapesEditor({ html, css, onClose, onSave }: GrapesEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('blocks');
  const [rightTab, setRightTab] = useState<RightTab>('styles');
  const [device, setDevice] = useState<'Desktop' | 'Tablet' | 'Mobile'>('Desktop');

  useEffect(() => {
    if (!containerRef.current) return;

    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default;

      // GrapesJS CSS via CDN
      if (!document.getElementById('grapesjs-css')) {
        const link = document.createElement('link');
        link.id = 'grapesjs-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        document.head.appendChild(link);
      }

      const editor = grapesjs.init({
        container: containerRef.current!,
        height: '100%',
        width: '100%',
        storageManager: false,
        fromElement: false,
        dragMode: 'absolute',
        // Disable default panels — we manage everything via React
        panels: { defaults: [] },
        canvas: {
          styles: [
            'body{margin:0;min-height:100vh;position:relative;}',
            '*{box-sizing:border-box;}',
          ],
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px', widthMedia: '992px' },
            { name: 'Mobile', width: '375px', widthMedia: '480px' },
          ],
        },
        blockManager: {
          appendTo: '#gjs-blocks-panel',
          blocks: [
            {
              id: 'navbar',
              label: 'Navbar',
              category: 'Layout',
              attributes: { class: 'gjs-block-section' },
              content: `<nav class="gjs-navbar"><a href="#" class="gjs-brand">Brand</a><div class="gjs-nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Services</a><a href="#">Contact</a></div></nav>`,
            },
            {
              id: 'hero',
              label: 'Hero',
              category: 'Sections',
              content: `<section class="gjs-hero"><h1 class="gjs-hero-title">Hero Headline</h1><p class="gjs-hero-sub">Your compelling subtitle goes here.</p><a href="#" class="gjs-btn-primary">Get Started</a></section>`,
            },
            {
              id: 'section',
              label: 'Section',
              category: 'Sections',
              content: `<section class="gjs-section"><div class="gjs-container"><h2 class="gjs-section-title">Section Title</h2><p class="gjs-section-text">Section content goes here. Add your description.</p></div></section>`,
            },
            {
              id: 'two-cols',
              label: '2 Columns',
              category: 'Layout',
              content: `<div class="gjs-two-cols"><div class="gjs-col"><h3>Column One</h3><p>Content for column one.</p></div><div class="gjs-col"><h3>Column Two</h3><p>Content for column two.</p></div></div>`,
            },
            {
              id: 'three-cols',
              label: '3 Columns',
              category: 'Layout',
              content: `<div class="gjs-three-cols"><div class="gjs-card"><span class="gjs-card-icon">✨</span><h3>Feature One</h3><p>Feature description here.</p></div><div class="gjs-card"><span class="gjs-card-icon">🚀</span><h3>Feature Two</h3><p>Feature description here.</p></div><div class="gjs-card"><span class="gjs-card-icon">💡</span><h3>Feature Three</h3><p>Feature description here.</p></div></div>`,
            },
            {
              id: 'text-block',
              label: 'Text',
              category: 'Basic',
              content: { type: 'text', content: 'Insert your text here', style: { padding: '16px', 'font-size': '1rem', 'line-height': '1.7', color: '#374151' } },
              activate: true,
            },
            {
              id: 'heading',
              label: 'Heading',
              category: 'Basic',
              content: '<h2 style="font-size:2rem;font-weight:700;color:#111827;padding:8px 0;">Your Heading</h2>',
            },
            {
              id: 'button',
              label: 'Button',
              category: 'Basic',
              content: '<a href="#" class="gjs-btn-primary">Click Me</a>',
            },
            {
              id: 'button-outline',
              label: 'Button Outline',
              category: 'Basic',
              content: '<a href="#" class="gjs-btn-outline">Learn More</a>',
            },
            {
              id: 'image',
              label: 'Image',
              category: 'Basic',
              content: { type: 'image', style: { width: '100%', 'border-radius': '12px', display: 'block' } },
              activate: true,
            },
            {
              id: 'divider',
              label: 'Divider',
              category: 'Basic',
              content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />',
            },
            {
              id: 'pricing-card',
              label: 'Pricing Card',
              category: 'Sections',
              content: `<div class="gjs-pricing"><div class="gjs-price-card"><h3 class="gjs-price-name">Starter</h3><div class="gjs-price-amount">$9<span>/mo</span></div><ul class="gjs-price-features"><li>✓ Feature One</li><li>✓ Feature Two</li><li>✓ Feature Three</li></ul><a href="#" class="gjs-btn-primary">Get Started</a></div><div class="gjs-price-card featured"><h3 class="gjs-price-name">Pro</h3><div class="gjs-price-amount">$29<span>/mo</span></div><ul class="gjs-price-features"><li>✓ Everything in Starter</li><li>✓ Advanced Feature</li><li>✓ Priority Support</li></ul><a href="#" class="gjs-btn-white">Get Pro</a></div></div>`,
            },
            {
              id: 'testimonial',
              label: 'Testimonial',
              category: 'Sections',
              content: `<div class="gjs-testimonial"><p class="gjs-quote">"This product completely changed the way we work. Highly recommended!"</p><div class="gjs-testimonial-author"><div class="gjs-author-avatar">JD</div><div><strong>Jane Doe</strong><span>CEO, Company</span></div></div></div>`,
            },
            {
              id: 'footer',
              label: 'Footer',
              category: 'Layout',
              content: `<footer class="gjs-footer"><div class="gjs-footer-inner"><p class="gjs-footer-brand">Brand</p><div class="gjs-footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></div><p class="gjs-footer-copy">© 2024 Brand. All rights reserved.</p></div></footer>`,
            },
          ],
        },
        styleManager: {
          appendTo: '#gjs-styles-panel',
          sectors: [
            {
              name: 'Layout',
              open: true,
              properties: [
                { name: 'Display', property: 'display', type: 'select', options: [{ id: 'block' }, { id: 'flex' }, { id: 'grid' }, { id: 'inline' }, { id: 'inline-block' }, { id: 'none' }] },
                { name: 'Width', property: 'width' },
                { name: 'Height', property: 'height' },
                { name: 'Max Width', property: 'max-width' },
              ],
            },
            {
              name: 'Spacing',
              open: false,
              properties: ['margin', 'padding'],
            },
            {
              name: 'Typography',
              open: false,
              properties: [
                { name: 'Font Size', property: 'font-size' },
                { name: 'Font Weight', property: 'font-weight', type: 'select', options: [{ id: '300', label: 'Light' }, { id: '400', label: 'Regular' }, { id: '500', label: 'Medium' }, { id: '600', label: 'Semibold' }, { id: '700', label: 'Bold' }, { id: '800', label: 'Extrabold' }] },
                { name: 'Line Height', property: 'line-height' },
                { name: 'Text Align', property: 'text-align', type: 'radio', options: [{ id: 'left', label: '←' }, { id: 'center', label: '≡' }, { id: 'right', label: '→' }] },
                { name: 'Color', property: 'color', type: 'color' },
              ],
            },
            {
              name: 'Background',
              open: false,
              properties: [
                { name: 'Background Color', property: 'background-color', type: 'color' },
              ],
            },
            {
              name: 'Border',
              open: false,
              properties: [
                { name: 'Border Radius', property: 'border-radius' },
                { name: 'Box Shadow', property: 'box-shadow' },
              ],
            },
          ],
        },
        layerManager: {
          appendTo: '#gjs-layers-panel',
        },
        traitManager: {
          appendTo: '#gjs-traits-panel',
        },
        selectorManager: {
          appendTo: '#gjs-selector-panel',
        },
      });

      // ─── Add traits for links & button elements so users can edit href ───
      editor.DomComponents.addType('link', {
        isComponent: (el: HTMLElement) => el.tagName === 'A',
        model: {
          defaults: {
            tagName: 'a',
            traits: [
              { name: 'href', label: 'URL / Link', placeholder: 'https://' },
              { name: 'target', label: 'Open in', type: 'select', options: [{ id: '_self', name: 'Same Tab' }, { id: '_blank', name: 'New Tab' }] },
              { name: 'title', label: 'Tooltip Text' },
              { name: 'rel', label: 'Rel', placeholder: 'noopener noreferrer' },
            ],
          },
        },
      });

      // Ensure image type has alt + src traits
      editor.DomComponents.addType('image', {
        isComponent: (el: HTMLElement) => el.tagName === 'IMG',
        model: {
          defaults: {
            tagName: 'img',
            traits: [
              { name: 'src', label: 'Image URL' },
              { name: 'alt', label: 'Alt Text' },
            ],
          },
        },
      });

      // Load AI-generated content
      editor.setComponents(html || '<p style="padding:40px;color:#374151;">Your AI-generated website will appear here. Start by chatting with the AI!</p>');
      editor.setStyle(css || '');

      // Ensure the canvas body is a solid drop target for absolute positioning
      editor.on('load', () => {
        const body = editor.Canvas.getBody();
        if (body) {
          body.style.minHeight = '100vh';
          body.style.position = 'relative';
          body.style.margin = '0';
        }
      });

      // Inject default styles for block shortcuts
      editor.addComponents(`<style>
        .gjs-navbar{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;background:#fff;border-bottom:1px solid #e5e7eb;}
        .gjs-brand{font-size:1.4rem;font-weight:800;color:#4f46e5;text-decoration:none;}
        .gjs-nav-links{display:flex;gap:28px;}
        .gjs-nav-links a{color:#374151;font-weight:600;text-decoration:none;font-size:.95rem;}
        .gjs-hero{padding:120px 40px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:white;text-align:center;}
        .gjs-hero-title{font-size:3.5rem;font-weight:800;margin-bottom:20px;}
        .gjs-hero-sub{font-size:1.2rem;opacity:.9;max-width:600px;margin:0 auto 36px;}
        .gjs-btn-primary{display:inline-block;background:white;color:#4f46e5;padding:14px 36px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
        .gjs-btn-outline{display:inline-block;border:2px solid #4f46e5;color:#4f46e5;padding:12px 32px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
        .gjs-btn-white{display:inline-block;background:white;color:#111827;padding:14px 36px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
        .gjs-section{padding:80px 40px;background:#f8fafc;}
        .gjs-container{max-width:1100px;margin:0 auto;}
        .gjs-section-title{font-size:2.2rem;font-weight:700;margin-bottom:16px;color:#111827;}
        .gjs-section-text{font-size:1rem;color:#64748b;line-height:1.7;}
        .gjs-two-cols{display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:60px 40px;}
        .gjs-col{padding:24px;}
        .gjs-three-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:60px 40px;}
        .gjs-card{padding:28px;background:white;border-radius:16px;border:1px solid #e5e7eb;text-align:center;}
        .gjs-card-icon{font-size:2.5rem;display:block;margin-bottom:12px;}
        .gjs-pricing{display:flex;gap:24px;padding:60px 40px;justify-content:center;}
        .gjs-price-card{padding:36px;background:white;border-radius:20px;border:1px solid #e5e7eb;text-align:center;min-width:220px;}
        .gjs-price-card.featured{background:linear-gradient(135deg,#4f46e5,#6366f1);color:white;border:none;}
        .gjs-price-name{font-size:1.1rem;font-weight:700;margin-bottom:16px;}
        .gjs-price-amount{font-size:2.5rem;font-weight:800;margin-bottom:20px;}
        .gjs-price-amount span{font-size:1rem;font-weight:400;opacity:.7;}
        .gjs-price-features{list-style:none;padding:0;margin:0 0 24px;text-align:left;}
        .gjs-price-features li{padding:6px 0;font-size:.9rem;}
        .gjs-testimonial{background:#f8fafc;border-radius:20px;padding:48px;max-width:700px;margin:40px auto;text-align:center;}
        .gjs-quote{font-size:1.2rem;color:#374151;line-height:1.7;font-style:italic;margin-bottom:24px;}
        .gjs-testimonial-author{display:flex;align-items:center;gap:16px;justify-content:center;}
        .gjs-author-avatar{width:48px;height:48px;border-radius:50%;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;}
        .gjs-footer{background:#111827;color:#9ca3af;padding:60px 40px;}
        .gjs-footer-inner{max-width:1100px;margin:0 auto;text-align:center;}
        .gjs-footer-brand{font-size:1.4rem;font-weight:800;color:white;margin-bottom:20px;}
        .gjs-footer-links{display:flex;gap:24px;justify-content:center;margin-bottom:20px;}
        .gjs-footer-links a{color:#9ca3af;text-decoration:none;font-size:.9rem;}
        .gjs-footer-copy{font-size:.85rem;}
      </style>`, { at: 0 });

      editorRef.current = editor;
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const editor = editorRef.current;
    if (!editor) return;
    // Get all components HTML minus the style component we injected
    const savedHtml = editor.getHtml();
    const savedCss = editor.getCss();
    onSave(savedHtml, savedCss);
  };

  const switchDevice = (d: 'Desktop' | 'Tablet' | 'Mobile') => {
    setDevice(d);
    editorRef.current?.setDevice(d);
  };

  const TAB_ICONS = {
    blocks: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    layers: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    traits: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a2 2 0 0 1 0 2.83L4.93 19.07a2 2 0 0 1-2.83-2.83L16.24 2.1a2 2 0 0 1 2.83 2.83z"/>
      </svg>
    ),
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0e14', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52, background: '#0d0e14', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, gap: 12 }}>

        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Visual Editor</div>
            <div style={{ color: '#6b7280', fontSize: 10 }}>Powered by GrapesJS</div>
          </div>
        </div>

        {/* Center: Device switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '3px' }}>
          {(['Desktop', 'Tablet', 'Mobile'] as const).map((d) => {
            const icons: Record<string, any> = {
              Desktop: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
              Tablet: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
              Mobile: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
            };
            return (
              <button key={d} onClick={() => switchDevice(d)} title={d} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all .15s', background: device === d ? 'rgba(99,102,241,0.2)' : 'transparent', color: device === d ? '#818cf8' : '#6b7280' }}>
                {icons[d]} {d}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => editorRef.current?.UndoManager.undo()} title="Undo (Ctrl+Z)" style={{ ...btnStyle }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
            Undo
          </button>
          <button onClick={() => editorRef.current?.UndoManager.redo()} title="Redo (Ctrl+Y)" style={{ ...btnStyle }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>
            Redo
          </button>

          <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />

          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save Changes
          </button>

          <button onClick={onClose} title="Discard & Close" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Discard
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT PANEL */}
        <div style={{ width: 240, background: '#0d0e14', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {(['blocks', 'layers', 'traits'] as LeftTab[]).map((tab) => (
              <button key={tab} onClick={() => setLeftTab(tab)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 9px', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all .15s', background: leftTab === tab ? 'rgba(99,102,241,0.08)' : 'transparent', color: leftTab === tab ? '#818cf8' : '#4b5563', borderBottom: leftTab === tab ? '2px solid #6366f1' : '2px solid transparent' }}>
                {TAB_ICONS[tab]}
                {tab}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflow: 'auto' }} className="gjs-custom-scrollbar">
            <div id="gjs-blocks-panel" style={{ display: leftTab === 'blocks' ? 'block' : 'none' }} />
            <div id="gjs-layers-panel" style={{ display: leftTab === 'layers' ? 'block' : 'none' }} />
            <div id="gjs-traits-panel" style={{ display: leftTab === 'traits' ? 'block' : 'none' }} />
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1a1c23' }}>
          <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
        </div>

        {/* RIGHT PANEL — Styles + Selector */}
        <div style={{ width: 248, background: '#0d0e14', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {(['styles', 'selector'] as RightTab[]).map((tab) => (
              <button key={tab} onClick={() => setRightTab(tab)} style={{ flex: 1, padding: '10px 4px 9px', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all .15s', background: rightTab === tab ? 'rgba(99,102,241,0.08)' : 'transparent', color: rightTab === tab ? '#818cf8' : '#4b5563', borderBottom: rightTab === tab ? '2px solid #6366f1' : '2px solid transparent' }}>
                {tab === 'styles' ? 'Styles' : 'Classes'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto' }} className="gjs-custom-scrollbar">
            <div id="gjs-styles-panel" style={{ display: rightTab === 'styles' ? 'block' : 'none' }} />
            <div id="gjs-selector-panel" style={{ display: rightTab === 'selector' ? 'block' : 'none' }} />
          </div>
        </div>
      </div>

      {/* ── GLOBAL STYLES (GrapesJS dark theme overrides) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Scrollbar */
        .gjs-custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .gjs-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gjs-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* Core GrapesJS color overrides */
        .gjs-one-bg { background-color: #0d0e14 !important; }
        .gjs-two-bg { background-color: #141620 !important; }
        .gjs-three-bg { background-color: #0a0b10 !important; }
        .gjs-four-bg { background-color: #1e2030 !important; }
        .gjs-color-warn { color: #f59e0b !important; }
        .gjs-color-active { color: #818cf8 !important; }
        .gjs-color-highlight { color: #818cf8 !important; }

        /* Blocks */
        #gjs-blocks-panel .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
          padding: 10px !important;
        }
        #gjs-blocks-panel .gjs-block-category .gjs-title {
          background: transparent !important;
          color: #6b7280 !important;
          font-size: 9px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: .08em !important;
          padding: 12px 10px 6px !important;
          border: none !important;
          border-top: 1px solid rgba(255,255,255,0.06) !important;
        }
        .gjs-block {
          border: 1px solid rgba(255,255,255,0.07) !important;
          border-radius: 8px !important;
          background: rgba(255,255,255,0.02) !important;
          color: #9ca3af !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          padding: 10px 6px !important;
          transition: all .15s !important;
          text-align: center !important;
          cursor: grab !important;
        }
        .gjs-block:hover {
          border-color: rgba(99,102,241,0.4) !important;
          background: rgba(99,102,241,0.08) !important;
          color: #c7d2fe !important;
        }
        .gjs-block__media { margin-bottom: 6px !important; font-size: 18px !important; }

        /* Style Manager */
        .gjs-sm-sector-title {
          background: transparent !important;
          color: #6b7280 !important;
          font-size: 9px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: .08em !important;
          padding: 11px 12px !important;
          border: none !important;
          border-top: 1px solid rgba(255,255,255,0.05) !important;
          cursor: pointer !important;
        }
        .gjs-sm-sector-title:hover { color: #9ca3af !important; }
        .gjs-sm-properties { padding: 6px 10px 10px !important; }
        .gjs-sm-field-wrp { margin-bottom: 8px !important; }
        .gjs-sm-label { color: #6b7280 !important; font-size: 10px !important; font-weight: 600 !important; margin-bottom: 4px !important; }
        .gjs-sm-field input,
        .gjs-sm-field select,
        .gjs-sm-field textarea {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 6px !important;
          color: #d1d5db !important;
          font-size: 11px !important;
          padding: 6px 8px !important;
          transition: border .15s !important;
        }
        .gjs-sm-field input:focus,
        .gjs-sm-field select:focus {
          border-color: rgba(99,102,241,0.5) !important;
          outline: none !important;
        }
        .gjs-clm-close,
        .gjs-sm-btn,
        .gjs-add-traitsBtn {
          background: rgba(99,102,241,0.15) !important;
          color: #818cf8 !important;
          border: none !important;
          border-radius: 6px !important;
        }

        /* Layers */
        .gjs-layer-name { color: #d1d5db !important; font-size: 11px !important; font-weight: 500 !important; }
        .gjs-layer { border-bottom: 1px solid rgba(255,255,255,0.04) !important; background: transparent !important; }
        .gjs-layer:hover, .gjs-layer.gjs-selected { background: rgba(99,102,241,0.07) !important; }
        .gjs-layer-vis { color: #6b7280 !important; }
        .gjs-layer__icon { color: #818cf8 !important; }
        .gjs-layers #gjs-layers__wrapper { background: transparent !important; }

        /* Traits */
        .gjs-trt-trait { padding: 8px 12px !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; }
        .gjs-trt-trait__label { color: #6b7280 !important; font-size: 10px !important; font-weight: 600 !important; margin-bottom: 4px !important; display: block !important; }
        .gjs-trt-trait input,
        .gjs-trt-trait select {
          width: 100% !important;
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 6px !important;
          color: #d1d5db !important;
          font-size: 11px !important;
          padding: 6px 8px !important;
          box-sizing: border-box !important;
        }
        .gjs-trt-trait input:focus { border-color: rgba(99,102,241,0.5) !important; outline: none !important; }
        .gjs-no-select-component { color: #4b5563 !important; font-size: 11px !important; text-align: center !important; padding: 24px 16px !important; }

        /* Selector manager */
        .gjs-clm-tags { padding: 8px 10px !important; }
        .gjs-clm-tag { background: rgba(99,102,241,0.15) !important; border: 1px solid rgba(99,102,241,0.25) !important; border-radius: 5px !important; color: #c7d2fe !important; font-size: 10px !important; }

        /* Canvas */
        .gjs-cv-canvas { background: #1a1c23 !important; }
        .gjs-frame-wrapper { padding: 0 !important; }
        .gjs-cv-canvas__frames iframe { border-radius: 8px !important; box-shadow: 0 8px 40px rgba(0,0,0,0.5) !important; }

        /* Selection highlight */
        .gjs-selected { outline: 2px solid #6366f1 !important; outline-offset: 2px !important; }
        .gjs-hovered { outline: 1px dashed rgba(99,102,241,0.5) !important; }

        /* Toolbar (floating on-select) */
        .gjs-toolbar {
          background: #1e2030 !important;
          border-radius: 8px !important;
          border: 1px solid rgba(99,102,241,0.3) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
          padding: 4px !important;
          gap: 2px !important;
        }
        .gjs-toolbar-item {
          color: #9ca3af !important;
          border-radius: 5px !important;
          padding: 4px 6px !important;
          transition: all .1s !important;
        }
        .gjs-toolbar-item:hover { background: rgba(99,102,241,0.15) !important; color: #818cf8 !important; }

        /* Resizer handles */
        .gjs-resizer-h { background: #6366f1 !important; border-radius: 2px !important; }
        .gjs-resizer-h:hover { background: #818cf8 !important; }

        /* Placeholder / drop zone */
        .gjs-placeholder { background: rgba(99,102,241,0.15) !important; border: 2px dashed #6366f1 !important; border-radius: 4px !important; }

        /* Badge (element type indicator) */
        .gjs-badge { background: #6366f1 !important; border-radius: 4px !important; font-size: 10px !important; font-weight: 600 !important; }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  padding: '7px 11px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8,
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  transition: 'all .15s',
};
