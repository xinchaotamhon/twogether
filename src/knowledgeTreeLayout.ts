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
 * `part_of` owns visual rank. Prerequisites remain overlays and cannot silently
 * move a node or duplicate it in the tree.
 */
export function projectKnowledgeLayout(
  nodes: readonly ConceptNode[],
  edges: readonly ConceptEdge[],
  options: { horizontalGap?: number; verticalGap?: number } = {},
): ProjectedKnowledgeLayout {
  const horizontalGap = options.horizontalGap ?? 280;
  const verticalGap = options.verticalGap ?? 210;
  const nodeIds = new Set(nodes.map((node) => node.id));
  const partOfEdges = edges.filter(
    (edge) =>
      edge.type === "part_of" && nodeIds.has(edge.from) && nodeIds.has(edge.to),
  );
  const overlayEdges = edges.filter(
    (edge) =>
      edge.type === "prerequisite" &&
      nodeIds.has(edge.from) &&
      nodeIds.has(edge.to),
  );
  const hasVisualParent = new Set(partOfEdges.map((edge) => edge.to));
  const entryNodeIds = nodes
    .filter((node) => !hasVisualParent.has(node.id))
    .map((node) => node.id)
    .sort();
  const rankById = new Map(entryNodeIds.map((id) => [id, 1]));

  for (let pass = 0; pass < nodes.length; pass += 1) {
    for (const edge of partOfEdges) {
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

  const ranks = new Map<number, ConceptNode[]>();
  for (const node of nodes) {
    const rank = rankById.get(node.id) ?? 1;
    ranks.set(rank, [...(ranks.get(rank) ?? []), node]);
  }
  ranks.forEach((rankNodes) => rankNodes.sort((a, b) => a.id.localeCompare(b.id)));
  const maxRank = Math.max(1, ...ranks.keys());
  const widestRank = Math.max(1, ...[...ranks.values()].map((items) => items.length));
  const stageWidth = Math.max(960, (widestRank + 1) * horizontalGap);
  const stageHeight = Math.max(620, (maxRank + 2) * verticalGap);
  const rootY = stageHeight - verticalGap;
  const positions = new Map<string, KnowledgePosition>();
  positions.set(UNIVERSAL_ROOT_ID, {
    x: stageWidth / 2,
    y: rootY,
    rank: 0,
  });

  for (const [rank, rankNodes] of ranks) {
    rankNodes.forEach((node, index) => {
      positions.set(node.id, {
        x: ((index + 1) / (rankNodes.length + 1)) * stageWidth,
        y: rootY - rank * verticalGap,
        rank,
      });
    });
  }

  const skeletonEdges: Array<ConceptEdge & { virtual?: boolean }> = [
    ...entryNodeIds.map((id) => ({
      from: UNIVERSAL_ROOT_ID,
      to: id,
      type: "part_of" as const,
      virtual: true,
    })),
    ...partOfEdges,
  ];

  return {
    positions,
    skeletonEdges,
    overlayEdges,
    entryNodeIds,
    stageWidth,
    stageHeight,
  };
}

