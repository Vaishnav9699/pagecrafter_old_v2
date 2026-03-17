'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Download, Globe, ChevronDown, FileText, Clock, Save, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import HexagonalLoader from './HexagonalLoader';

interface PDFSection {
    heading: string;
    content: string;
}

interface PDFDocument {
    title: string;
    author: string;
    sections: PDFSection[];
    timestamp?: number;
}

interface PDFPreviewProps {
    document: PDFDocument | null;
    isLoading?: boolean;
}

export default function PDFPreview({ document: doc, isLoading }: PDFPreviewProps) {
    const { theme } = useTheme();
    const [localDoc, setLocalDoc] = useState<PDFDocument | null>(null);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [history, setHistory] = useState<PDFDocument[]>([]);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Update localDoc when a new doc is generated via AI
    useEffect(() => {
        if (doc) {
            setLocalDoc(doc);
        }
    }, [doc]);

    // Load history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('pagecrafter_pdf_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse PDF history", e);
            }
        }

        function handleClickOutside(event: MouseEvent) {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareMenuOpen(false);
            }
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
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

    const handleContentChange = (index: number, field: 'heading' | 'content', value: string) => {
        if (!localDoc) return;
        const newSections = [...localDoc.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setLocalDoc({ ...localDoc, sections: newSections });
    };

    const handleTitleChange = (value: string) => {
        if (!localDoc) return;
        setLocalDoc({ ...localDoc, title: value });
    };

    const handleSaveToHistory = () => {
        if (!localDoc) return;
        const newEntry = { ...localDoc, timestamp: Date.now() };
        const updatedHistory = [newEntry, ...history.filter(h => h.title !== localDoc.title)].slice(0, 20);
        setHistory(updatedHistory);
        localStorage.setItem('pagecrafter_pdf_history', JSON.stringify(updatedHistory));
        alert('Saved to history!');
    };

    const loadFromHistory = (item: PDFDocument) => {
        setLocalDoc(item);
        setIsHistoryOpen(false);
    };

    const deleteFromHistory = (e: React.MouseEvent, timestamp?: number) => {
        e.stopPropagation();
        if (!timestamp) return;
        const updatedHistory = history.filter(item => item.timestamp !== timestamp);
        setHistory(updatedHistory);
        localStorage.setItem('pagecrafter_pdf_history', JSON.stringify(updatedHistory));
    };

    const handleExportPDF = async () => {
        if (!previewRef.current || !localDoc) return;

        try {
            setIsExporting(true);
            console.log("PDF Export: Initializing...");
            const html2pdf = (await import('html2pdf.js')).default;
            const element = previewRef.current;
            
            // Temporary styles to improve capture performance and quality
            const originalShadow = element.style.boxShadow;
            element.style.boxShadow = 'none';

            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
                filename: `${localDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight,
                    onclone: (clonedDoc: Document) => {
                        // 1. Sanitize CSS Rules (Remove lab() and oklch() which crash html2canvas)
                        Array.from(clonedDoc.styleSheets).forEach(sheet => {
                            try {
                                for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
                                    const rule = sheet.cssRules[i];
                                    if (rule instanceof CSSStyleRule) {
                                        const cssText = rule.cssText.toLowerCase();
                                        if (cssText.includes('lab(') || cssText.includes('oklch(')) {
                                            sheet.deleteRule(i);
                                        }
                                    }
                                }
                            } catch (e) {
                                // If sheet is cross-origin or unreadable, we ignore it
                                console.warn("Could not sanitize stylesheet", e);
                            }
                        });

                        // 2. Force solid white on the element and ALL its parents
                        const clonedElement = clonedDoc.getElementById('pdf-preview-canvas');
                        if (clonedElement) {
                            clonedElement.style.backgroundColor = '#ffffff';
                            clonedElement.style.backgroundImage = 'none';
                            clonedElement.style.boxShadow = 'none';
                            
                            let parent = clonedElement.parentElement;
                            while (parent) {
                                parent.style.backgroundColor = '#ffffff';
                                parent.style.backgroundImage = 'none';
                                parent.removeAttribute('data-theme');
                                parent = parent.parentElement;
                            }
                        }
                        
                        const clonedHtml = clonedDoc.documentElement;
                        if (clonedHtml) {
                            clonedHtml.style.backgroundColor = '#ffffff';
                            clonedHtml.removeAttribute('data-theme');
                        }
                    }
                },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            
            // Restore styles
            element.style.boxShadow = originalShadow;
            console.log("PDF Export: Success!");
        } catch (error) {
            console.error("PDF Export: Failed", error);
            alert("Failed to generate PDF. If the page is stuck, please refresh. Try a shorter document if the problem persists.");
        } finally {
            setIsExporting(false);
            setIsShareMenuOpen(false);
        }
    };

    if (isLoading && !localDoc) {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center gap-8 ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-white'}`}>
                <HexagonalLoader size={120} color="#ef4444" />
                <div className="flex flex-col items-center gap-2 text-center">
                    <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`}>Drafting Document</span>
                    <span className="text-red-500 font-bold animate-pulse text-sm uppercase tracking-widest px-4">AI is writing your content...</span>
                </div>
            </div>
        );
    }

    if (!localDoc) {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center text-center p-12 ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-white'}`}>
                <div className={`w-32 h-32 rounded-[3rem] ${theme === 'dark' ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'} flex items-center justify-center text-red-500 mb-8 border shadow-xl`}>
                    <FileText className="w-16 h-16" />
                </div>
                <h2 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Your Document Awaits</h2>
                <p className="text-gray-500 max-w-sm font-medium mb-8">Describe your requirements in the chat to generate a professional PDF document instantly.</p>
                
                {history.length > 0 && (
                    <div className="w-full max-w-md animate-fade-in">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Clock size={14} className="text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Recent Documents</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {history.slice(0, 3).map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => loadFromHistory(item)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        theme === 'dark' 
                                        ? 'bg-white/5 border-white/5 hover:border-red-500/50 hover:bg-white/10' 
                                        : 'bg-gray-50 border-gray-100 hover:border-red-500/50 hover:bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                        <FileText size={16} className="text-red-500 shrink-0" />
                                        <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</span>
                                    </div>
                                    <ChevronDown className="-rotate-90 text-gray-400" size={14} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-8 py-4 border-b ${theme === 'dark' ? 'bg-[#0f1117] border-slate-800/50' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] shrink-0">PDF Preview</span>
                    <div className="h-4 w-px bg-gray-200 shrink-0" />
                    <h3 className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{renderContent(localDoc.title)}</h3>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="History"
                    >
                        <Clock size={16} />
                    </button>

                    <button
                        onClick={handleSaveToHistory}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                            theme === 'dark' ? 'border-red-900/30 text-red-500 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50 shadow-sm'
                        }`}
                    >
                        <Save size={14} />
                        Save
                    </button>

                    <div className="relative" ref={shareMenuRef}>
                        <button
                            onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                            disabled={isExporting}
                            className={`flex items-center gap-2 px-4 py-2 ${isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'} text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95`}
                        >
                            {isExporting ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Share2 size={14} />}
                            {isExporting ? 'Exporting...' : 'Actions'}
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isShareMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isShareMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-fade-in">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                            <Download size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Download .pdf</span>
                                            <span className="text-[10px] text-gray-500 font-medium">Professional document</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleSaveToHistory}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                            <Save size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Save to History</span>
                                            <span className="text-[10px] text-gray-500 font-medium">Keep for later access</span>
                                        </div>
                                    </button>

                                    <div className="h-px bg-gray-100 my-1 mx-2" />

                                    <button
                                        onClick={() => {
                                            alert('Share functionality coming soon!');
                                            setIsShareMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Globe size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Publish Link</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Get shareable URL</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Sidebar/Drawer */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsHistoryOpen(false)} />
                    <div 
                        ref={historyRef}
                        className={`relative w-full max-w-sm h-full shadow-2xl animate-slide-in-right flex flex-col ${theme === 'dark' ? 'bg-[#0f1117]' : 'bg-white'}`}
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="text-red-500" />
                                <h3 className={`text-lg font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>History</h3>
                            </div>
                            <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-4">
                                    <Clock size={48} />
                                    <span className="text-sm font-bold">No saved documents yet.</span>
                                </div>
                            ) : (
                                history.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => loadFromHistory(item)}
                                        className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                            theme === 'dark' 
                                            ? 'bg-white/5 border-white/5 hover:border-red-500/50 hover:bg-white/10' 
                                            : 'bg-gray-50 border-gray-100 hover:border-red-500/50 hover:bg-white shadow-sm'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1 min-w-0 pr-8">
                                            <span className={`text-sm font-black truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{item.title}</span>
                                            <span className="text-[10px] font-bold text-gray-500">{new Date(item.timestamp || 0).toLocaleString()}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => deleteFromHistory(e, item.timestamp)}
                                            className="absolute right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Canvas */}
            <div className={`flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-gray-50'}`}>
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">Edit any text to modify document</div>
                
                <div
                    ref={previewRef}
                    id="pdf-preview-canvas"
                    className="w-full max-w-[800px] h-max p-12 min-h-[1056px] flex flex-col gap-8 rounded-sm relative"
                    style={{ 
                        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                        backgroundColor: '#ffffff',
                        color: '#111827',
                        boxShadow: 'none'
                    }}
                >
                    <div style={{ borderBottom: '4px solid #dc2626', paddingBottom: '2rem' }}>
                        <h1 
                            className="text-4xl font-black uppercase tracking-tighter mb-2 outline-none focus:text-red-600 transition-colors"
                            style={{ color: '#111827' }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTitleChange(e.currentTarget.textContent || '')}
                        >
                            {renderContent(localDoc.title)}
                        </h1>
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>
                            <span>By {localDoc.author}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {localDoc.sections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4 group">
                            <h2 
                                className="text-xl font-black uppercase tracking-tight pl-4 outline-none focus:bg-red-50 transition-all"
                                style={{ 
                                    color: '#dc2626', 
                                    borderLeft: '4px solid #dc2626' 
                                }}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleContentChange(idx, 'heading', e.currentTarget.textContent || '')}
                            >
                                {renderContent(section.heading)}
                            </h2>
                            <p 
                                className="text-lg leading-relaxed font-medium whitespace-pre-wrap outline-none p-2 rounded-lg transition-all"
                                style={{ color: '#374151' }}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleContentChange(idx, 'content', e.currentTarget.textContent || '')}
                            >
                                {renderContent(section.content)}
                            </p>
                        </div>
                    ))}

                    <div className="mt-auto pt-10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#d1d5db', borderTop: '1px solid #f3f4f6' }}>
                        <span>Generated by PageCrafter AI</span>
                        <span>Page 1 of 1</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
