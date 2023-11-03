import type { SgfNode } from "../sgf/parse";

export type Sgf = SgfNode[];

export type NormalizedSgf = {
  [key: number]: {
    id: number;
    data: Record<string, string[]>;
    parentId: number | null;
    children: number[];
  };
};

export const normalizeSgf = (sgf: Sgf): NormalizedSgf => {
  const normalizedSgf: NormalizedSgf = {};

  const normalizeNode = (node: SgfNode): number => {
    const id = node.id;
    normalizedSgf[id] = {
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
    const normalizedNode = normalizedSgf[id];
    const children = normalizedNode.children.map(denormalizeNode);
    const node: SgfNode = {
      id: normalizedNode.id,
      data: normalizedNode.data,
      parentId: normalizedNode.parentId,
      children,
    };
    return node;
  };

  const nodes = Object.values(normalizedSgf)
    .filter((node) => node.parentId === null)
    .map((rootNode) => denormalizeNode(rootNode.id));

  return nodes;
};
