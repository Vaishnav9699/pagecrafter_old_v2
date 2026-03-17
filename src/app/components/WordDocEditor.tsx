'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { 
  X, Save, Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Image as ImageIcon, Table as TableIcon,
  Type, ChevronDown, RotateCcw
} from 'lucide-react';
import { useState } from 'react';

interface WordDocEditorProps {
  html: string;
  templateHtml: string;
  onClose: () => void;
  onSave: (html: string) => void;
}

export default function WordDocEditor({ html, templateHtml, onClose, onSave }: WordDocEditorProps) {
  const [activeFont, setActiveFont] = useState('Inter');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: html,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[1056px] p-12 bg-white shadow-2xl ring-1 ring-gray-200',
        style: 'width: 800px; font-family: "Inter", sans-serif; color: #111827;',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    onSave(editor.getHTML());
  };

  const fonts = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Playfair', value: '"Playfair Display", serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Monospace', value: 'monospace' },
  ];

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode; 
    title?: string 
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        active 
          ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f3f4f6] flex flex-col font-sans overflow-hidden">
      {/* MS Word Style Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm pb-1">
        {/* Title/Header Area */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center shadow-emerald-600/20 shadow-lg">
              <Type size={16} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 leading-none">Document Studio</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Professional Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { if(confirm('Reset to original AI template?')) editor.commands.setContent(templateHtml); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              <Save size={14} /> Save
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Area */}
        <div className="px-4 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* History */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={16} /></ToolbarButton>
          
          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Font Selection */}
          <div className="relative group shrink-0">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 text-xs font-bold text-gray-700 transition-all border border-transparent hover:border-gray-200">
              {activeFont} <ChevronDown size={12} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
              {fonts.map(font => (
                <button
                  key={font.name}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run();
                    setActiveFont(font.name);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${activeFont === font.name ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Basic Formatting */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Headings */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            active={editor.isActive('heading', { level: 1 })}
          >
            <span className="text-[10px] font-black leading-none">H1</span>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            active={editor.isActive('heading', { level: 2 })}
          >
            <span className="text-[10px] font-black leading-none text-emerald-600">H2</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })}><AlignJustify size={16} /></ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={16} /></ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Insert */}
          <ToolbarButton 
            onClick={() => {
              const url = window.prompt('URL');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table"
          >
            <TableIcon size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar bg-gray-100">
        <div className="w-[800px] mb-24 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-300">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 1056px;
          outline: none !important;
        }
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 900;
          color: #111827;
          margin-bottom: 2rem;
          border-bottom: 4px solid #059669;
          padding-bottom: 1.5rem;
          text-transform: uppercase;
          line-height: 1;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 900;
          color: #059669;
          border-left: 4px solid #059669;
          padding: 0.25rem 0 0.25rem 1rem;
          margin-bottom: 1rem;
          margin-top: 2rem;
          text-transform: uppercase;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.625;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #e5e7eb;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
