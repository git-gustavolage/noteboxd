import { useRef, useState } from "react";
import TextNodeData from "../types/TextNodeData";
import TextNode from "./TextNode";

const TextEditor: React.FC = () => {
  const [nodes, setNodes] = useState<TextNodeData[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = (afterId?: string) => {
    const newNode: TextNodeData = {
      id: new Date().getTime().toString(),
      text: "",
      createdAt: new Date(),
      editCount: 0,
    };

    setNodes((prev) => {
      if (!afterId) return [...prev, newNode];
      const index = prev.findIndex((n) => n.id === afterId);
      const newList = [
        ...prev.slice(0, index + 1),
        newNode,
        ...prev.slice(index + 1),
      ];
      return newList;
    });

    setFocusedId(newNode.id);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setFocusedId(nodes.filter((n) => n.id !== id)[0]?.id ?? null);
  };

  const mergeWithPrevious = (id: string) => {
    console.log("asd");

    setNodes((prev) => {
      const index = prev.findIndex((n) => n.id === id);
      if (index <= 0) return prev;
      const current = prev[index];
      const previous = prev[index - 1];
      const merged = {
        ...previous,
        text: previous.text + current.text,
        editCount: previous.editCount + 1,
      };
      return [
        ...prev.slice(0, index - 1),
        merged,
        ...prev.slice(index + 1),
      ];
    });
    setFocusedId(() => {
      const idx = nodes.findIndex((n) => n.id === id);
      return idx > 0 ? nodes[idx - 1].id : null;
    });
  };

  const updateNode = (id: string, newText: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, text: newText, editCount: node.editCount + 1 }
          : node
      )
    );
  };

  const handleBackspaceAtStart = (id: string) => {
    const current = nodes.find((n) => n.id === id);
    if (!current) return;
    if (current.text.trim() === "") {
      removeNode(id);
    } else {
      mergeWithPrevious(id);
    }
  };

  //TODO: criar comando para split que permita dividir o texto em duas partes
  const handleSplit = (id: string, currentRange: number) => {
    const current = nodes.find((n) => n.id === id);
    if (!current) return;

    const text = current.text;
    const splitText = (text: string, index: number) => {
      return [text.slice(0, index), text.slice(index)];
    }

    const [left, right] = splitText(text, currentRange);

    const newNode: TextNodeData = {
      id: new Date().getTime().toString(),
      text: right,
      createdAt: new Date(),
      editCount: 0,
    };

    setNodes((prev) => {
      const index = prev.findIndex((n) => n.id === id);
      return [
        ...prev.slice(0, index),
        {
          ...prev[index],
          text: left,
        },
        newNode,
        ...prev.slice(index + 1),
      ];
    });
    setFocusedId(newNode.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      addNode();
    }
  };

  return (
    <div
      ref={containerRef}
      className="px-4 py-8 w-full h-full bg-zinc-900 text-white"
      onClick={handleClick}
    >
      {nodes.map((node) => (
        <TextNode
          key={node.id}
          node={node}
          onChange={updateNode}
          onEnterAtEnd={addNode}
          onBackspaceAtStart={handleBackspaceAtStart}
          onSplit={handleSplit}
          focus={node.id === focusedId}
        />
      ))}
      <div>
        {nodes.map((node) => (
          <p>
            {node.id} - {node.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TextEditor;