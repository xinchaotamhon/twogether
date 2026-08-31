import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge as FlowEdge,
  type EdgeProps,
  type Node as FlowNode,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { addGraphNode } from "./graphWorkspace";
import type { Card, ConceptEdge, ConceptNode, LearnerId, LearnerSnapshot } from "./types";

type DisplayNode = Pick<ConceptNode, "id" | "title" | "purpose" | "status"> & { kind: ConceptNode["kind"] | "universal"; virtual?: boolean };
type TreeEdge = { from: string; to: string; type: string; virtual?: boolean };
interface Progress { count: number; stable: number; percent: number }
interface KnowledgeNodeData extends Record<string, unknown> { displayNode: DisplayNode; progress: Progress }
type KnowledgeFlowNode = FlowNode<KnowledgeNodeData, "knowledge">;
type KnowledgeFlowEdge = FlowEdge<{ relation: string }, "knowledge">;

const UNIVERSAL_ROOT: DisplayNode = { id: "twogether-universal-root", kind: "universal", title: "Bản chất chung", purpose: "Mọi nhánh bắt đầu từ nguyên lý, đi qua cơ chế, ranh giới rồi chuyển sang tình huống mới.", status: "framework", virtual: true };
const treeKindLabels: Record<DisplayNode["kind"], string> = { universal: "Gốc chung", root: "Bộ kiến thức", trunk: "Thân nguyên lý", branch: "Cành cơ chế", leaf: "Lá chuyển giao" };

function KnowledgeNode({ data, selected }: NodeProps<KnowledgeFlowNode>) {
  const { displayNode: node, progress } = data;
  return <div data-testid={`tree-node-${node.id}`} className={`flow-knowledge-node ${node.kind}${selected ? " is-selected" : ""}`}>
    <Handle type="target" position={Position.Top} isConnectable={false} className="knowledge-handle" />
    <span className="node-kind">{treeKindLabels[node.kind]}</span>
    <strong>{node.title}</strong>
    <span className="tree-node-meter" aria-hidden="true"><i style={{ width: `${progress.percent}%` }} /></span>
    <span className="tree-node-progress">{progress.count ? `${progress.stable}/${progress.count} card bền hơn` : "Chưa có card trực tiếp"}</span>
    <Handle type="source" position={Position.Bottom} isConnectable={false} className="knowledge-handle" />
  </div>;
}

function KnowledgeEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<KnowledgeFlowEdge>) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return <path id={id} data-testid="tree-link" className={`flow-knowledge-edge ${data?.relation ?? "part_of"}`} d={path} fill="none" />;
}

const nodeTypes = { knowledge: KnowledgeNode };
const edgeTypes = { knowledge: KnowledgeEdge };

function projectDepths(nodes: readonly ConceptNode[], structuralEdges: readonly ConceptEdge[]): { depthById: Map<string, number>; entryNodes: ConceptNode[] } {
  const nodesWithParents = new Set(structuralEdges.map((edge) => edge.to));
  const entryNodes = nodes.filter((node) => !nodesWithParents.has(node.id));
  const depthById = new Map<string, number>(entryNodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass += 1) {
    for (const edge of structuralEdges) {
      const fromDepth = depthById.get(edge.from);
      if (fromDepth !== undefined) depthById.set(edge.to, Math.max(depthById.get(edge.to) ?? 0, fromDepth + 1));
    }
  }
  nodes.forEach((node) => { if (!depthById.has(node.id)) depthById.set(node.id, 0); });
  return { depthById, entryNodes };
}

