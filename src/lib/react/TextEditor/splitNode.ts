import createNode from "./createNode";
import Node from "./Node";

function splitNode(node: Node, position: number): [Node, Node] {
  if (
    !node.text
    || node.text.length <= 0
    || position <= 0
    || typeof node.text !== 'string'
  ) return [node, createNode("")];

  const newNode = createNode(node.text.slice(position).trimEnd());

  node.text = node.text.slice(0, position);

  return [node, newNode];
}

export default splitNode;
