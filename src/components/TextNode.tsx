import { useEffect, useRef } from "react";
import TextNodeData from "../types/TextNodeData";
import useCursor from "../hooks/useCursor";

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

  const { setCursorToEnd, getCaretCharacterOffsetWithin } = useCursor(element.current!);

  useEffect(() => {
    if (element.current && element.current.innerText !== node.text) {
      element.current.innerText = node.text;
    }
    if (active && element.current) {
      element.current.focus();
      setCursorToEnd();
    }
  }, [node.text, active]);


  const handleInput = (e: React.InputEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    updateText(node.id, text);
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {

    if (e.key === "Enter") {
      e.preventDefault();
      split(node.id, getCaretCharacterOffsetWithin()!);
    }

    if (e.key === "Backspace" && getCaretCharacterOffsetWithin() === 0) {
      e.preventDefault();
      const prev = getPreviusNode(node.id);
      if(!prev) return;
      merge(prev!.id, node.id);
    }

    if (e.key === "Delete" && getCaretCharacterOffsetWithin() === element.current!.innerText.length) {
      e.preventDefault();
      const next = getNextNode(node.id);
      if(!next) return;
      merge(node.id, next!.id);
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