export function KnowledgeMap({ nodes, edges, cards, snapshot, learnerId, onGraphChanged }: { nodes: ConceptNode[]; edges: ConceptEdge[]; cards: Card[]; snapshot: LearnerSnapshot; learnerId: LearnerId; onGraphChanged: () => void }) {
  const displayNodes: DisplayNode[] = useMemo(() => [UNIVERSAL_ROOT, ...nodes], [nodes]);
  const structuralEdges = useMemo(() => edges.filter((edge) => edge.type === "part_of" || edge.type === "prerequisite"), [edges]);
  const { depthById, entryNodes } = useMemo(() => projectDepths(nodes, structuralEdges), [nodes, structuralEdges]);
  const treeEdges: TreeEdge[] = useMemo(() => [...entryNodes.map((node) => ({ from: UNIVERSAL_ROOT.id, to: node.id, type: "part_of", virtual: true })), ...structuralEdges.map((edge) => ({ from: edge.from, to: edge.to, type: edge.type }))], [entryNodes, structuralEdges]);
  const children = useMemo(() => { const result = new Map<string, string[]>(); treeEdges.forEach((edge) => result.set(edge.from, [...(result.get(edge.from) ?? []), edge.to])); return result; }, [treeEdges]);
  const descendants = (id: string) => { const found = new Set<string>(); const pending = [id]; while (pending.length) { const next = pending.shift()!; if (found.has(next)) continue; found.add(next); pending.push(...(children.get(next) ?? [])); } return found; };
  const progressFor = (id: string): Progress => { const ids = descendants(id); const nodeCards = cards.filter((card) => ids.has(card.node_id)); const stable = nodeCards.filter((card) => snapshot.cardStates[card.id]?.fsrs.stability > 2).length; return { count: nodeCards.length, stable, percent: nodeCards.length ? Math.round((stable / nodeCards.length) * 100) : 0 }; };
  const [selectedNodeId, setSelectedNodeId] = useState(UNIVERSAL_ROOT.id);
  const selected = displayNodes.find((node) => node.id === selectedNodeId) ?? UNIVERSAL_ROOT;
  const selectedProgress = progressFor(selected.id);
  const mapProgress = progressFor(UNIVERSAL_ROOT.id);
  const labelFor = (id: string) => displayNodes.find((node) => node.id === id)?.title ?? id;
  const prerequisites = edges.filter((edge) => edge.to === selected.id && edge.type === "prerequisite").map((edge) => labelFor(edge.from));
  const layers = useMemo(() => { const grouped = new Map<number, ConceptNode[]>(); nodes.forEach((node) => grouped.set(depthById.get(node.id) ?? 0, [...(grouped.get(depthById.get(node.id) ?? 0) ?? []), node])); return [...grouped.entries()].sort(([a], [b]) => a - b); }, [nodes, depthById]);
  const widestLayer = Math.max(1, ...layers.map(([, layerNodes]) => layerNodes.length));
  const stageWidth = Math.max(900, widestLayer * 300);
  const xFor = (index: number, count: number) => stageWidth / 2 + (index - (count - 1) / 2) * 280;
  const flowNodes: KnowledgeFlowNode[] = useMemo(() => {
    const result: KnowledgeFlowNode[] = [{ id: UNIVERSAL_ROOT.id, type: "knowledge", position: { x: stageWidth / 2 - 130, y: 20 }, data: { displayNode: UNIVERSAL_ROOT, progress: progressFor(UNIVERSAL_ROOT.id) }, draggable: false, connectable: false, selectable: true, ariaLabel: `${UNIVERSAL_ROOT.title}. ${mapProgress.stable}/${mapProgress.count} card bền hơn` }];
    layers.forEach(([depth, layerNodes]) => layerNodes.forEach((node, index) => result.push({ id: node.id, type: "knowledge", position: { x: xFor(index, layerNodes.length) - 112, y: 225 + depth * 205 }, data: { displayNode: node, progress: progressFor(node.id) }, draggable: false, connectable: false, selectable: true, ariaLabel: `${node.title}. ${progressFor(node.id).stable}/${progressFor(node.id).count} card bền hơn` })));
    return result;
  }, [layers, mapProgress.count, mapProgress.stable, snapshot, stageWidth]);
  const flowEdges: KnowledgeFlowEdge[] = useMemo(() => treeEdges.map((edge, index) => ({ id: `${edge.from}-${edge.to}-${index}`, source: edge.from, target: edge.to, type: "knowledge", data: { relation: edge.type }, ariaLabel: `${labelFor(edge.from)} ${edge.type === "prerequisite" ? "học trước" : "thuộc về"} ${labelFor(edge.to)}` })), [treeEdges, displayNodes]);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [parentId, setParentId] = useState(nodes[0]?.id ?? "");
  const [relation, setRelation] = useState<"part_of" | "prerequisite">("part_of");
  const [graphMessage, setGraphMessage] = useState<string | null>(null);
  const addNode = () => { const result = addGraphNode({ title, purpose, kind: "branch", parentId, relation, maintainer: learnerId }, edges); if (!result.ok) setGraphMessage(result.error); else { setGraphMessage(`Đã thêm nhánh “${result.node.title}” ở trạng thái draft.`); setTitle(""); setPurpose(""); onGraphChanged(); } };

  return <section className="map-page"><div className="page-heading map-heading"><div><h1>Một gốc để nhớ lâu,<br /><em>nhiều cành để đi xa.</em></h1><p className="map-subtitle">Kéo để đi quanh cây, cuộn hoặc chụm hai ngón để phóng to. Nút vừa màn hình sẽ đưa toàn bộ kiến thức về trước mắt.</p></div><div className="map-summary" aria-label="Tóm tắt bản đồ"><div><strong>{displayNodes.length - 1}</strong><span>nhánh</span></div><div><strong>{mapProgress.count}</strong><span>card trong cây</span></div></div></div>
    <div className="map-controls"><span className="map-instruction"><i aria-hidden="true" /> Chạm, focus hoặc click một nút để xem nhánh.</span><span className="map-progress-caption">{mapProgress.stable}/{mapProgress.count} card đang bền</span></div>
    <div className="knowledge-flow surface" data-testid="knowledge-tree"><div className="knowledge-flow-canvas" data-testid="tree-map"><ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.18, maxZoom: 1 }} minZoom={0.25} maxZoom={1.8} nodesDraggable={false} nodesConnectable={false} elementsSelectable deleteKeyCode={null} panOnDrag zoomOnPinch zoomOnScroll zoomOnDoubleClick onNodeMouseEnter={(_event, node) => setSelectedNodeId(node.id)} onNodeClick={(_event, node) => setSelectedNodeId(node.id)} onSelectionChange={({ nodes: selectedNodes }) => { if (selectedNodes[0]) setSelectedNodeId(selectedNodes[0].id); }} ariaLabelConfig={{ "node.a11yDescription.default": "Nhấn Enter hoặc Space để chọn nhánh kiến thức." }}><Background color="#d9d0c3" gap={28} size={1} /><MiniMap pannable zoomable nodeColor={(node) => node.id === UNIVERSAL_ROOT.id ? "#ef6d4d" : "#94b8b7"} maskColor="rgba(247, 242, 233, .72)" /><Controls showInteractive={false} /></ReactFlow></div><div className="tree-legend" aria-label="Chú thích các đường nối"><span><i className="legend-line-solid" aria-hidden="true" /> thuộc về</span><span><i className="legend-line-dashed" aria-hidden="true" /> prerequisite</span></div></div>
    <section className="tree-detail surface" aria-live="polite" data-testid="tree-detail"><div className="tree-detail-heading"><div><span className="tree-detail-label">ĐANG XEM</span><span className="node-kind">{treeKindLabels[selected.kind]}</span></div><span className="tree-detail-percent">{selectedProgress.percent}% bền hơn</span></div><h2 data-testid="tree-detail-title">{selected.title}</h2><p>{selected.purpose}</p><div className="tree-detail-stats"><span>{selectedProgress.count} card trong nhánh</span><span>{selectedProgress.stable} card đang bền</span></div>{prerequisites.length > 0 && <p className="tree-prerequisites"><strong>Học sau:</strong> {prerequisites.join(", ")}</p>}</section>
    <details className="accessible-map surface"><summary>Danh sách map cho bàn phím và trình đọc màn hình</summary><div className="table-wrap"><table><caption>Concept map và prerequisite</caption><thead><tr><th>Node</th><th>Loại</th><th>Mục đích</th><th>Trạng thái</th></tr></thead><tbody>{displayNodes.map((node) => { const progress = progressFor(node.id); return <tr key={node.id}><th scope="row">{node.title}</th><td>{treeKindLabels[node.kind]}</td><td>{node.purpose}</td><td>{progress.stable}/{progress.count} card có stability &gt; 2</td></tr>; })}</tbody></table></div><div className="edge-list"><span className="section-label">CÁC NỐI PREREQUISITE</span>{edges.filter((edge) => edge.type === "prerequisite").map((edge) => <span key={`${edge.from}-${edge.to}`}>{labelFor(edge.from)} <b>→</b> {labelFor(edge.to)}</span>)}</div></details>
    <section className="graph-authoring surface"><div><span className="eyebrow">THÊM NHÁNH</span><h2>Cho kiến thức mới một chỗ để bám.</h2><p>Nhánh mới được lưu draft; relation prerequisite sẽ được kiểm tra vòng trước khi nối vào cây.</p></div><div className="graph-authoring-grid"><label>Tên nhánh<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Component boundaries" /></label><label>Bám vào<select value={parentId} onChange={(event) => setParentId(event.target.value)}>{nodes.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}</select></label><label>Quan hệ<select value={relation} onChange={(event) => setRelation(event.target.value as "part_of" | "prerequisite")}><option value="part_of">thuộc về</option><option value="prerequisite">học trước</option></select></label><label>Mục đích<textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Nó giúp hiểu nguyên lý nào?" rows={2} /></label></div><button className="button button-dark" onClick={addNode}>Thêm nhánh draft</button>{graphMessage && <p className="toast" role="status">{graphMessage}</p>}</section>
  </section>;
}
