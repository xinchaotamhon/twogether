import type { ConceptEdge, ConceptNode } from "./types";

export const UNIVERSAL_ROOT_ID = "twogether-universal-root";

export interface KnowledgePosition {
  x: number;
  y: number;
  rank: number;
}

export interface ProjectedKnowledgeLayout {
  positions: Map<string, KnowledgePosition>;
  skeletonEdges: Array<ConceptEdge & { virtual?: boolean }>;
  overlayEdges: ConceptEdge[];
  entryNodeIds: string[];
  stageWidth: number;
  stageHeight: number;
}

/**
 * Projects the content DAG into a readable, bottom-root presentation.
 * The complete DAG remains intact. One deterministic incoming relation per
 * node becomes the visual trunk/branch skeleton; every other relation remains
 * an overlay. This makes the map look like a tree without pretending a concept
 * has only one legitimate prerequisite.
 */
export function projectKnowledgeLayout(
  nodes: readonly ConceptNode[],
  edges: readonly ConceptEdge[],
  options: { horizontalGap?: number; verticalGap?: number } = {},
): ProjectedKnowledgeLayout {
  const horizontalGap = options.horizontalGap ?? 250;
  const verticalGap = options.verticalGap ?? 205;
  const nodeIds = new Set(nodes.map((node) => node.id));
  const structuralEdges = edges.filter(
    (edge) =>
      (edge.type === "part_of" || edge.type === "prerequisite") &&
      nodeIds.has(edge.from) &&
      nodeIds.has(edge.to),
  );
  const hasVisualParent = new Set(structuralEdges.map((edge) => edge.to));
  const entryNodeIds = nodes
    .filter((node) => !hasVisualParent.has(node.id))
    .map((node) => node.id)
    .sort();
  const rankById = new Map(entryNodeIds.map((id) => [id, 1]));

  for (let pass = 0; pass < nodes.length; pass += 1) {
    for (const edge of structuralEdges) {
      const parentRank = rankById.get(edge.from);
      if (parentRank === undefined) continue;
      rankById.set(
        edge.to,
        Math.max(rankById.get(edge.to) ?? 1, parentRank + 1),
      );
    }
  }
  nodes.forEach((node) => {
    if (!rankById.has(node.id)) rankById.set(node.id, 1);
  });

  const chosenParentEdges: ConceptEdge[] = [];
  for (const node of nodes) {
    const candidates = structuralEdges
      .filter((edge) => edge.to === node.id)
      .sort((a, b) => {
        const rankDifference = (rankById.get(b.from) ?? 0) - (rankById.get(a.from) ?? 0);
        if (rankDifference) return rankDifference;
        if (a.type !== b.type) return a.type === "part_of" ? -1 : 1;
        return a.from.localeCompare(b.from);
      });
    if (candidates[0]) chosenParentEdges.push(candidates[0]);
  }

  const chosenKeys = new Set(chosenParentEdges.map((edge) => `${edge.from}\u0000${edge.to}\u0000${edge.type}`));
  const overlayEdges = structuralEdges.filter(
    (edge) => !chosenKeys.has(`${edge.from}\u0000${edge.to}\u0000${edge.type}`),
  );
  const skeletonEdges: Array<ConceptEdge & { virtual?: boolean }> = [
    ...entryNodeIds.map((id) => ({
      from: UNIVERSAL_ROOT_ID,
      to: id,
      type: "part_of" as const,
      virtual: true,
    })),
    ...chosenParentEdges,
  ];

  const children = new Map<string, string[]>();
  for (const edge of skeletonEdges) {
    children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]);
  }
  children.forEach((ids) => ids.sort());
  const leafCount = Math.max(
    1,
    [UNIVERSAL_ROOT_ID, ...nodes.map((node) => node.id)].filter(
      (id) => !(children.get(id)?.length),
    ).length,
  );
  const maxRank = Math.max(1, ...rankById.values());
  const stageWidth = Math.max(1100, (leafCount + 1) * horizontalGap);
  const stageHeight = Math.max(620, (maxRank + 2) * verticalGap);
  const rootY = stageHeight - verticalGap;
  const xById = new Map<string, number>();
  let nextLeafX = horizontalGap;
  const assignX = (id: string): number => {
    const existing = xById.get(id);
    if (existing !== undefined) return existing;
    const nodeChildren = children.get(id) ?? [];
    if (!nodeChildren.length) {
      const x = nextLeafX;
      nextLeafX += horizontalGap;
      xById.set(id, x);
      return x;
    }
    const childXs = nodeChildren.map(assignX);
    const x = childXs.reduce((sum, value) => sum + value, 0) / childXs.length;
    xById.set(id, x);
    return x;
  };
  assignX(UNIVERSAL_ROOT_ID);
  const centerShift = stageWidth / 2 - (xById.get(UNIVERSAL_ROOT_ID) ?? stageWidth / 2);
  const positions = new Map<string, KnowledgePosition>();
  positions.set(UNIVERSAL_ROOT_ID, {
    x: stageWidth / 2,
    y: rootY,
    rank: 0,
  });

  for (const node of nodes) {
    const rank = rankById.get(node.id) ?? 1;
    positions.set(node.id, {
      x: (xById.get(node.id) ?? stageWidth / 2) + centerShift,
      y: rootY - rank * verticalGap,
      rank,
    });
  }

  return {
    positions,
    skeletonEdges,
    overlayEdges,
    entryNodeIds,
    stageWidth,
    stageHeight,
  };
}
