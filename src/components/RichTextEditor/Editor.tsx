'use client';
import { FC, memo, useState } from "react";
import styled from "styled-components";
// Import the Slate editor factory.
import { createEditor, Descendant } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

const StyledEditor = styled.div``;

interface IEditorProps {}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

const Editor: FC<IEditorProps> = () => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <StyledEditor>
      {/* // Add the editable component inside the context. */}
      <Slate editor={editor} value={initialValue}>
        <Editable />
      </Slate>
    </StyledEditor>
  );
};

export default memo(Editor);
