import type { SgfId, SgfNode, SgfNodeInfo } from "../sgf/parse";

export type Sgf = SgfNode[];

export type NormalizedSgfNode = SgfNodeInfo & {
  children: number[];
};

export type NormalizedSgf = {
  nodes: { [key: SgfId]: NormalizedSgfNode };
  root: SgfId[];
};

export const normalizeSgf = (sgf: Sgf): NormalizedSgf => {
  const normalizedSgf: NormalizedSgf = {
    nodes: {},
    root: sgf.map((node) => node.id),
  };

  const normalizeNode = (node: SgfNode): number => {
    const id = node.id;
    normalizedSgf.nodes[id] = {
      id,
      data: node.data,
      parentId: node.parentId,
      children: node.children.map(normalizeNode),
    };
    return id;
  };

  sgf.forEach(normalizeNode);

  return normalizedSgf;
};

export const denormalizeSgf = (normalizedSgf: NormalizedSgf): Sgf => {
  const denormalizeNode = (id: number): SgfNode => {
    const normalizedNode = normalizedSgf.nodes[id];
    const children = normalizedNode.children.map(denormalizeNode);
    const node: SgfNode = {
      id: normalizedNode.id,
      data: normalizedNode.data,
      parentId: normalizedNode.parentId,
      children,
    };
    return node;
  };

  const nodes = normalizedSgf.root.map((rootNode) => denormalizeNode(rootNode));

  return nodes;
};
