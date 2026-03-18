'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface GrapesEditorProps {
  html: string;
  css: string;
  onClose: () => void;
  onSave: (html: string, css: string) => void;
}

type LeftTab = 'blocks' | 'layers' | 'traits';
type RightTab = 'styles' | 'selector';

const DEFAULT_BLOCK_STYLES = `
.gjs-navbar{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;background:#fff;border-bottom:1px solid #e5e7eb;}
.gjs-brand{font-size:1.4rem;font-weight:800;color:#4f46e5;text-decoration:none;}
.gjs-nav-links{display:flex;gap:28px;}
.gjs-nav-links a{color:#374151;font-weight:600;text-decoration:none;font-size:.95rem;}
.gjs-hero{padding:120px 40px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:white;text-align:center;}
.gjs-hero-title{font-size:3rem;font-weight:800;margin-bottom:20px;line-height:1.1;}
.gjs-hero-sub{font-size:1.1rem;opacity:.9;max-width:600px;margin:0 auto 36px;}
.gjs-btn-primary{display:inline-block;background:white;color:#4f46e5;padding:14px 32px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
.gjs-btn-outline{display:inline-block;border:2px solid #4f46e5;color:#4f46e5;padding:12px 30px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
.gjs-btn-white{display:inline-block;background:white;color:#111827;padding:14px 32px;border-radius:40px;font-weight:700;text-decoration:none;font-size:1rem;}
.gjs-section{padding:80px 40px;background:#f8fafc;}
.gjs-container{max-width:1100px;margin:0 auto;}
.gjs-section-title{font-size:2rem;font-weight:700;margin-bottom:16px;color:#111827;}
.gjs-section-text{font-size:1rem;color:#64748b;line-height:1.7;}
.gjs-two-cols{display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:60px 40px;}
.gjs-three-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:60px 40px;}
.gjs-card{padding:28px;background:white;border-radius:16px;border:1px solid #e5e7eb;text-align:center;}
.gjs-pricing{display:flex;gap:24px;padding:60px 40px;justify-content:center;flex-wrap:wrap;}
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
@media (max-width: 900px){
  .gjs-navbar,.gjs-hero,.gjs-section,.gjs-two-cols,.gjs-three-cols,.gjs-pricing,.gjs-footer{padding-left:20px;padding-right:20px;}
  .gjs-two-cols,.gjs-three-cols{grid-template-columns:1fr;}
}
`;

