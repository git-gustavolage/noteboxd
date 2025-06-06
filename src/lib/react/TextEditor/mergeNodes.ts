import Node from "./Node";

function mergeNodes(node1: Node, node2: Node): Node {
  return {
    id: node1.id,
    text: node1.text + node2.text,
    createdAt: node1.createdAt,
    editCount: node1.editCount + 1,
  };
}

export default mergeNodes;
