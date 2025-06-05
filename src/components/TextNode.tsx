import { useEffect, useRef } from "react";
import TextNodeData from "../types/TextNodeData";
import useCursor from "../hooks/useCursor";
import { useCursorContext } from "../contexts/CursorContext";

interface TextNodeProps {
  node: TextNodeData,
  updateText: (id: string, text: string) => void
  split: (id: string, cursorPosition: number) => TextNodeData | undefined
  merge: (currentId?: string, otherId?: string) => TextNodeData | undefined
  active: boolean,
  setActive: (id: string) => void,
  getPreviousNode: (id: string) => TextNodeData | null
  getNextNode: (id: string) => TextNodeData | null
}

const TextNode: React.FC<TextNodeProps> = ({
  node,
  updateText,
  split,
  merge,
  active,
  setActive,
  getPreviousNode,
  getNextNode,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { setCursorPosition, getCursorPosition } = useCursorContext();

  const { setCursorToPosition, getPosition } = useCursor(elementRef.current, (pos) => setCursorPosition(node.id, pos));

  useEffect(() => {
    if (!elementRef.current) return;

    if (elementRef.current.innerText !== node.text) {
      elementRef.current.innerText = node.text;
    }

    if (active) {
      elementRef.current.focus();

      const position = getCursorPosition(node.id);

      const clamped = Math.min(position, node.text.length);

      setCursorToPosition(clamped);
    }
  }, [node, active]);

  const handleClick = () => {
    setActive(node.id);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;

    const pos = getPosition();
    setCursorPosition(node.id, pos);

    updateText(node.id, text);
  };


  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const pos = getPosition();

    setCursorPosition(node.id, pos);


    if (e.key === "Enter") {
      e.preventDefault();
      const newNode = split(node.id, pos);
      if (!newNode) return;

      setCursorPosition(newNode.id, 0);

      setActive(newNode.id);
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

      setActive(mergedId);
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

        setActive(mergedId);
      }

      return;
    }


    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = getPreviousNode(node.id);
      if (!prev) return;

      const column = pos;

      setCursorPosition(node.id, pos);
      setActive(prev.id);
      setCursorPosition(prev.id, Math.min(column, prev.text.length));

      return;
    }


    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nxt = getNextNode(node.id);
      if (!nxt) return;

      const column = pos;

      setCursorPosition(node.id, pos);
      setActive(nxt.id);
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
