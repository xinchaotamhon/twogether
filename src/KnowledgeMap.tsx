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
import type { CardCollection } from "./featureTypes";
import {
  projectKnowledgeLayout,
  UNIVERSAL_ROOT_ID,
} from "./knowledgeTreeLayout";
import type { Card, ConceptEdge, ConceptNode, LearnerSnapshot } from "./types";

type DisplayNode = Pick<ConceptNode, "id" | "title" | "purpose" | "status"> & {
  kind: ConceptNode["kind"] | "universal";
  virtual?: boolean;
};
interface Progress { count: number; stable: number; percent: number }
interface KnowledgeNodeData extends Record<string, unknown> {
  displayNode: DisplayNode;
  progress: Progress;
}
type KnowledgeFlowNode = FlowNode<KnowledgeNodeData, "knowledge">;
type KnowledgeFlowEdge = FlowEdge<{ relation: string }, "knowledge">;

const UNIVERSAL_ROOT: DisplayNode = {
  id: UNIVERSAL_ROOT_ID,
  kind: "universal",
  title: "Bản chất chung",
  purpose: "Mọi nhánh bắt đầu từ điều đã hiểu, đi qua cơ chế và ranh giới rồi mở sang tình huống mới.",
  status: "framework",
  virtual: true,
};

const DOMAIN_DEFINITIONS = [
  {
    id: "twogether-domain-english",
    title: "Tiếng Anh",
    purpose: "Từ cách tạo nghĩa và dựng câu đến giao tiếp, phát âm, từ vựng và những nhánh mở rộng sau này.",
    matches: (nodeId: string) => nodeId.startsWith("core-en-"),
  },
  {
    id: "twogether-domain-react",
    title: "React",
    purpose: "Từ mô hình giao diện theo trạng thái đến component, dữ liệu, hiệu năng và kiến trúc ứng dụng.",
    matches: (nodeId: string) => nodeId.startsWith("core-react-"),
  },
] as const;

function addDomainBranches(nodes: ConceptNode[], edges: ConceptEdge[]) {
  const projectedNodes = [...nodes];
  const projectedEdges = [...edges];
  for (const domain of DOMAIN_DEFINITIONS) {
    const members = nodes.filter((node) => domain.matches(node.id));
    if (!members.length) continue;
    const memberIds = new Set(members.map((node) => node.id));
    const hasParentInDomain = new Set(
      edges
        .filter((edge) => edge.type === "part_of" && memberIds.has(edge.from) && memberIds.has(edge.to))
        .map((edge) => edge.to),
    );
    projectedNodes.push({
      id: domain.id,
      kind: "root",
      title: domain.title,
      purpose: domain.purpose,
      status: "framework",
      source_refs: ["docs/KNOWLEDGE_GRAPH.md"],
      maintainer: "hiep",
    });
    members
      .filter((node) => !hasParentInDomain.has(node.id))
      .forEach((node) => projectedEdges.push({ from: domain.id, to: node.id, type: "part_of" }));
  }
  return { nodes: projectedNodes, edges: projectedEdges };
}
const treeKindLabels: Record<DisplayNode["kind"], string> = {
  universal: "Gốc chung",
  root: "Miền kiến thức",
  trunk: "Thân nguyên lý",
  branch: "Cành kiến thức",
  leaf: "Lá ứng dụng",
};

function KnowledgeNode({ data, selected }: NodeProps<KnowledgeFlowNode>) {
  const { displayNode: node, progress } = data;
  return <div data-testid={`tree-node-${node.id}`} className={`flow-knowledge-node ${node.kind}${selected ? " is-selected" : ""}`}>
    <Handle type="source" position={Position.Top} isConnectable={false} className="knowledge-handle" />
    <span className="node-kind">{treeKindLabels[node.kind]}</span>
    <strong>{node.title}</strong>
    <span className="tree-node-meter" aria-hidden="true"><i style={{ width: `${progress.percent}%` }} /></span>
    <span className="tree-node-progress">{progress.count ? `${progress.stable}/${progress.count} thẻ đã bền` : "Chưa có thẻ trong nhánh"}</span>
    <Handle type="target" position={Position.Bottom} isConnectable={false} className="knowledge-handle" />
  </div>;
}

function KnowledgeEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<KnowledgeFlowEdge>) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return <path id={id} data-testid="tree-link" className={`flow-knowledge-edge ${data?.relation ?? "part_of"}`} d={path} fill="none" />;
}
const nodeTypes = { knowledge: KnowledgeNode };
const edgeTypes = { knowledge: KnowledgeEdge };

