'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  X, Save, Undo2, Redo2, Type, ImageIcon, Square, Circle, 
  ChevronLeft, ChevronRight, Plus, Trash2, Layout, 
  AlignCenter, AlignLeft, AlignRight, Bold, Italic, 
  Palette, Grid, Layers, Download
} from 'lucide-react';

interface Slide {
  title: string;
  content: string[];
  background?: string;
  layout?: 'title' | 'content' | 'split';
  canvasState?: any;
  previewImage?: string;
}

interface PPTSlideEditorProps {
  slides: Slide[];
  onClose: () => void;
  onSave: (slides: Slide[]) => void;
  onExport: () => void;
}

export default function PPTSlideEditor({ slides: initialSlides, onClose, onSave, onExport }: PPTSlideEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);

  // Sync current canvas to state
  const syncCanvasToState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return slides;

    const json = canvas.toJSON();
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 1 });
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      canvasState: json,
      previewImage: dataUrl
    };

    // Try to update semantic text for the preview if possible
    const objects = canvas.getObjects();
    const titleObj = objects.find(obj => (obj as any).name === 'title') as any;
    const contentObj = objects.find(obj => (obj as any).name === 'content') as any;
    
    if (titleObj && titleObj.text) newSlides[currentSlideIndex].title = titleObj.text;
    if (contentObj && contentObj.text) newSlides[currentSlideIndex].content = [contentObj.text];

    setSlides(newSlides);
    return newSlides;
  }, [slides, currentSlideIndex]);

  // Initializing Canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: '#12141c',
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e) => setActiveObject(e.selected[0]));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected[0]));
    canvas.on('selection:cleared', () => setActiveObject(null));

    renderSlide(0, true);

    return () => {
      // Don't dispose immediately on every re-render, but clean up on unmount
    };
  }, []);

  const renderSlide = useCallback(async (index: number, skipSync: boolean = false) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!skipSync) {
      // This is tricky because slides state might be stale in this closure if not Careful
      // But we handle switching via switchSlide which syncs first
    }

    canvas.clear();
    const slide = slides[index];
    canvas.backgroundColor = slide.background || '#12141c';

    if (slide.canvasState) {
      await canvas.loadFromJSON(slide.canvasState);
      canvas.renderAll();
    } else {
      // Default layouts
      if (slide.layout === 'title') {
        const title = new fabric.IText(slide.title, {
          left: 480, top: 200, fontSize: 54, fontWeight: 'bold', fontFamily: 'Inter',
          textAlign: 'center', originX: 'center', fill: '#ffffff', name: 'title'
        });
        const subtitle = new fabric.IText(slide.content[0] || '', {
          left: 480, top: 320, fontSize: 24, fontFamily: 'Inter',
          textAlign: 'center', originX: 'center', fill: '#9ca3af', name: 'subtitle'
        });
        canvas.add(title, subtitle);
      } else {
        const title = new fabric.IText(slide.title, {
          left: 50, top: 50, fontSize: 36, fontWeight: 'bold', fontFamily: 'Inter',
          fill: '#f97316', name: 'title'
        });
        const content = new fabric.IText(slide.content.join('\n\n'), {
          left: 50, top: 150, fontSize: 20, fontFamily: 'Inter',
          fill: '#d1d5db', width: 860, name: 'content'
        });
        canvas.add(title, content);
      }
    }
    canvas.renderAll();
  }, [slides]);

  const switchSlide = (index: number) => {
    if (index === currentSlideIndex) return;
    const updated = syncCanvasToState();
    // We need to use the updated slides for the next render
    setCurrentSlideIndex(index);
    // The useEffect below will handle rendering with the new index
  };

  const addSlide = () => {
    syncCanvasToState();
    const newSlide: Slide = {
      title: 'New Slide',
      content: ['Click to edit content'],
      layout: 'content',
      background: '#12141c'
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return; // keep at least one slide
    syncCanvasToState();
    const newSlides = slides.filter((_, i) => i !== idx);
    const newIndex = idx >= newSlides.length ? newSlides.length - 1 : idx;
    setSlides(newSlides);
    setCurrentSlideIndex(newIndex);
  };

  useEffect(() => {
    if (fabricCanvasRef.current) {
        renderSlide(currentSlideIndex, true);
    }
  }, [currentSlideIndex]);

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 100, top: 100, fontSize: 24, fontFamily: 'Inter', fill: '#333333'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addRect = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150, top: 150, fill: '#f97316', width: 200, height: 120, rx: 8, ry: 8
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 200, top: 200, fill: '#3b82f6', radius: 60
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addTriangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const tri = new fabric.Triangle({
      left: 250, top: 250, fill: '#10b981', width: 120, height: 120
    });
    canvas.add(tri);
    canvas.setActiveObject(tri);
    canvas.renderAll();
  };

  const addImage = async () => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    try {
      const img = await (fabric as any).FabricImage.fromURL(url);
      img.scaleToWidth(400);
      fabricCanvasRef.current?.add(img);
      fabricCanvasRef.current?.centerObject(img);
      fabricCanvasRef.current?.renderAll();
    } catch (e) {
      alert('Failed to load image');
    }
  };

  const deleteObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.renderAll();
    setActiveObject(null);
  };

  const setFill = () => {
    if (!activeObject) return;
    const color = prompt('Enter color (hex or name):', '#f97316');
    if (color) {
      activeObject.set('fill', color);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    if (activeObject instanceof fabric.IText) {
      activeObject.set('textAlign', align);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const toggleBold = () => {
    if (activeObject instanceof fabric.IText) {
      const isBold = activeObject.fontWeight === 'bold';
      activeObject.set('fontWeight', isBold ? 'normal' : 'bold');
      fabricCanvasRef.current?.renderAll();
    }
  };

  const toggleItalic = () => {
    if (activeObject instanceof fabric.IText) {
      const isItalic = activeObject.fontStyle === 'italic';
      activeObject.set('fontStyle', isItalic ? 'normal' : 'italic');
      fabricCanvasRef.current?.renderAll();
    }
  };

  const handleSave = () => {
    const finalSlides = syncCanvasToState();
    onSave(finalSlides);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f1115] flex flex-col font-sans overflow-hidden text-white animate-fade-in">
      {/* PPT Studio Toolbar */}
      <div className="bg-[#1a1d23] border-b border-white/5 h-16 px-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Layout size={22} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 leading-none">PPT Studio</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">v2.0 Design Suite</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <button onClick={addText} className="p-2.5 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all group" title="Add Text">
              <Type size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={addRect} className="p-2.5 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all group" title="Add Rectangle">
              <Square size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={addCircle} className="p-2.5 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all group" title="Add Circle">
              <Circle size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={addTriangle} className="p-2.5 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all group" title="Add Triangle">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-current group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={addImage} className="p-2.5 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all group" title="Insert Image">
              <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            
            <div className="w-px h-8 bg-white/5 mx-2" />
            
            <button onClick={deleteObject} disabled={!activeObject} className="p-2.5 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-500 transition-all disabled:opacity-20" title="Delete Element">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onExport} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all border border-white/5">
            <Download size={16} /> Export PPTX
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/30 active:scale-95">
            <Save size={16} /> Save Changes
          </button>
          <div className="w-px h-10 bg-white/10 mx-2" />
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Slide List Sidebar */}
        <div className="w-72 bg-[#14161c] border-r border-white/5 flex flex-col h-full shadow-2xl z-20">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Presentation Slides</span>
            <button 
              onClick={addSlide}
              className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/10 active:scale-95"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {slides.map((s, idx) => (
              <div key={idx} className="relative group">
                <button
                  onClick={() => switchSlide(idx)}
                  className={`w-full text-left rounded-xl overflow-hidden transition-all duration-300 border-2 ${currentSlideIndex === idx ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="aspect-video relative" style={{ backgroundColor: s.background || '#12141c' }}>
                    {s.previewImage ? (
                      <img src={s.previewImage} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col gap-2 p-3" style={{ backgroundColor: s.background || '#12141c' }}>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-[2px] h-3 bg-orange-500 rounded-full shrink-0" />
                          <div className="text-[6px] font-black text-white leading-tight line-clamp-1 tracking-tight">{s.title}</div>
                        </div>
                        {s.content.slice(0, 3).map((c, ci) => (
                          <div key={ci} className="flex items-start gap-1">
                            <div className="w-1 h-1 rounded-full bg-orange-500/70 shrink-0 mt-[2px]" />
                            <div className="text-[5px] text-gray-400 line-clamp-1">{c}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                      {idx + 1}
                    </div>
                  </div>
                  <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest truncate ${currentSlideIndex === idx ? 'bg-orange-600 text-white' : 'bg-[#1a1d23] text-gray-500'}`}>
                    {s.title || `Slide ${idx + 1}`}
                  </div>
                </button>
                {/* Delete slide button — shown on hover, hidden if only 1 slide */}
                {slides.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600/80 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg z-10"
                    title="Delete slide"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col relative bg-[#1a1d23] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
          
          {/* Action Bar (Contextual) */}
          <div className="h-14 border-b border-white/5 bg-[#14161c]/60 backdrop-blur-xl flex items-center px-8 gap-6 z-10">
            {activeObject ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button onClick={toggleBold} className="p-2 hover:bg-orange-500/10 rounded-lg text-gray-400 hover:text-orange-500 transition-all"><Bold size={16} /></button>
                  <button onClick={toggleItalic} className="p-2 hover:bg-orange-500/10 rounded-lg text-gray-400 hover:text-orange-500 transition-all"><Italic size={16} /></button>
                </div>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button onClick={() => setTextAlign('left')} className="p-2 hover:bg-orange-500/10 rounded-lg text-gray-400 hover:text-orange-500 transition-all"><AlignLeft size={16} /></button>
                  <button onClick={() => setTextAlign('center')} className="p-2 hover:bg-orange-500/10 rounded-lg text-gray-400 hover:text-orange-500 transition-all"><AlignCenter size={16} /></button>
                  <button onClick={() => setTextAlign('right')} className="p-2 hover:bg-orange-500/10 rounded-lg text-gray-400 hover:text-orange-500 transition-all"><AlignRight size={16} /></button>
                </div>
                <button 
                  onClick={setFill} 
                  className="px-4 py-2 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all border border-white/5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
                >
                  <Palette size={16} /> Color
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-600">
                <Grid size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select an element to customize</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-12 overflow-auto custom-scrollbar bg-black/40">
            <div className="relative group/canvas">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-lg blur opacity-20 group-hover/canvas:opacity-30 transition duration-1000"></div>
              <div className="shadow-2xl canvas-container relative rounded-sm overflow-hidden">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="h-10 border-t border-white/5 bg-[#14161c] flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-6 text-[10px] font-bold text-gray-600">
              <span className="uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={12} /> Slide {currentSlideIndex + 1} Editor
              </span>
              <div className="w-px h-4 bg-white/5" />
              <span className="uppercase tracking-[0.2em]">960 x 540 HD</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-1 px-3 bg-white/5 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                Auto-Saved
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
