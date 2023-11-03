export type PropertyNode = {
  ident: string;
  values: string[];
};

export type NodeNode = {
  properties: PropertyNode[];
};

export type GameTreeNode = {
  sequence: NodeNode[];
  subTrees: GameTreeNode[];
};

export const Property = (nodes: any[]): PropertyNode => {
  const [ident, values] = nodes;
  return {
    ident: ident.value,
    values: values.map((val: any) => val[1].value.slice(1, -1)),
  };
};

export const Node = (nodes: any[]): NodeNode => {
  return { properties: nodes[1].map((prop: any) => prop[1]) };
};

export const Sequence = (nodes: any[]) => {
  return nodes[0].map((node: any) => node[1]);
};

export const GameTree = (nodes: any[]): GameTreeNode => ({
  sequence: nodes[2],
  subTrees: nodes[3].map((tree: any) => tree[1]),
});

export const Collection = (nodes: any[]) =>
  nodes[0].map((node: any) => node[1]);
