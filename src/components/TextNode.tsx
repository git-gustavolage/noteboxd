import { useEffect, useRef, useState } from "react";
import TextNodeData from "../types/TextNodeData";

//funcoes para manipulaão dos elementos:
//split => separa o lado esquerdo do cursor do direito e cria um novo elemento a baixo, contendo o texto a direita. 
//merge => une dois elementos , em 2 cenários diferentes:
//1- com a tecla delete, com o cursor no final do elemento atual, o texto do elemento seguinte vai para o elemento atual, e o elemento seguinte vai ser removido
//2- com a tecla backspace, com o cursor no inicio do elemento atual, o texto do elemento atual vai para o elemento anterior, e o elemento atual vai ser removido


//divisão do código:
//elementos:

//TextEditor: contém todos os elementos, e também contém as funcoes de manipulacao dos elementos, além de manter a referência do elemento atualmente focado
//TextNode: é o responsável por manipular visualmente o texto, e também contém as funcoes de manipulacao do texto; armazena uma referencia ao node para manipulação
//Node: é o elemento em si
//uma de susas funções é o updateText, que atualiza o texto do node e possui um callback que atualiza o estado no TextEditor

const setCursorToEnd = (element: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

function getCaretCharacterOffsetWithin(element: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return 0;
  let caretOffset = 0;

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }

  return caretOffset;
}

export const TextEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<TextNodeData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [countNodes, setCountNodes] = useState(1);
  const [mapTest, setMapTest] = useState(new Map());

  console.log(nodes);


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

  const split = (id: string, cursorPosition: number) => {
    setNodes((prev) => {
      const index = prev.findIndex((n) => n.id === id);
      const current = prev[index];

      if (!current) return prev;

      const left = { ...current, text: current.text.slice(0, cursorPosition) };
      const right = createNode(current.text.slice(cursorPosition).trimEnd());

      setActiveId(right.id);

      return [...prev.slice(0, index), left, right, ...prev.slice(index + 1)];
    });
  }

  const merge = (current_id?: string, otherId?: string) => {
    if (!current_id || !otherId) return;

    const current = nodes.filter((n) => n.id === current_id)[0];
    const other = nodes.filter((n) => n.id === otherId)[0];

    if (!current || !other) return;

    const merged = { ...current, text: current.text + other.text, editCount: current.editCount + 1 };
    setNodes((prev) => prev.filter((n) => n.id !== otherId).map((n) => n.id === current_id ? merged : n));
    setActiveId(current_id);
    return merged;
  }

  const getPreviusNode = (id: string) => {
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
          getPreviusNode={getPreviusNode}
          getNextNode={getNextNode}
        />
      ))}
    </div>
  )
}

interface TextNodeProps {
  node: TextNodeData,
  updateText: (id: string, text: string) => void
  split: (id: string, cursorPosition: number) => void
  merge: (currentId?: string, otherId?: string) => TextNodeData | undefined
  active: boolean,
  setActive: (id: string) => void,
  getPreviusNode: (id: string) => TextNodeData | null
  getNextNode: (id: string) => TextNodeData | null
}

