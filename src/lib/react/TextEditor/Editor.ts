import createNode from "./createNode";
import mergeNodes from "./mergeNodes";
import Node from "./Node";
import splitNode from "./splitNode";

class Editor {

  /**
   * Create a new node with the given text
   * 
   * @param {string} text 
   * @returns the created node
   */
  static createNode(text: string): Node {
    return createNode(text);
  }



  /**
   * Merge two nodes
   * 
   * @param {Node} node1 the node that will preserve its id
   * @param {Node} node2 the node that will be merged into node1
   * @returns new node with node1 id and merged text
   */
  static mergeNodes(node1: Node, node2: Node): Node {
    return mergeNodes(node1, node2);
  }



  /**
   * Split a node into two nodes
   * 
   * - if the node is empty, it will return an array with two empty nodes
   *
   * - if the offset is greater than the node text length, it will return the node and an empty node
   * 
   * @param {Node} node the node to split
   * @param {number} position the position to split the node
   * @returns an array of two nodes
   */
  static splitNode(node: Node, position: number): [Node, Node] {
    return splitNode(node, position);
  }


}

export default Editor;
