'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Download, Globe, Link2, ChevronDown, Clock, FileText, Plus, Trash2, Edit3, Save, Layout } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import HexagonalLoader from './HexagonalLoader';
import PPTSlideEditor from './PPTSlideEditor';

interface Slide {
    title: string;
    content: string[];
    background?: string;
    layout?: 'title' | 'content' | 'split';
    canvasState?: any;
    previewImage?: string;
}

interface PPTPresentation {
    title: string;
    slides: Slide[];
}

interface HistoryItem {
    id: string;
    title: string;
    presentation: PPTPresentation;
    createdAt: string;
}

interface PPTPreviewProps {
    slides: Slide[];
    isLoading?: boolean;
}

const HISTORY_KEY = 'pagecrafter_ppt_history';

function getHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveToHistory(presentation: PPTPresentation): void {
    const history = getHistory();
    const item: HistoryItem = {
        id: Date.now().toString(),
        title: presentation.title || 'Untitled Presentation',
        presentation,
        createdAt: new Date().toISOString(),
    };
    // Keep max 20 items
    const updated = [item, ...history].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export default function PPTPreview({ slides: initialSlides, isLoading }: PPTPreviewProps) {
    const { theme } = useTheme();
    const [slides, setSlides] = useState<Slide[]>(initialSlides);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const historyMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialSlides && initialSlides.length > 0) {
            setSlides(initialSlides);
            setCurrentSlide(0);
            const presentation: PPTPresentation = {
                title: initialSlides[0].title,
                slides: initialSlides
            };
            saveToHistory(presentation);
            setHistory(getHistory());
        }
    }, [initialSlides]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
            if (historyMenuRef.current && !historyMenuRef.current.contains(event.target as Node)) {
                setIsHistoryOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderContent = (content: any): string => {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.join('\n');
        if (typeof content === 'object' && content !== null) {
            return Object.entries(content)
                .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                .join('\n');
        }
        return String(content || '');
    };

    const updateSlideTitle = (idx: number, newTitle: string) => {
        const newSlides = [...slides];
        newSlides[idx] = { ...newSlides[idx], title: newTitle };
        setSlides(newSlides);
    };

    const updateSlideContent = (slideIdx: number, contentIdx: number, newContent: string) => {
        const newSlides = [...slides];
        const newContentArray = [...newSlides[slideIdx].content];
        newContentArray[contentIdx] = newContent;
        newSlides[slideIdx] = { ...newSlides[slideIdx], content: newContentArray };
        setSlides(newSlides);
    };

    const handleExportPPTX = async () => {
        if (slides.length === 0) return;

        try {
            const PptxGenJS = (await import('pptxgenjs')).default;
            const pres = new PptxGenJS();
            
            pres.title = slides[0].title || "Presentation";

            slides.forEach((slide) => {
                const s = pres.addSlide();
                
                if (slide.previewImage) {
                    // Use the visual render from Studio
                    s.addImage({
                        data: slide.previewImage,
                        x: 0, y: 0, w: '100%', h: '100%'
                    });
                } else {
                    // Fallback to semantic layout if no visual edit
                    if (slide.layout === 'title') {
                        s.addText(slide.title, {
                            x: 0.5, y: 1.5, w: 9, h: 2,
                            fontSize: 44, bold: true, align: 'center', color: 'FF6B00'
                        });
                        if (slide.content[0]) {
                            s.addText(slide.content[0], {
                                x: 0.5, y: 3.5, w: 9, h: 1,
                                fontSize: 24, align: 'center', color: '666666'
                            });
                        }
                    } else {
                        s.addText(slide.title, {
                            x: 0.5, y: 0.5, w: 9, h: 1,
                            fontSize: 32, bold: true, color: 'FF6B00'
                        });
                        
                        const bulletPoints = slide.content.map(text => ({ text, options: { bullet: true, margin: 5 } }));
                        s.addText(bulletPoints as any, {
                            x: 0.5, y: 1.5, w: 9, h: 3.5,
                            fontSize: 18, color: '333333'
                        });
                    }
                }
            });

            await pres.writeFile({ fileName: `${slides[0].title || 'presentation'}.pptx` });
            setIsShareMenuOpen(false);
        } catch (error) {
            console.error('Error exporting PPTX:', error);
            alert('Failed to export PPTX. Please try again.');
        }
    };

    const handleSaveFromEditor = (updatedSlides: Slide[]) => {
        setSlides(updatedSlides);
        const presentation: PPTPresentation = { title: updatedSlides[0].title, slides: updatedSlides };
        saveToHistory(presentation);
        setHistory(getHistory());
        setIsEditorOpen(false);
    };

    const loadFromHistory = (item: HistoryItem) => {
        setSlides(item.presentation.slides);
        setCurrentSlide(0);
        setIsHistoryOpen(false);
    };

    if (isLoading && slides.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-md gap-8">
                <HexagonalLoader size={120} color="#f97316" />
                <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">Designing Presentation</span>
                    <span className="text-orange-500 font-bold animate-pulse text-sm uppercase tracking-widest">AI is crafting your slides...</span>
                </div>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-900/20">
                <div className="w-32 h-32 rounded-[3rem] bg-orange-600/10 flex items-center justify-center text-orange-400 mb-8 border border-orange-500/20 shadow-2xl">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Your Presentation Awaits</h2>
                <p className="text-gray-500 max-w-sm font-medium mb-10">Describe your topic in the chat to generate a professional slide deck instantly.</p>

                {history.length > 0 && (
                    <div className="w-full max-w-md">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Recent Presentations</h3>
                        <div className="space-y-2">
                            {history.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-orange-500/5 hover:text-white transition-colors text-left border border-white/5 group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="truncate font-bold">{item.title}</span>
                                        <span className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const slide = slides[currentSlide];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0c10] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Slide {currentSlide + 1} of {slides.length}</span>
                    <div className="h-4 w-px bg-white/10" />
                    <h3 className="text-sm font-bold text-gray-300 truncate max-w-[200px]">{renderContent(slide.title)}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        disabled={currentSlide === slides.length - 1}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                    >
                        <Layout size={14} />
                        <span className="hidden sm:inline">PPT Studio</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <div className="relative" ref={historyMenuRef}>
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold transition-all"
                        >
                            <Clock size={14} />
                            <span className="hidden sm:inline">History</span>
                        </button>
                        {isHistoryOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-[#1a1c23] border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-fade-in">
                                <div className="p-3 border-b border-white/5">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Presentation History</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                    {history.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-orange-500/5 hover:text-white transition-colors text-left group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="truncate font-bold text-xs">{item.title}</span>
                                                <span className="text-[10px] text-gray-600 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={shareMenuRef}>
                        <button
                            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 shadow-lg active:scale-95"
                        >
                            <Share2 size={14} />
                            Actions
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isShareMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isShareMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1c23] border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-fade-in">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={handleExportPPTX}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                            <Download size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Download .pptx</span>
                                            <span className="text-[10px] text-gray-600 font-medium">PowerPoint format</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            saveToHistory({ title: slides[0].title, slides });
                                            setHistory(getHistory());
                                            alert('✅ Presentation saved to history!');
                                            setIsShareMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <Save size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Save to History</span>
                                            <span className="text-[10px] text-gray-600 font-medium">Always accessible</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Slide Editor Canvas */}
            <div className="flex-1 p-12 flex items-center justify-center relative overflow-hidden bg-gray-950">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-purple-600/5 pointer-events-none" />

                <div className="w-full aspect-video max-w-5xl bg-[#12141c] rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col relative group animate-slide-up">
                    {slide.previewImage ? (
                        <div className="w-full h-full bg-white relative">
                            <img src={slide.previewImage} alt={slide.title} className="w-full h-full object-contain" />
                            <div className="absolute bottom-4 right-4 bg-orange-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-2">
                                <Layout size={12} /> Studio Render
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col p-12 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            {slide.layout === 'title' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 z-10">
                                    <div className="w-20 h-1 bg-orange-500 rounded-full" />
                                    <h1 
                                        contentEditable 
                                        suppressContentEditableWarning
                                        onBlur={(e) => updateSlideTitle(currentSlide, e.currentTarget.textContent || slide.title)}
                                        className="text-6xl font-black text-white tracking-tight leading-tight outline-none focus:ring-2 focus:ring-orange-500/50 rounded-lg px-4"
                                    >
                                        {renderContent(slide.title)}
                                    </h1>
                                    <div 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updateSlideContent(currentSlide, 0, e.currentTarget.textContent || slide.content[0])}
                                        className="text-xl text-gray-400 max-w-2xl leading-relaxed outline-none focus:ring-2 focus:ring-orange-500/30 rounded-lg px-4"
                                    >
                                        {slide.content[0]}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updateSlideTitle(currentSlide, e.currentTarget.textContent || slide.title)}
                                        className="text-4xl font-black text-white mb-10 border-l-4 border-orange-500 pl-6 outline-none focus:ring-2 focus:ring-orange-500/50 rounded-r-lg z-10"
                                    >
                                        {renderContent(slide.title)}
                                    </h2>
                                    <ul className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4 z-10">
                                        {slide.content.map((item, idx) => (
                                            <li key={idx} className="flex gap-4 items-start group/item">
                                                <div className="mt-2 w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)] group-hover/item:scale-150 transition-transform" />
                                                <div
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => updateSlideContent(currentSlide, idx, e.currentTarget.textContent || item)}
                                                    className="text-lg text-gray-300 leading-relaxed font-medium flex-1 outline-none focus:ring-2 focus:ring-orange-500/30 rounded-lg px-3 -mx-3"
                                                >
                                                    {renderContent(item)}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 z-10">
                                <span>PageCrafter AI Presenter</span>
                                <div className="flex items-center gap-2">
                                    <Edit3 size={10} className="text-orange-500" />
                                    <span>Click any text to edit</span>
                                </div>
                                <span>Slide {currentSlide + 1}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Tray */}
            <div className="h-32 bg-black/40 border-t border-white/5 p-4 flex gap-4 overflow-x-auto custom-scrollbar scroll-smooth">
                {slides.map((s, idx) =>                     <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`group relative flex-shrink-0 w-44 aspect-video rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                            currentSlide === idx ? 'border-orange-500 shadow-lg scale-105 z-10' : 'border-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="w-full h-full bg-white flex flex-col p-2">
                            {s.previewImage ? (
                                <img src={s.previewImage} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full mb-1" />
                                    <div className="h-1 w-2/3 bg-gray-100 rounded-full mb-1" />
                                    <div className="h-1 w-1/2 bg-gray-100 rounded-full" />
                                </>
                            )}
                        </div>
                        {currentSlide === idx && <div className="absolute inset-0 bg-orange-500/5" />}
                        {s.canvasState && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                          </div>
                        )}
                    </button>
                )}
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

            {isEditorOpen && (
                <PPTSlideEditor
                    slides={slides}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveFromEditor}
                    onExport={handleExportPPTX}
                />
            )}
        </div>
    );
}
