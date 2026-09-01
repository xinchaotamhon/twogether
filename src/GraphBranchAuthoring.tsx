import { useState } from "react";
import { addGraphNode } from "./graphWorkspace";
import type { ConceptEdge, ConceptNode, LearnerId } from "./types";

export function GraphBranchAuthoring({ nodes, edges, learnerId, onChanged }: { nodes: ConceptNode[]; edges: ConceptEdge[]; learnerId: LearnerId; onChanged: () => void }) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [parentId, setParentId] = useState(nodes[0]?.id ?? "");
  const [relation, setRelation] = useState<"part_of" | "prerequisite">("part_of");
  const [message, setMessage] = useState<string | null>(null);
  const submit = () => {
    const result = addGraphNode({ title, purpose, kind: "branch", parentId, relation, maintainer: learnerId }, edges);
    if (!result.ok) setMessage(result.error);
    else {
      setMessage(`Đã thêm nhánh “${result.node.title}” ở trạng thái draft.`);
      setTitle("");
      setPurpose("");
      onChanged();
    }
  };
  return <details className="graph-authoring surface">
    <summary><span className="eyebrow">QUẢN LÝ CÂY TRI THỨC</span> · Thêm một nhánh mới</summary>
    <div><h2>Cho kiến thức mới một chỗ để bám.</h2><p>Nhánh mới được lưu draft; quan hệ cần học trước được kiểm tra vòng.</p></div>
    <div className="graph-authoring-grid">
      <label>Tên nhánh<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Component boundaries" /></label>
      <label>Bám vào<select value={parentId} onChange={(event) => setParentId(event.target.value)}>{nodes.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}</select></label>
      <label>Quan hệ<select value={relation} onChange={(event) => setRelation(event.target.value as "part_of" | "prerequisite")}><option value="part_of">thuộc về</option><option value="prerequisite">học trước</option></select></label>
      <label>Mục đích<textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Nó giúp hiểu nguyên lý nào?" rows={2} /></label>
    </div>
    <button className="button button-dark" onClick={submit}>Thêm nhánh draft</button>
    {message && <p className="toast" role="status">{message}</p>}
  </details>;
}

