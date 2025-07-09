"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { useEffect } from "react"
import { Bold, Italic, UnderlineIcon, Heading2, List, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EditorProps {
  content: string
  setContent: (html: string) => void
}

export default function Editor({ content, setContent }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    onUpdate({ editor }) {
      setContent(editor.getHTML())
    },
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  const toolbarButtons = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "Underline",
      icon: UnderlineIcon,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Bullet List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "Numbered List",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ]

  return (
    <Card>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 border-b p-3 bg-muted/50">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.label}
              type="button"
              variant={btn.isActive ? "default" : "ghost"}
              size="sm"
              onClick={btn.action}
              className="h-8 px-2"
            >
              <btn.icon className="h-4 w-4" />
              <span className="sr-only">{btn.label}</span>
            </Button>
          ))}
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} className="min-h-[300px] p-4 prose prose-sm max-w-none focus:outline-none" />
      </CardContent>
    </Card>
  )
}
