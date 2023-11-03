import grammar from "./grammar";
import nearley from "nearley";
import type { GameTreeNode, PropertyNode } from "./nodes";

export type SgfId = number;

export type SgfNode = {
  id: SgfId;
  data: Record<string, string[]>;
  parentId: number | null;
  children: SgfNode[];
};

const getProps = (nodes: PropertyNode[]): Record<string, string[]> => {
  const props: Record<string, string[]> = {};
  nodes.forEach((node) => {
    props[node.ident] = props[node.ident] ?? [];
    props[node.ident].push(...node.values);
  });
  return props;
};

export const parseSgf = (sgf: string): SgfNode[] => {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(sgf);
  const results = parser.finish();
  if (results.length > 1) throw new Error("Ambiguous parse");
  if (results.length === 0) throw new Error("Failed to parse");
  const cst = results[0] as GameTreeNode[];

  let nextId = 0;
  const getId = () => nextId++;

  const transformCst = (cst: GameTreeNode): SgfNode => {
    if (cst.sequence.length === 0) throw new Error("Empty sequence");
    const root: SgfNode = {
      id: getId(),
      data: getProps(cst.sequence[0].properties),
      parentId: null,
      children: [],
    };
    let current = root;
    const sequence = cst.sequence.slice(1);

    while (sequence.length > 0) {
      const node = sequence.shift()!;
      const newNode: SgfNode = {
        id: getId(),
        data: getProps(node.properties),
        parentId: current.id,
        children: [],
      };
      current.children.push(newNode);
      current = newNode;
    }

    const subTrees = cst.subTrees.map(transformCst).map((tree) => ({
      ...tree,
      parentId: current.id,
    }));
    current.children.push(...subTrees);

    return root;
  };

  return cst.map(transformCst);
};

export const toSgf = (sgf: SgfNode[]): string => {
  const propsToString = (props: Record<string, string[]>): string => {
    return Object.entries(props)
      .map(([ident, values]) => `${ident}[${values.join("][")}]`)
      .join("");
  };

  const nodeToString = (node: SgfNode, indent = ""): string => {
    const props = propsToString(node.data);
    if (node.children.length > 1) {
      const children = node.children
        .map((child) => nodeToString(child, indent + "  "))
        .map((child) => `\n${indent}  (${child})`)
        .join("");
      return `;${props}${children}`;
    }
    if (node.children.length === 1)
      return `;${props}\n${indent}${nodeToString(node.children[0], indent)}`;
    return `;${props}`;
  };

  return `(${sgf.map((node) => nodeToString(node)).join("")})`;
};
