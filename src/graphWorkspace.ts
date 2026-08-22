import type { ConceptEdge, ConceptNode, LearnerId, NodeKind } from "./types";
import { wouldCreatePrerequisiteCycle } from "./collections";

const STORAGE_KEY = "twogether.graph.p0.v1";
type StorageLike = Pick<Storage, "getItem" | "setItem">;
interface GraphAdd { nodes: ConceptNode[]; edges: ConceptEdge[] }
export interface GraphView { nodes: ConceptNode[]; edges: ConceptEdge[] }

function storage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function readAdds(store: StorageLike = storage()): GraphAdd { try { const parsed = JSON.parse(store.getItem(STORAGE_KEY) ?? "null"); if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) return parsed; } catch { /* fall back to the base graph */ } return { nodes: [], edges: [] }; }
export function readGraph(baseNodes: readonly ConceptNode[], baseEdges: readonly ConceptEdge[], store: StorageLike = storage()): GraphView { const additions = readAdds(store); return { nodes: [...clone(baseNodes), ...clone(additions.nodes)], edges: [...clone(baseEdges), ...clone(additions.edges)] }; }
export function addGraphNode(input: { title: string; purpose: string; kind: NodeKind; parentId: string; relation: "part_of" | "prerequisite"; maintainer: LearnerId }, baseEdges: readonly ConceptEdge[], store: StorageLike = storage()): { ok: true; node: ConceptNode } | { ok: false; error: string } {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Hãy đặt tên cho nhánh mới." };
  if (input.relation === "prerequisite" && wouldCreatePrerequisiteCycle(baseEdges, input.parentId, `local-${Date.now()}`)) return { ok: false, error: "Nối này tạo vòng prerequisite; hãy chọn hướng khác." };
  const id = `local-node-${Date.now()}`;
  const node: ConceptNode = { id, kind: input.kind, title, purpose: input.purpose.trim() || "Một nhánh mới để gắn nguyên lý với cơ chế và ví dụ.", status: "draft", source_refs: ["local-authoring:p0"], maintainer: input.maintainer };
  const additions = readAdds(store);
  additions.nodes.push(node);
  additions.edges.push({ from: input.parentId, to: id, type: input.relation });
  store.setItem(STORAGE_KEY, JSON.stringify(additions));
  return { ok: true, node };
}
