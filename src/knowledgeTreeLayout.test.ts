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

  it("uses a prerequisite as a visible branch when it is the only parent", () => {
    const edges: ConceptEdge[] = [
      { from: "english", to: "react", type: "prerequisite" },
    ];
    const layout = projectKnowledgeLayout([node("english"), node("react")], edges);
    expect(layout.positions.get("english")!.rank).toBe(1);
    expect(layout.positions.get("react")!.rank).toBe(2);
    expect(layout.skeletonEdges).toContainEqual(edges[0]);
    expect(layout.overlayEdges).toEqual([]);
  });

  it("renders a multi-parent node once, choosing one tree parent while retaining the other relation", () => {
    const layout = projectKnowledgeLayout(
      [node("a"), node("b"), node("shared")],
      [
        { from: "a", to: "shared", type: "part_of" },
        { from: "b", to: "shared", type: "part_of" },
      ],
    );
    expect([...layout.positions.keys()].filter((id) => id === "shared")).toHaveLength(1);
    expect(layout.skeletonEdges.filter((edge) => edge.to === "shared")).toHaveLength(1);
    expect(layout.overlayEdges.filter((edge) => edge.to === "shared")).toHaveLength(1);
  });

  it("fans sibling branches around their parent instead of placing the curriculum in one flat row", () => {
    const layout = projectKnowledgeLayout(
      [node("trunk"), node("left"), node("right"), node("leaf")],
      [
        { from: "trunk", to: "left", type: "prerequisite" },
        { from: "trunk", to: "right", type: "prerequisite" },
        { from: "right", to: "leaf", type: "prerequisite" },
      ],
    );
    expect(layout.positions.get("left")!.x).not.toBe(layout.positions.get("right")!.x);
    expect(layout.positions.get("trunk")!.x).toBeGreaterThan(layout.positions.get("left")!.x);
    expect(layout.positions.get("trunk")!.x).toBeLessThan(layout.positions.get("right")!.x);
    expect(layout.positions.get("leaf")!.y).toBeLessThan(layout.positions.get("right")!.y);
  });
});
