"use client";

import { Link, RichTextEditor } from '@mantine/tiptap'
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SubScript from '@tiptap/extension-subscript';
import React, { useEffect } from 'react'
import '@mantine/tiptap/styles.css';
import Highlight from '@tiptap/extension-highlight';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
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
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
          editor.commands.setContent(value);
        }
    }, [value, editor]);

  return (
    <RichTextEditor editor={editor}>
    <RichTextEditor.Toolbar sticky stickyOffset={60}>
      <RichTextEditor.ControlsGroup>
      <RichTextEditor.Bold />
      <RichTextEditor.Italic />
      <RichTextEditor.Underline />
      <RichTextEditor.Strikethrough />
      <RichTextEditor.ClearFormatting />
      <RichTextEditor.Highlight />
      <RichTextEditor.Code />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.H1 />
      <RichTextEditor.H2 />
      <RichTextEditor.H3 />
      <RichTextEditor.H4 />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Blockquote />
      <RichTextEditor.Hr />
      <RichTextEditor.BulletList />
      <RichTextEditor.OrderedList />
      <RichTextEditor.Subscript />
      <RichTextEditor.Superscript />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Link />
      <RichTextEditor.Unlink />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.AlignLeft />
      <RichTextEditor.AlignCenter />
      <RichTextEditor.AlignJustify />
      <RichTextEditor.AlignRight />
    </RichTextEditor.ControlsGroup>

    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Undo />
      <RichTextEditor.Redo />
    </RichTextEditor.ControlsGroup>
    </RichTextEditor.Toolbar>

    <RichTextEditor.Content />
  </RichTextEditor>
  )
}
