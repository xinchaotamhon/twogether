import { useMemo } from "react";
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
import { projectKnowledgeLayout, UNIVERSAL_ROOT_ID } from "./knowledgeTreeLayout";
import type { Card, ConceptEdge, ConceptNode, LearnerSnapshot } from "./types";

type DisplayNode = Pick<ConceptNode, "id" | "title" | "purpose" | "status"> & {
  kind: ConceptNode["kind"] | "universal";
  virtual?: boolean;
};
interface Progress { count: number; stable: number; percent: number }
interface KnowledgeNodeData extends Record<string, unknown> {
  displayNode: DisplayNode;
  progress: Progress;
  collection?: CardCollection;
  onStartCollection: (collection: CardCollection) => void;
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

function addCollectionBranches(nodes: ConceptNode[], edges: ConceptEdge[], collections: CardCollection[]) {
  const projectedNodes = [...nodes];
  const projectedEdges = [...edges];
  const existingNodeIds = new Set(nodes.map((node) => node.id));
  const collectionByNodeId = new Map<string, CardCollection>();

  collections.forEach((collection) => {
    const rootId = collection.rootNodeId;
    if (rootId && existingNodeIds.has(rootId) && !collectionByNodeId.has(rootId)) {
      collectionByNodeId.set(rootId, collection);
      return;
    }
    const collectionNodeId = `twogether-collection-${collection.id}`;
    projectedNodes.push({
      id: collectionNodeId,
      kind: "leaf",
      title: collection.title,
      purpose: collection.description,
      status: collection.status,
      source_refs: ["collection-workspace:p0"],
      maintainer: "hiep",
    });
    collectionByNodeId.set(collectionNodeId, collection);
    if (rootId && existingNodeIds.has(rootId)) {
      projectedEdges.push({ from: rootId, to: collectionNodeId, type: "part_of" });
    }
  });

  return { nodes: projectedNodes, edges: projectedEdges, collectionByNodeId };
}

const treeKindLabels: Record<DisplayNode["kind"], string> = {
  universal: "Gốc chung",
  root: "Miền kiến thức",
  trunk: "Thân nguyên lý",
  branch: "Cành kiến thức",
  leaf: "Lá ứng dụng",
};

function KnowledgeNode({ data }: NodeProps<KnowledgeFlowNode>) {
  const { displayNode: node, progress, collection, onStartCollection } = data;
  const content = <>
    <span className="node-kind">{treeKindLabels[node.kind]}</span>
    <strong>{node.title}</strong>
    <span className="tree-node-meter" aria-hidden="true"><i style={{ width: `${progress.percent}%` }} /></span>
    <span className="tree-node-progress">
      {collection ? `Bấm để học · ${collection.cardIds.length} thẻ` : progress.count ? `${progress.stable}/${progress.count} thẻ đã bền` : "Nơi kiến thức mới có thể bám vào"}
    </span>
  </>;

  return <div data-testid={`tree-node-${node.id}`} className={`flow-knowledge-node ${node.kind}${collection ? " is-studyable" : ""}`}>
    <Handle type="source" position={Position.Top} isConnectable={false} className="knowledge-handle" />
    {collection
      ? <button type="button" className="flow-knowledge-node-action nodrag nopan" onClick={() => onStartCollection(collection)} aria-label={`Học bộ ${collection.title}, ${collection.cardIds.length} thẻ`}>{content}</button>
      : <div className="flow-knowledge-node-static">{content}</div>}
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
  onStartCollection,
}: {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  cards: Card[];
  collections: CardCollection[];
  snapshot: LearnerSnapshot;
  onStartCollection: (collection: CardCollection) => void;
}) {
  const domainProjection = useMemo(() => addDomainBranches(nodes, edges), [nodes, edges]);
  const projection = useMemo(() => addCollectionBranches(domainProjection.nodes, domainProjection.edges, collections), [collections, domainProjection]);
  const displayNodes: DisplayNode[] = useMemo(() => [UNIVERSAL_ROOT, ...projection.nodes], [projection.nodes]);
  const layout = useMemo(() => projectKnowledgeLayout(projection.nodes, projection.edges), [projection]);
  const collectionByRootNode = projection.collectionByNodeId;
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
      const collection = collectionByRootNode.get(node.id);
      const ids = descendants(node.id);
      const cardIds = collection
        ? new Set(collection.cardIds)
        : new Set(cards.filter((card) => ids.has(card.node_id)).map((card) => card.id));
      const stable = [...cardIds].filter((id) => (snapshot.cardStates[id]?.fsrs.stability ?? 0) > 2).length;
      result.set(node.id, { count: cardIds.size, stable, percent: cardIds.size ? Math.round((stable / cardIds.size) * 100) : 0 });
    });
    return result;
  }, [cards, collectionByRootNode, displayNodes, snapshot, visualChildren]);
  const progressFor = (id: string) => progressByNodeId.get(id) ?? { count: 0, stable: 0, percent: 0 };
  const mapProgress = progressFor(UNIVERSAL_ROOT_ID);

  const flowNodes: KnowledgeFlowNode[] = useMemo(() => displayNodes.map((node) => {
    const position = layout.positions.get(node.id)!;
    const progress = progressFor(node.id);
    const collection = collectionByRootNode.get(node.id);
    return {
      id: node.id,
      type: "knowledge",
      position: { x: position.x - 112, y: position.y - 70 },
      data: { displayNode: node, progress, collection, onStartCollection },
      draggable: false,
      connectable: false,
      selectable: false,
      ariaLabel: collection ? `${node.title}. Bấm để học ${collection.cardIds.length} thẻ.` : `${node.title}. ${progress.stable}/${progress.count} thẻ đã bền.`,
    };
  }), [collectionByRootNode, displayNodes, layout.positions, onStartCollection, progressByNodeId]);
  const projectedEdges = [...layout.skeletonEdges, ...layout.overlayEdges];
  const flowEdges: KnowledgeFlowEdge[] = useMemo(() => projectedEdges.map((edge, index) => ({
    id: `${edge.from}-${edge.to}-${edge.type}-${index}`,
    source: edge.from,
    target: edge.to,
    type: "knowledge",
    data: { relation: edge.type },
    ariaLabel: `${labelFor(edge.from)} ${edge.type === "prerequisite" ? "học trước" : "thuộc về"} ${labelFor(edge.to)}`,
  })), [displayNodes, projectedEdges]);

  return <section className="map-page map-home" data-testid="map-home">
    <div className="map-home-stage">
      <div className="knowledge-flow" data-testid="knowledge-tree">
        <div className="knowledge-flow-canvas" data-testid="tree-map">
          <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.12, minZoom: 0.46, maxZoom: 1.08 }} minZoom={0.2} maxZoom={2.2} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKeyCode={null} panOnDrag zoomOnPinch zoomOnScroll zoomOnDoubleClick ariaLabelConfig={{ "node.a11yDescription.default": "Nhánh có dòng Bấm để học sẽ mở ngay bộ thẻ tương ứng." }}>
            <Background color="#d9d0c3" gap={28} size={1} />
            <MiniMap pannable zoomable nodeColor={(node) => node.id === UNIVERSAL_ROOT_ID ? "#ef6d4d" : "#94b8b7"} maskColor="rgba(247, 242, 233, .72)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <div className="map-canvas-summary" aria-label={`Toàn cây có ${mapProgress.stable} trên ${mapProgress.count} thẻ đã bền`}><strong>{mapProgress.stable}/{mapProgress.count}</strong><span>thẻ đã bền</span></div>
        <div className="tree-legend" aria-label="Hướng dẫn bản đồ"><span>Bấm một nhánh có thẻ để học · kéo để đi quanh · dùng +/− để phóng to</span><span><i className="legend-line-solid" aria-hidden="true" /> cùng một cành</span><span><i className="legend-line-dashed" aria-hidden="true" /> cần học trước</span></div>
      </div>
    </div>
    <table className="map-accessible-table sr-only"><caption>Bản đồ tri thức và các bộ thẻ có thể học</caption><thead><tr><th>Nút</th><th>Loại</th><th>Tiến độ</th><th>Học</th></tr></thead><tbody>{displayNodes.map((node) => { const progress = progressFor(node.id); const collection = collectionByRootNode.get(node.id); return <tr key={node.id}><th scope="row">{node.title}</th><td>{treeKindLabels[node.kind]}</td><td>{progress.stable}/{progress.count} thẻ đã bền</td><td>{collection ? <button type="button" onClick={() => onStartCollection(collection)}>Học {collection.title}</button> : "Chưa có bộ thẻ"}</td></tr>; })}</tbody></table>
  </section>;
}
