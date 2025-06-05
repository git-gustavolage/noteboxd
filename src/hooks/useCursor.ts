import { useEffect, useRef, useCallback } from "react";

type OnPositionChange = (pos: number) => void;

export default function useCursor(element: HTMLElement | null, onPositionChange?: OnPositionChange) {
  const currentPosition = useRef<number>(0);

  const setPosition = useCallback((position: number) => {
    currentPosition.current = position;
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [onPositionChange]);


  const setCursorToEnd = useCallback(() => {
    if (!element) return;
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    setPosition(element.innerText.length);
  }, [element, setPosition]);


  const setCursorToPosition = useCallback((pos: number) => {
    if (!element) return;
    const textNode = element.firstChild;

    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      const selection = window.getSelection();
      
      const safePos = Math.min(Math.max(pos, 0), (textNode.textContent || "").length);

      range.setStart(textNode, safePos);
      range.collapse(true);

      selection?.removeAllRanges();
      selection?.addRange(range);

      setPosition(safePos);
    } else {
      setCursorToEnd();
    }
  }, [element, setPosition, setCursorToEnd]);


  const getPosition = useCallback((): number => {
    if (!element) return 0;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const caretOffset = preCaretRange.toString().length;

    setPosition(caretOffset);

    return caretOffset;
  }, [element, setPosition]);


  useEffect(() => {
    if (!element) return;

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      
      if (element.contains(range.endContainer)) {
        getPosition();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [element, getPosition]);

  return {
    setPosition,
    setCursorToEnd,
    setCursorToPosition,
    getPosition,
  };
}
