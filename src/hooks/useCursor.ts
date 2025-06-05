export default function useCursor(element: HTMLElement) {

  const setCursorToEnd = () => {
    if (!element) return;

    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  //TODO: corrigir caso em que o cursor estiver no inicio do node
  function getCaretCharacterOffsetWithin() {
    if (!element) return;

    const selection = window.getSelection();
    if (!selection) return 1;
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

  return { setCursorToEnd, getCaretCharacterOffsetWithin };
}
