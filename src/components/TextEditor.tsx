import { useRef, useState } from "react";
import TextNode from "./TextNode";
import { CursorProvider } from "../contexts/CursorContext";
import Editor from "../lib/react/TextEditor/Editor";
import Node from "../lib/react/TextEditor/Node";

type State = Node[];

type SetStateAction = State | ((prevState: State) => State);

const useHistory = (initialState: State): [State, (action: SetStateAction) => void, () => void, () => void] => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<State[]>([initialState]);

  const setState = (action: SetStateAction) => {
    const newState = typeof action === 'function' ? (action as (prevState: State) => State)(history[index]) : action;

    setHistory((prev) => [...prev.slice(0, index + 1), newState]);
    setIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (index === 0) return;
    setIndex((prev) => prev - 1);
  }

  const redo = () => {
    if (index === history.length - 1) return;
    setIndex((prev) => prev + 1);
  }

  return [history[index], setState, undo, redo];
};


export const TextEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, undo, redo] = useHistory([Editor.createNode("")]);
  const [countNodes, setCountNodes] = useState(1);

  const addNode = (node: Node) => {
    setNodes((prev) => prev.find((n) => n.id === node.id) ? prev : [...prev, node]);
  }

  const create = (text: string) => {
    setCountNodes(countNodes + 1);
    return Editor.createNode(text);
  }

  const updateNode = (node: Node) => {
    setNodes((prev) => prev.map((n) => n.id === node.id ? { ...node, editCount: n.editCount + 1 } : n));
  }

  const split = (id: string, cursorPosition: number): Node | undefined => {
    const currentNodeIndex = nodes.findIndex((n) => n.id === id);
    const node = nodes[currentNodeIndex];
    if (!node) return;

    const [left, right] = Editor.splitNode(node, cursorPosition);

    setNodes((prev) => {
      return [...prev.slice(0, currentNodeIndex), left, right, ...prev.slice(currentNodeIndex + 1)]
    });

    return right;
  }

  const merge = (currentId?: string, otherId?: string): Node | undefined => {
    if (!currentId || !otherId) return;

    const current = nodes.filter((n) => n.id === currentId)[0];
    const other = nodes.filter((n) => n.id === otherId)[0];

    const merged = Editor.mergeNodes(current, other);
    setNodes((prev) => prev.filter((n) => n.id !== otherId).map((n) => n.id === currentId ? merged : n));

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
      <div className="flex gap-4">
        <button
          onClick={undo}
          className="border px-3 py-1 text-sm rounded-md bg-gray-400 text-white "
        >
          {"<- Undo"}
        </button>
        <button
          onClick={redo} className="border px-3 py-1 text-sm rounded-md bg-gray-400 text-white "
        >
          {"Redo ->"}
        </button>
      </div>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[50px] bg-white text-black border border-gray-300 rounded-md mt-4"
        onClick={handleClick}
        
      >
        {nodes.map((node) => (
          <TextNode
            key={node.id}
            node={node}
            updateNode={updateNode}
            split={split}
            merge={merge}
            getPreviousNode={getPreviousNode}
            getNextNode={getNextNode}
            undo={undo}
          />
        ))}
      </div>
    </CursorProvider>
  )
}