export default function GrapesEditor({ html, css, onClose, onSave }: GrapesEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  const [leftTab, setLeftTab] = useState<LeftTab>('blocks');
  const [rightTab, setRightTab] = useState<RightTab>('styles');
  const [device, setDevice] = useState<'Desktop' | 'Tablet' | 'Mobile'>('Desktop');
  const [selectedLabel, setSelectedLabel] = useState('No selection');
  const [isDirty, setIsDirty] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const handleSave = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const savedHtml = editor.getHtml();
    const savedCss = editor.getCss();
    onSave(savedHtml, savedCss);
    setIsDirty(false);
  }, [onSave]);

  const attemptClose = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them and close the editor?')) {
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    const syncViewportMode = () => {
      const compact = window.innerWidth < 1100;
      setIsCompact(compact);
      if (!compact) {
        setShowLeftPanel(false);
        setShowRightPanel(false);
      }
    };

    syncViewportMode();
    window.addEventListener('resize', syncViewportMode);
    return () => window.removeEventListener('resize', syncViewportMode);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        attemptClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [attemptClose, handleSave]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!containerRef.current) return;

    let trackDirty = false;
    let cancelled = false;

    const initEditor = async () => {
      try {
        const grapesjs = (await import('grapesjs')).default;

        if (!document.getElementById('grapesjs-css')) {
          const link = document.createElement('link');
          link.id = 'grapesjs-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
          document.head.appendChild(link);
        }

        if (cancelled || !containerRef.current) return;

        const editor = grapesjs.init({
          container: containerRef.current,
          height: '100%',
          width: '100%',
          storageManager: false,
          fromElement: false,
          panels: { defaults: [] },
          canvas: {
            styles: [
              'body{margin:0;min-height:100vh;position:relative;}*{box-sizing:border-box;}',
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
                content: '<nav class="gjs-navbar"><a href="#" class="gjs-brand">Brand</a><div class="gjs-nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Services</a><a href="#">Contact</a></div></nav>',
              },
              {
                id: 'hero',
                label: 'Hero',
                category: 'Sections',
                content: '<section class="gjs-hero"><h1 class="gjs-hero-title">Hero Headline</h1><p class="gjs-hero-sub">Your compelling subtitle goes here.</p><a href="#" class="gjs-btn-primary">Get Started</a></section>',
              },
              {
                id: 'section',
                label: 'Section',
                category: 'Sections',
                content: '<section class="gjs-section"><div class="gjs-container"><h2 class="gjs-section-title">Section Title</h2><p class="gjs-section-text">Section content goes here. Add your description.</p></div></section>',
              },
              {
                id: 'two-cols',
                label: '2 Columns',
                category: 'Layout',
                content: '<div class="gjs-two-cols"><div><h3>Column One</h3><p>Content for column one.</p></div><div><h3>Column Two</h3><p>Content for column two.</p></div></div>',
              },
              {
                id: 'three-cols',
                label: '3 Columns',
                category: 'Layout',
                content: '<div class="gjs-three-cols"><div class="gjs-card"><h3>Feature One</h3><p>Feature description here.</p></div><div class="gjs-card"><h3>Feature Two</h3><p>Feature description here.</p></div><div class="gjs-card"><h3>Feature Three</h3><p>Feature description here.</p></div></div>',
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
                label: 'Pricing',
                category: 'Sections',
                content: '<div class="gjs-pricing"><div class="gjs-price-card"><h3 class="gjs-price-name">Starter</h3><div class="gjs-price-amount">$9<span>/mo</span></div><ul class="gjs-price-features"><li>&#10003; Feature One</li><li>&#10003; Feature Two</li><li>&#10003; Feature Three</li></ul><a href="#" class="gjs-btn-primary">Get Started</a></div><div class="gjs-price-card featured"><h3 class="gjs-price-name">Pro</h3><div class="gjs-price-amount">$29<span>/mo</span></div><ul class="gjs-price-features"><li>&#10003; Everything in Starter</li><li>&#10003; Advanced Feature</li><li>&#10003; Priority Support</li></ul><a href="#" class="gjs-btn-white">Get Pro</a></div></div>',
              },
              {
                id: 'testimonial',
                label: 'Testimonial',
                category: 'Sections',
                content: '<div class="gjs-testimonial"><p class="gjs-quote">"This product completely changed the way we work. Highly recommended!"</p><div class="gjs-testimonial-author"><div class="gjs-author-avatar">JD</div><div><strong>Jane Doe</strong><span>CEO, Company</span></div></div></div>',
              },
              {
                id: 'footer',
                label: 'Footer',
                category: 'Layout',
                content: '<footer class="gjs-footer"><div class="gjs-footer-inner"><p class="gjs-footer-brand">Brand</p><div class="gjs-footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></div><p class="gjs-footer-copy">&copy; 2026 Brand. All rights reserved.</p></div></footer>',
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
                  { name: 'Text Align', property: 'text-align', type: 'radio', options: [{ id: 'left', label: 'Left' }, { id: 'center', label: 'Center' }, { id: 'right', label: 'Right' }] },
                  { name: 'Color', property: 'color', type: 'color' },
                ],
              },
              {
                name: 'Background',
                open: false,
                properties: [{ name: 'Background Color', property: 'background-color', type: 'color' }],
              },
              {
                name: 'Border',
                open: false,
                properties: [{ name: 'Border Radius', property: 'border-radius' }, { name: 'Box Shadow', property: 'box-shadow' }],
              },
            ],
          },
          layerManager: { appendTo: '#gjs-layers-panel' },
          traitManager: { appendTo: '#gjs-traits-panel' },
          selectorManager: { appendTo: '#gjs-selector-panel' },
        });

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

        editor.setComponents(html || '<p style="padding:40px;color:#374151;">Your AI-generated website will appear here. Start by chatting with AI first.</p>');
        editor.setStyle(`${DEFAULT_BLOCK_STYLES}\n${css || ''}`);

        editor.on('component:selected', (component: any) => {
          const name = component?.getName?.() || component?.get?.('name') || component?.get?.('tagName') || 'Element';
          setSelectedLabel(String(name));
        });

        editor.on('component:deselected', () => setSelectedLabel('No selection'));

        editor.on('update', () => {
          if (trackDirty) setIsDirty(true);
        });

        editor.on('load', () => {
          const body = editor.Canvas.getBody();
          if (body) {
            body.style.minHeight = '100vh';
            body.style.position = 'relative';
            body.style.margin = '0';
          }
        });

        editor.UndoManager.clear();
        setIsDirty(false);
        editorRef.current = editor;
        setIsReady(true);

        window.setTimeout(() => {
          trackDirty = true;
        }, 0);
      } catch (error) {
        console.error('Failed to initialize GrapesJS editor:', error);
        setInitError('Unable to load the visual editor. Please refresh and try again.');
      }
    };

    initEditor();

    return () => {
      cancelled = true;
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [css, html]);

  const switchDevice = (d: 'Desktop' | 'Tablet' | 'Mobile') => {
    setDevice(d);
    editorRef.current?.setDevice(d);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0e14', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', minHeight: 56, background: '#0d0e14', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Visual Editor</div>
            <div style={{ color: '#6b7280', fontSize: 11 }}>{isDirty ? 'Unsaved changes' : 'All changes saved'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
          {(['Desktop', 'Tablet', 'Mobile'] as const).map((d) => (
            <button key={d} onClick={() => switchDevice(d)} title={d} style={{ ...segmentButtonStyle, background: device === d ? 'rgba(99,102,241,0.2)' : 'transparent', color: device === d ? '#818cf8' : '#9ca3af' }}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isCompact && (
            <>
              <button aria-label="Toggle left panel" onClick={() => { setShowLeftPanel((prev) => !prev); setShowRightPanel(false); }} style={btnStyle}>Blocks</button>
              <button aria-label="Toggle right panel" onClick={() => { setShowRightPanel((prev) => !prev); setShowLeftPanel(false); }} style={btnStyle}>Styles</button>
            </>
          )}
          <button onClick={() => editorRef.current?.UndoManager.undo()} title="Undo (Ctrl/Cmd+Z)" style={btnStyle}>Undo</button>
          <button onClick={() => editorRef.current?.UndoManager.redo()} title="Redo (Shift+Ctrl/Cmd+Z)" style={btnStyle}>Redo</button>
          <button onClick={handleSave} style={{ ...btnStyle, color: 'white', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none' }}>Save</button>
          <button onClick={attemptClose} title="Discard and close" style={{ ...btnStyle, color: '#fca5a5', borderColor: 'rgba(239,68,68,0.28)' }}>Close</button>
        </div>
      </div>

      <div style={{ minHeight: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', color: '#94a3b8', fontSize: 12 }}>
        <span>Selected: <strong style={{ color: '#dbeafe', fontWeight: 600 }}>{selectedLabel}</strong></span>
        <span>Tip: Drag blocks into the canvas, then style from the right panel.</span>
      </div>

      {initError ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5', padding: 24 }}>{initError}</div>
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              ...panelBaseStyle,
              width: 260,
              borderRight: '1px solid rgba(255,255,255,0.06)',
              transform: isCompact ? (showLeftPanel ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
              position: isCompact ? 'absolute' : 'relative',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 25,
              boxShadow: isCompact && showLeftPanel ? '0 0 30px rgba(0,0,0,0.45)' : 'none',
            }}
          >
            <div style={tabRowStyle}>
              {(['blocks', 'layers', 'traits'] as LeftTab[]).map((tab) => (
                <button key={tab} onClick={() => setLeftTab(tab)} style={{ ...tabButtonStyle, ...(leftTab === tab ? activeTabButtonStyle : {}) }}>{tab}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }} className="gjs-custom-scrollbar">
              <div id="gjs-blocks-panel" style={{ display: leftTab === 'blocks' ? 'block' : 'none' }} />
              <div id="gjs-layers-panel" style={{ display: leftTab === 'layers' ? 'block' : 'none' }} />
              <div id="gjs-traits-panel" style={{ display: leftTab === 'traits' ? 'block' : 'none' }} />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1a1c23' }}>
            {!isReady && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', background: 'rgba(13,14,20,0.85)' }}>
                Loading visual editor...
              </div>
            )}
            <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
          </div>

          <div
            style={{
              ...panelBaseStyle,
              width: 272,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              transform: isCompact ? (showRightPanel ? 'translateX(0)' : 'translateX(100%)') : 'translateX(0)',
              position: isCompact ? 'absolute' : 'relative',
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 25,
              boxShadow: isCompact && showRightPanel ? '0 0 30px rgba(0,0,0,0.45)' : 'none',
            }}
          >
            <div style={tabRowStyle}>
              {(['styles', 'selector'] as RightTab[]).map((tab) => (
                <button key={tab} onClick={() => setRightTab(tab)} style={{ ...tabButtonStyle, ...(rightTab === tab ? activeTabButtonStyle : {}) }}>
                  {tab === 'styles' ? 'styles' : 'classes'}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }} className="gjs-custom-scrollbar">
              <div id="gjs-styles-panel" style={{ display: rightTab === 'styles' ? 'block' : 'none' }} />
              <div id="gjs-selector-panel" style={{ display: rightTab === 'selector' ? 'block' : 'none' }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .gjs-custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .gjs-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gjs-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 6px; }

        .gjs-one-bg { background-color: #0d0e14 !important; }
        .gjs-two-bg { background-color: #141620 !important; }
        .gjs-three-bg { background-color: #0a0b10 !important; }
        .gjs-four-bg { background-color: #1e2030 !important; }
        .gjs-color-active { color: #818cf8 !important; }
        .gjs-color-highlight { color: #818cf8 !important; }

        #gjs-blocks-panel .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          padding: 10px !important;
        }

        .gjs-block {
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          background: rgba(255,255,255,0.03) !important;
          color: #cbd5e1 !important;
          font-size: 30px !important;
          font-weight: 600 !important;
          padding: 10px 8px !important;
          transition: all .15s !important;
          width: 100px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .gjs-block-label { 
          font-size: 13px !important;
        }

        .gjs-block:hover {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(99,102,241,0.12) !important;
        }

        .gjs-sm-label, .gjs-trt-trait__label { color: #94a3b8 !important; font-size: 11px !important; }
        .gjs-sm-field input, .gjs-sm-field select, .gjs-sm-field textarea,
        .gjs-trt-trait input, .gjs-trt-trait select {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 7px 8px !important;
        }

        .gjs-cv-canvas { background: #1a1c23 !important; }
        .gjs-cv-canvas__frames iframe { border-radius: 8px !important; box-shadow: 0 10px 30px rgba(0,0,0,.45) !important; }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '7px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};

const segmentButtonStyle: React.CSSProperties = {
  border: 'none',
  cursor: 'pointer',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  transition: 'all .15s',
};

const panelBaseStyle: React.CSSProperties = {
  background: '#0d0e14',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  transition: 'transform .2s ease',
};

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
};

const tabButtonStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  cursor: 'pointer',
  padding: '10px 8px',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  fontSize: 10,
  fontWeight: 700,
  color: '#6b7280',
  background: 'transparent',
  borderBottom: '2px solid transparent',
};

const activeTabButtonStyle: React.CSSProperties = {
  color: '#a5b4fc',
  background: 'rgba(99,102,241,0.12)',
  borderBottom: '2px solid #6366f1',
};
