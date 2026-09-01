import { describe, expect, it } from "vitest";
import { projectKnowledgeLayout, UNIVERSAL_ROOT_ID } from "./knowledgeTreeLayout";
import type { ConceptEdge, ConceptNode } from "./types";

const node = (id: string): ConceptNode => ({
  id,
  kind: "branch",
  title: id,
  purpose: id,
  status: "published",
  source_refs: ["test"],
  maintainer: "hiep",
});

describe("bottom-root knowledge projection", () => {
  it("places the universal root below every content node", () => {
    const layout = projectKnowledgeLayout(
      [node("english"), node("clauses")],
      [{ from: "english", to: "clauses", type: "part_of" }],
    );
    const rootY = layout.positions.get(UNIVERSAL_ROOT_ID)!.y;
    expect(rootY).toBeGreaterThan(layout.positions.get("english")!.y);
    expect(layout.positions.get("english")!.y).toBeGreaterThan(
      layout.positions.get("clauses")!.y,
    );
  });

  it("keeps prerequisite edges as overlays instead of changing visual rank", () => {
    const edges: ConceptEdge[] = [
      { from: "english", to: "react", type: "prerequisite" },
    ];
    const layout = projectKnowledgeLayout([node("english"), node("react")], edges);
    expect(layout.positions.get("english")!.rank).toBe(1);
    expect(layout.positions.get("react")!.rank).toBe(1);
    expect(layout.overlayEdges).toEqual(edges);
  });

  it("renders a multi-parent node once and keeps both part-of relations", () => {
    const layout = projectKnowledgeLayout(
      [node("a"), node("b"), node("shared")],
      [
        { from: "a", to: "shared", type: "part_of" },
        { from: "b", to: "shared", type: "part_of" },
      ],
    );
    expect([...layout.positions.keys()].filter((id) => id === "shared")).toHaveLength(1);
    expect(layout.skeletonEdges.filter((edge) => edge.to === "shared")).toHaveLength(2);
  });
});

