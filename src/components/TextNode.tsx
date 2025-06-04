import { useEffect, useRef, useState } from "react";
import TextNodeData from "../types/TextNodeData";
import NodeToolMenu from "./NodeToolMenu";

interface TextNodeProps {
  node: TextNodeData;
  onChange: (id: string, text: string) => void;
  onEnterAtEnd: (id: string) => void;
  onBackspaceAtStart: (id: string) => void;
  onSplit: (id: string, currentRange: number) => void;
  focus?: boolean;
}

const TextNode: React.FC<TextNodeProps> = ({ node, onChange, onEnterAtEnd, onBackspaceAtStart, onSplit, focus = false }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== node.text) {
      divRef.current.innerText = node.text;
    }
    if (focus && divRef.current) {
      divRef.current.focus();

      //TODO: verificar se ja existe algum range para mante-lo apóes um merege, se não, move o cursor para o final

      const range = document.createRange();
      range.selectNodeContents(divRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [node.text, focus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (e.key === "Enter") {
      e.preventDefault();
      //TODO: verificar se o cursor esta no final, se não estiver, fazer o split criando novo elemento com o texto restante

      const isCursorAtEnd = range && range.endOffset === el.innerText.length;

      if (!isCursorAtEnd) {
        onSplit(node.id, range?.endOffset ?? 0);
      }

      if (isCursorAtEnd) {
        onEnterAtEnd(node.id);
      }
    }

    if (e.key === "Backspace") {
      //TODO: verificar se o cursor esta no inicio, se estiver, fazer o merge
      //FIX: se nao tem conteudo e estiver no inicio, fazer o merge e setar o ponteiro do elemento atual para o item acima na lista
      const isCursorAtStart = range && range.startOffset === 0;

      if (isCursorAtStart) {
        if (el.innerText.trim() === "") {
        }
        e.preventDefault();
        onBackspaceAtStart(node.id);
      }
    }
  };

  return (
    <div
      className={"inline-flex gap-1 w-full relative items-center"}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <NodeToolMenu active={active} node={node} onMergeWithPrevious={onBackspaceAtStart} onSplit={onEnterAtEnd} onRemove={() => {
        onChange(node.id, "");
        onBackspaceAtStart(node.id);
        setActive(false);
      }} />

      <div
        ref={divRef}
        onClick={() => setActive(true)}
        contentEditable
        suppressContentEditableWarning
        className="node w-full p-1 my-1 rounded outline-none whitespace-pre-wrap min-h-[1em] text-base leading-6 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-800/90 duration-200 ease-out"
        onInput={(e) => onChange(node.id, e.currentTarget.innerText)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default TextNode;