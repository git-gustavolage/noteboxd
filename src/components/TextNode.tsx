import { useEffect, useRef } from "react";
import useCursor from "../hooks/useCursor";
import { useCursorContext } from "../contexts/CursorContext";
import Node from "../lib/react/TextEditor/Node";

interface TextNodeProps {
  node: Node,
  updateNode: (node: Node) => void
  split: (id: string, cursorPosition: number) => Node | undefined
  merge: (currentId?: string, otherId?: string) => Node | undefined
  getPreviousNode: (id: string) => Node | null
  getNextNode: (id: string) => Node | null
  undo: () => void
}

const TextNode: React.FC<TextNodeProps> = ({
  node,
  updateNode,
  split,
  merge,
  getPreviousNode,
  getNextNode,
  undo,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { setCursorPosition } = useCursorContext();

  const { setCursorToPosition, getPosition } = useCursor(elementRef.current, (pos) => setCursorPosition(node.id, pos));

  useEffect(() => {
    if (!elementRef.current) return;

    if (elementRef.current.innerText !== node.text) {
      elementRef.current.innerText = node.text;
    }

    if (node.active) {
      elementRef.current.focus();

      const position = node.cursorPosition ?? 0;

      const clamped = Math.min(position, node.text.length);

      setCursorToPosition(clamped);
    }
  }, [node.active, node.text]);

  const handleClick = () => {
    node.active = true;
    const pos = getPosition();

    setCursorPosition(node.id, pos);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    node.text = text;

    const pos = getPosition();
    setCursorPosition(node.id, pos);
    node.cursorPosition = pos ?? 0;

    updateNode(node);
  };


  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const pos = getPosition();

    setCursorPosition(node.id, pos);

    if(e.key === "z" && e.ctrlKey) {
      console.log("udno");
    }


    if (e.key === "Enter") {
      e.preventDefault();
      const newNode = split(node.id, pos);
      if (!newNode) return;

      setCursorPosition(newNode.id, 0);

      return;
    }


    if (e.key === "Backspace" && pos === 0) {
      e.preventDefault();
      const prev = getPreviousNode(node.id);
      if (!prev) return;

      const mergedId = merge(prev.id, node.id)!.id;
      if (!mergedId) return;

      const baseTextLength = prev.text.length;
      setCursorPosition(mergedId, baseTextLength);

      return;
    }


    if (e.key === "Delete") {
      const textLen = elementRef.current?.innerText.length ?? 0;
      if (pos === textLen) {
        e.preventDefault();
        const nxt = getNextNode(node.id);
        if (!nxt) return;

        const mergedId = merge(node.id, nxt.id)!.id;
        if (!mergedId) return;

        const baseTextLength = node.text.length;
        setCursorPosition(mergedId, baseTextLength);

      }

      return;
    }


    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = getPreviousNode(node.id);
      if (!prev) return;

      const column = pos;

      setCursorPosition(node.id, pos);
      setCursorPosition(prev.id, Math.min(column, prev.text.length));

      return;
    }


    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nxt = getNextNode(node.id);
      if (!nxt) return;

      const column = pos;

      setCursorPosition(node.id, pos);
      setCursorPosition(nxt.id, Math.min(column, nxt.text.length));

      return;
    }

    return;
  };

  return (
    <div>
      <div
        ref={elementRef}
        className="node w-full p-0.5 my-1 rounded outline-none whitespace-pre-wrap min-h-[1em] text-base leading-6"
        onInput={handleInput}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        contentEditable
        suppressContentEditableWarning
      />
    </div>
  );
};

export default TextNode;
