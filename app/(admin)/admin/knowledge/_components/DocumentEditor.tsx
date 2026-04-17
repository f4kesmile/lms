"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  icon: string;
  label?: string;
};

function ToolbarButton({
  onClick,
  isActive = false,
  icon,
  label,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0 rounded-md transition-all",
        isActive
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "hover:bg-muted text-muted-foreground",
      )}
      title={label}
    >
      <Icon name={icon} size={18} />
    </Button>
  );
}

export function DocumentEditor({
  content,
  onChange,
  placeholder = "Tulis materi di sini...",
  className,
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class:
            "rounded-2xl shadow-lg border border-border/50 max-w-full my-6",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-6",
          className,
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col w-full border border-border/60 rounded-2xl overflow-hidden bg-background ring-offset-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-1 p-2 border-b border-border/40 bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            icon="format_h1"
            label="Heading 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            icon="format_h2"
            label="Heading 2"
          />
        </div>
        <div className="hidden sm:block w-px h-4 bg-border/60 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon="format_bold"
            label="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon="format_italic"
            label="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon="format_underlined"
            label="Underline"
          />
        </div>
        <div className="hidden sm:block w-px h-4 bg-border/60 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            icon="format_align_left"
            label="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            icon="format_align_center"
            label="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            icon="format_align_right"
            label="Align Right"
          />
        </div>
        <div className="hidden sm:block w-px h-4 bg-border/60 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon="format_list_bulleted"
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon="format_list_numbered"
            label="Ordered List"
          />
        </div>
        <div className="hidden sm:block w-px h-4 bg-border/60 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={handleImageUpload}
            icon="image"
            label="Insert Image"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon="undo"
            label="Undo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon="redo"
            label="Redo"
          />
        </div>
      </div>

      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
