import { useState } from "react";
import TextNodeData from "../types/TextNodeData";
import DotsGrid from "./icons/DotsGrid";

interface NodeToolMenuProps {
  active: boolean;
  node: TextNodeData;
  onMergeWithPrevious: (id: string) => void;
  onSplit: (id: string) => void;
  onRemove: (id: string) => void;
}

const NodeToolMenu: React.FC<NodeToolMenuProps> = ({ active, node, onMergeWithPrevious, onSplit, onRemove }) => {

  const [show, setShow] = useState(false);

  if (!active) return <span className="w-6"></span>;

  return (
    <div className="gap-2 relative ">
      <button
        onClick={() => setShow(!show)}
        className="w-6 h-8 flex items-center justify-center p-0.5 rounded-sm hover:bg-zinc-800 duration-200 ease-out cursor-pointer text-zinc-500 "
      >
        <DotsGrid />
      </button>
      {show && <Actions node={node} onMergeWithPrevious={onMergeWithPrevious} onSplit={onSplit} onRemove={onRemove} />}
    </div>
  );
}

interface ActionsProps {
  node: TextNodeData;
  onMergeWithPrevious: (id: string) => void;
  onSplit: (id: string) => void;
  onRemove: (id: string) => void;
}

//TODO: estilizar corretamente
const Actions: React.FC<ActionsProps> = ({ node, onMergeWithPrevious, onSplit, onRemove }) => {

  return (
    <div className="absolute flex flex-col gap-2 top-6 left-0 mt-2 p-2 border border-zinc-800 rounded-md z-10 bg-zinc-900">
      <button onClick={() => onMergeWithPrevious(node.id)}>Merge</button>
      <button onClick={() => onSplit(node.id)}>Split</button>
      <button onClick={() => onRemove(node.id)}>Remove</button>
    </div>
  )
}

export default NodeToolMenu