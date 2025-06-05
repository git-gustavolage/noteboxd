import { useRef, useState } from "react";
import TextNodeData from "../types/TextNodeData";
import TextNode from "./TextNode";
import { CursorProvider } from "../contexts/CursorContext";

export const TextEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<TextNodeData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [countNodes, setCountNodes] = useState(1);
  const [mapTest, setMapTest] = useState(new Map());

  const setActive = (id: string) => {
    setActiveId(id);
  }

  const addNode = (node: TextNodeData) => {
    setNodes((prev) => prev.find((n) => n.id === node.id) ? prev : [...prev, node]);
    setActive(node.id);
    mapTest.set(node.id, node);
    setMapTest(new Map(mapTest));
  }

  const createNode = (text: string) => {
    setCountNodes(countNodes + 1);
    return {
      id: countNodes.toString(),
      text,
      createdAt: new Date(),
      editCount: 0
    }
  }

  const updateText = (id: string, text: string) => {
    setNodes((prev) => prev.map((node) => node.id === id ? { ...node, text, editCount: node.editCount + 1 } : node));
  }

  const split = (id: string, cursorPosition: number): TextNodeData | undefined => {
    //TODO: refatorar
    const node = nodes.filter((n) => n.id === id)[0];
    if (!node) return;

    const left = { ...node, text: node.text.slice(0, cursorPosition) };
    const right = createNode(node.text.slice(cursorPosition).trimEnd());

    setActiveId(right.id);

    setNodes((prev) => [...prev.filter((n) => n.id !== id), left, right]);

    return right;
  }

  const merge = (current_id?: string, otherId?: string): TextNodeData | undefined => {
    if (!current_id || !otherId) return;

    const current = nodes.filter((n) => n.id === current_id)[0];
    const other = nodes.filter((n) => n.id === otherId)[0];

    if (!current || !other) return;

    const merged = { ...current, text: current.text + other.text, editCount: current.editCount + 1 };
    setNodes((prev) => prev.filter((n) => n.id !== otherId).map((n) => n.id === current_id ? merged : n));
    setActiveId(current_id);
    return merged;
  }

  const getPreviousNode = (id: string) => {
    const index = nodes.findIndex((n) => n.id === id);
    if (index <= 0) return null;
    return nodes[index - 1];
  }

  const getNextNode = (id: string) => {
    const index = nodes.findIndex((n) => n.id === id);
    if (index >= nodes.length - 1) return null;
    return nodes[index + 1];
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      addNode(createNode(""));
    }
  };

  return (
    <CursorProvider>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[50px] bg-white text-black"
        onClick={handleClick}
      >
        {nodes.map((node) => (
          <TextNode
            key={node.id}
            node={node}
            setActive={setActive}
            updateText={updateText}
            split={split}
            merge={merge}
            active={node.id === activeId}
            getPreviousNode={getPreviousNode}
            getNextNode={getNextNode}
          />
        ))}
      </div>
    </CursorProvider>
  )
}
