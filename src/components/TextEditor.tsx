import { useRef, useState } from "react";
import TextNodeData from "../types/TextNodeData";
import TextNode from "./TextNode";
import { CursorProvider } from "../contexts/CursorContext";
import Editor from "../lib/react/TextEditor/Editor" ;

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

  const create = (text: string) => {
    setCountNodes(countNodes + 1);
    return Editor.createNode(text);
  }

  const updateText = (id: string, text: string) => {
    setNodes((prev) => prev.map((node) => node.id === id ? { ...node, text, editCount: node.editCount + 1 } : node));
  }

  const split = (id: string, cursorPosition: number): TextNodeData | undefined => {
    const currentNodeIndex = nodes.findIndex((n) => n.id === id);
    const node = nodes[currentNodeIndex];
    if (!node) return;

    const [left, right] = Editor.splitNode(node, cursorPosition);

    setNodes((prev) => {
      return [...prev.slice(0, currentNodeIndex), left, right, ...prev.slice(currentNodeIndex + 1)]
    });

    setActiveId(right.id);

    return right;
  }

  const merge = (currentId?: string, otherId?: string): TextNodeData | undefined => {
    if (!currentId || !otherId) return;

    const current = nodes.filter((n) => n.id === currentId)[0];
    const other = nodes.filter((n) => n.id === otherId)[0];

    const merged = Editor.mergeNodes(current, other);
    setNodes((prev) => prev.filter((n) => n.id !== otherId).map((n) => n.id === currentId ? merged : n));
    setActiveId(currentId);

    return merged
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
      addNode(create(""));
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
