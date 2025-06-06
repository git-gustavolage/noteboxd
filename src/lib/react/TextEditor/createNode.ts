import Node from "./Node";

function createNode(text: string): Node {
  return {
    id: Date.now().toString(),
    text,
    createdAt: new Date(),
    editCount: 0
  } as Node;
}

export default createNode;
