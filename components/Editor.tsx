"use client";

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  setContent: (html: string) => void;
}

export default function Editor({ content, setContent }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border border-gray-300 p-2 rounded mb-3 bg-gray-50 overflow-x-auto">
        {[
          { label: 'Bold', action: () => editor.chain().focus().toggleBold().run() },
          { label: 'Italic', action: () => editor.chain().focus().toggleItalic().run() },
          { label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run() },
          { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
          { label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run() },
          { label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run() },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-sm transition"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] w-full border border-gray-300 rounded p-3 bg-white shadow-sm focus:outline-none"
      />
    </div>
  );
}
