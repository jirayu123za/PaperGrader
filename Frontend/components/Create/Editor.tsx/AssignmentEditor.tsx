"use client";

import '@mantine/tiptap/styles.css';
import React, { useEffect } from 'react'
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import { Link, RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react';
import { useAssignmentSettingFormStore, useAssignmentSettingStore } from '@/store/modal/useAssignmentSettingModal';
import { Box } from '@mantine/core';

export const Editor: React.FC = () => {
  const { values, setField } = useAssignmentSettingFormStore();
  const { showToolbar } = useAssignmentSettingStore();

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
    content: values.assignmentDescription,
    onUpdate({ editor }) {
      setField('assignmentDescription', editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      editor.getHTML() !== values.assignmentDescription
    ) {
      editor.commands.setContent(values.assignmentDescription, false);
    }
  }, [editor, values.assignmentDescription]);

  return (
    <Box pos="relative">
      <RichTextEditor editor={editor}>
        {showToolbar && (
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
        )}
        <Box maw={540}>
          <RichTextEditor.Content />
        </Box>
      </RichTextEditor>
    </Box>
  )
}
