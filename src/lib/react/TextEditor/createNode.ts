import Node from "./Node";

function createNode(text: string): Node {
  return {
    id: Date.now().toString(),
    text,
    createdAt: new Date(),
    editCount: 0,
    cursorPosition: 0,
    active: true,
  } as Node;
}

export default createNode;