export function KnowledgeMap({
  nodes,
  edges,
  cards,
  collections,
  snapshot,
  focusedCollectionIds,
  onToggleCollection,
  onStartCollection,
}: {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  cards: Card[];
  collections: CardCollection[];
  snapshot: LearnerSnapshot;
  focusedCollectionIds: string[];
  onToggleCollection: (collectionId: string) => void;
  onStartCollection: (collection: CardCollection) => void;
}) {
  const projection = useMemo(() => addDomainBranches(nodes, edges), [nodes, edges]);
  const displayNodes: DisplayNode[] = useMemo(() => [UNIVERSAL_ROOT, ...projection.nodes], [projection.nodes]);
  const layout = useMemo(() => projectKnowledgeLayout(projection.nodes, projection.edges), [projection]);
  const labelFor = (id: string) => displayNodes.find((node) => node.id === id)?.title ?? id;
  const visualChildren = useMemo(() => {
    const result = new Map<string, string[]>();
    layout.skeletonEdges.forEach((edge) => result.set(edge.from, [...(result.get(edge.from) ?? []), edge.to]));
    return result;
  }, [layout.skeletonEdges]);
  const descendants = (id: string) => {
    const found = new Set<string>();
    const pending = [id];
    while (pending.length) {
      const next = pending.shift()!;
      if (found.has(next)) continue;
      found.add(next);
      pending.push(...(visualChildren.get(next) ?? []));
    }
    return found;
  };
  const progressByNodeId = useMemo(() => {
    const result = new Map<string, Progress>();
    displayNodes.forEach((node) => {
      const ids = descendants(node.id);
      const cardIds = new Set(cards.filter((card) => ids.has(card.node_id)).map((card) => card.id));
      const stable = [...cardIds].filter((id) => (snapshot.cardStates[id]?.fsrs.stability ?? 0) > 2).length;
      result.set(node.id, { count: cardIds.size, stable, percent: cardIds.size ? Math.round((stable / cardIds.size) * 100) : 0 });
    });
    return result;
  }, [cards, displayNodes, snapshot, visualChildren]);
  const progressFor = (id: string) => progressByNodeId.get(id) ?? { count: 0, stable: 0, percent: 0 };
  const [selectedNodeId, setSelectedNodeId] = useState(UNIVERSAL_ROOT_ID);
  const selected = displayNodes.find((node) => node.id === selectedNodeId) ?? UNIVERSAL_ROOT;
  const selectedProgress = progressFor(selected.id);
  const mapProgress = progressFor(UNIVERSAL_ROOT_ID);
  const selectedBranchIds = descendants(selected.id);
  const cardById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const relatedCollections = collections.filter((collection) => {
    if (selected.id === UNIVERSAL_ROOT_ID) return true;
    if (collection.rootNodeId && selectedBranchIds.has(collection.rootNodeId)) return true;
    return collection.cardIds.some((cardId) => {
      const card = cardById.get(cardId);
      return card ? selectedBranchIds.has(card.node_id) : false;
    });
  });
  const prerequisites = edges.filter((edge) => edge.to === selected.id && edge.type === "prerequisite").map((edge) => labelFor(edge.from));

  const flowNodes: KnowledgeFlowNode[] = useMemo(() => displayNodes.map((node) => {
    const position = layout.positions.get(node.id)!;
    const progress = progressFor(node.id);
    return {
      id: node.id,
      type: "knowledge",
      position: { x: position.x - 112, y: position.y - 70 },
      data: { displayNode: node, progress },
      draggable: false,
      connectable: false,
      selectable: true,
      ariaLabel: `${node.title}. ${progress.stable}/${progress.count} thẻ đã bền`,
    };
  }), [displayNodes, layout.positions, progressByNodeId]);
  const projectedEdges = [...layout.skeletonEdges, ...layout.overlayEdges];
  const flowEdges: KnowledgeFlowEdge[] = useMemo(() => projectedEdges.map((edge, index) => ({
    id: `${edge.from}-${edge.to}-${edge.type}-${index}`,
    source: edge.from,
    target: edge.to,
    type: "knowledge",
    data: { relation: edge.type },
    ariaLabel: `${labelFor(edge.from)} ${edge.type === "prerequisite" ? "học trước" : "thuộc về"} ${labelFor(edge.to)}`,
  })), [projectedEdges, displayNodes]);

  return <section className="map-page map-home" data-testid="map-home">
    <div className="map-home-bar">
      <div><span className="eyebrow">CÂY HỌC CỦA HAI ANH EM</span><h1>Từ một gốc,<em> mọc ra điều mới.</em></h1></div>
      <div className="map-home-status" aria-label="Tóm tắt bản đồ"><strong>{focusedCollectionIds.length}</strong><span>bộ đang chọn</span><strong>{mapProgress.stable}</strong><span>thẻ đã bền</span></div>
    </div>
    <div className="map-home-stage">
      <div className="knowledge-flow" data-testid="knowledge-tree">
        <div className="knowledge-flow-canvas" data-testid="tree-map">
          <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.16, minZoom: 0.46, maxZoom: 1.05 }} minZoom={0.2} maxZoom={1.9} nodesDraggable={false} nodesConnectable={false} elementsSelectable deleteKeyCode={null} panOnDrag zoomOnPinch zoomOnScroll zoomOnDoubleClick onNodeMouseEnter={(_event, node) => setSelectedNodeId(node.id)} onNodeClick={(_event, node) => setSelectedNodeId(node.id)} onSelectionChange={({ nodes: selectedNodes }) => { if (selectedNodes[0]) setSelectedNodeId(selectedNodes[0].id); }} ariaLabelConfig={{ "node.a11yDescription.default": "Nhấn Enter hoặc Space để mở chi tiết nhánh kiến thức." }}>
            <Background color="#d9d0c3" gap={28} size={1} />
            <MiniMap pannable zoomable nodeColor={(node) => node.id === UNIVERSAL_ROOT_ID ? "#ef6d4d" : "#94b8b7"} maskColor="rgba(247, 242, 233, .72)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <div className="tree-legend" aria-label="Chú thích các đường nối"><span>Kéo để đi quanh · dùng +/− để phóng to</span><span><i className="legend-line-solid" aria-hidden="true" /> cùng một cành</span><span><i className="legend-line-dashed" aria-hidden="true" /> cần học trước</span></div>
      </div>
      <section className="tree-detail map-home-detail" aria-live="polite" data-testid="tree-detail">
        <div className="tree-detail-heading"><div><span className="tree-detail-label">ĐANG XEM</span><span className="node-kind">{treeKindLabels[selected.kind]}</span></div><span className="tree-detail-percent">{selectedProgress.percent}% bền</span></div>
        <h2 data-testid="tree-detail-title">{selected.title}</h2><p>{selected.purpose}</p>
        <div className="tree-detail-stats"><span>{selectedProgress.count} thẻ trong cành</span><span>{selectedProgress.stable} thẻ đã bền</span></div>
        {prerequisites.length > 0 && <p className="tree-prerequisites"><strong>Nên biết trước:</strong> {prerequisites.join(", ")}</p>}
        <div className="map-collection-focus">
          <div><span className="section-label">CHỌN BỘ MUỐN HỌC</span><p>Tích nhiều bộ để giữ trong danh sách; mỗi lượt vẫn học một bộ.</p></div>
          {relatedCollections.length ? relatedCollections.map((collection) => <div className="map-collection-row" key={collection.id}>
            <label><input type="checkbox" checked={focusedCollectionIds.includes(collection.id)} onChange={() => onToggleCollection(collection.id)} /><span><strong>{collection.title}</strong><small>{collection.cardIds.length} thẻ</small></span></label>
            <button type="button" className="text-button" onClick={() => onStartCollection(collection)}>Học bộ này</button>
          </div>) : <p className="map-empty-branch">Cành này chưa có bộ thẻ.</p>}
        </div>
      </section>
    </div>
    <details className="accessible-map surface"><summary>Danh sách kiến thức và các mối nối</summary><div className="table-wrap"><table><caption>Bản đồ tri thức và prerequisite</caption><thead><tr><th>Nút</th><th>Loại</th><th>Mục đích</th><th>Tiến độ</th></tr></thead><tbody>{displayNodes.map((node) => { const progress = progressFor(node.id); return <tr key={node.id}><th scope="row">{node.title}</th><td>{treeKindLabels[node.kind]}</td><td>{node.purpose}</td><td>{progress.stable}/{progress.count} thẻ đã bền</td></tr>; })}</tbody></table></div><div className="edge-list"><span className="section-label">CÁC NỐI CẦN HỌC TRƯỚC</span>{layout.overlayEdges.map((edge) => <span key={`${edge.from}-${edge.to}`}>{labelFor(edge.from)} <b>→</b> {labelFor(edge.to)}</span>)}</div></details>
  </section>;
}