const TextNode: React.FC<TextNodeProps> = ({ node, updateText, split, merge, active, setActive, getPreviusNode, getNextNode }) => {
  const element = useRef<HTMLDivElement>(null);
  const cursorPosition = useRef(0);

  useEffect(() => {
    if (element.current && element.current.innerText !== node.text) {
      element.current.innerText = node.text;
    }
    if (active && element.current) {
      element.current.focus();
      setCursorToEnd(element.current);
    }
  }, [node.text, active]);


  const handleInput = (e: React.InputEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    updateText(node.id, text);
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {

    if (e.key === "Enter") {
      e.preventDefault();
      cursorPosition.current = getCaretCharacterOffsetWithin(element.current!);
      split(node.id, cursorPosition.current);
    }

    if (e.key === "Backspace" && getCaretCharacterOffsetWithin(element.current!) === 0) {
      e.preventDefault();
      const prev = getPreviusNode(node.id);
      if(!prev) return;
      const merged = merge(prev!.id, node.id);
      if (merged) {
        cursorPosition.current = getCaretCharacterOffsetWithin(element.current!);
      }
    }

    if (e.key === "Delete" && getCaretCharacterOffsetWithin(element.current!) === element.current!.innerText.length) {
      e.preventDefault();
      const next = getNextNode(node.id);
      if(!next) return;
      const merged = merge(node.id, next!.id);
      if (merged) {
        cursorPosition.current = getCaretCharacterOffsetWithin(element.current!);
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = getPreviusNode(node.id);
      if(!prev) return;
      setActive(prev!.id);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = getNextNode(node.id);
      if(!next) return;
      setActive(next!.id);
    }
  }

  return (
    <div>
      <div
        ref={element}
        className={"node w-full p-0.5 my-1 rounded outline-none whitespace-pre-wrap min-h-[1em] text-base leading-6"}
        onInput={handleInput}
        onClick={() => setActive(node.id)}
        onKeyDown={handleKeyPress}
        contentEditable
        suppressContentEditableWarning
      />
    </div>
  )
}


// const TextNode: React.FC<TextNodeProps> = ({ node, onChange, onEnterAtEnd, onBackspaceAtStart, onSplit, focus = false }) => {
//   const divRef = useRef<HTMLDivElement>(null);
//   const [active, setActive] = useState(false);
//   const cursorPosition = useRef(0);

//   useEffect(() => {
//     if (divRef.current && divRef.current.innerText !== node.text) {
//       divRef.current.innerText = node.text;
//     }
//     if (focus && divRef.current) {
//       divRef.current.focus();

//       //TODO: verificar se ja existe algum range para mante-lo apóes um merege, se não, move o cursor para o final

//       const range = document.createRange();
//       range.selectNodeContents(divRef.current);
//       range.collapse(false);
//       const selection = window.getSelection();
//       selection?.removeAllRanges();
//       selection?.addRange(range);
//     }
//   }, [node.text, focus]);

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     const selection = window.getSelection();
//     const range = selection?.getRangeAt(0);

//     if (e.key === "Enter") {
//       e.preventDefault();
//       //TODO: verificar se o cursor esta no final, se não estiver, fazer o split criando novo elemento com o texto restante

//       const isCursorAtEnd = range && range.endOffset === el.innerText.length;

//       if (!isCursorAtEnd) {
//         onSplit(node.id, range?.endOffset ?? 0);
//       }

//       if (isCursorAtEnd) {
//         onEnterAtEnd(node.id);
//       }
//     }

//     if (e.key === "Backspace") {
//       //TODO: verificar se o cursor esta no inicio, se estiver, fazer o merge
//       //FIX: se nao tem conteudo e estiver no inicio, fazer o merge e setar o ponteiro do elemento atual para o item acima na lista
//       const isCursorAtStart = range && range.startOffset === 0;

//       if (isCursorAtStart) {
//         if (el.innerText.trim() === "") {
//         }
//         e.preventDefault();
//         onBackspaceAtStart(node.id);
//       }
//     }
//   };

//   return (
//     <div
//       className={"inline-flex gap-1 w-full relative items-center"}
//       onMouseEnter={() => setActive(true)}
//       onMouseLeave={() => setActive(false)}
//     >
//       <NodeToolMenu active={active} node={node} onMergeWithPrevious={onBackspaceAtStart} onSplit={onEnterAtEnd} onRemove={() => {
//         onChange(node.id, "");
//         onBackspaceAtStart(node.id);
//         setActive(false);
//       }} />

//       <div
//         ref={divRef}
//         onClick={() => setActive(true)}
//         contentEditable
//         suppressContentEditableWarning
//         className="node w-full p-1 my-1 rounded outline-none whitespace-pre-wrap min-h-[1em] text-base leading-6 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-800/90 duration-200 ease-out"
//         onInput={(e) => onChange(node.id, e.currentTarget.innerText)}
//         onKeyDown={handleKeyDown}
//       />
//     </div>
//   );
// };

export default TextNode;