'use client'

import { Link, RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react';
import '@mantine/tiptap/styles.css';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import SubScript from '@tiptap/extension-subscript';
import React from 'react'
import Highlight from '@tiptap/extension-highlight';

interface RubricDescEditionProps {
  value: string;
  onUpdate?: (value: string) => void;
  onBlurEditor?: () => void;
}

export const RubricDescEdition: React.FC<RubricDescEditionProps> = ({ value, onUpdate, onBlurEditor }) => {
  const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onUpdate?.(html);
      },      
      onBlur: () => {
        onUpdate?.(editor?.getHTML() ?? '');
        onBlurEditor?.();
      }
  });

  return (
    <RichTextEditor editor={editor} component={'div'} className="mt-1 w-full max-w-[360px]">
    <RichTextEditor.Toolbar>
      <RichTextEditor.ControlsGroup>
      <RichTextEditor.Bold />
      <RichTextEditor.Italic />
      <RichTextEditor.Underline />
      <RichTextEditor.Strikethrough />
      <RichTextEditor.ClearFormatting />
      <RichTextEditor.Highlight />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.H1 />
      <RichTextEditor.H2 />
      <RichTextEditor.H3 />
      <RichTextEditor.H4 />
      <RichTextEditor.Link />
      <RichTextEditor.Unlink />
    </RichTextEditor.ControlsGroup>
    </RichTextEditor.Toolbar>

    <RichTextEditor.Content 
      onBlur={() => {
        onUpdate?.(editor?.getHTML() ?? '');
        editor?.commands.blur();
      }}
    />
  </RichTextEditor>
  )
}
