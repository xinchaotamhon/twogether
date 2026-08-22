import { useMemo, useState } from "react";
import { hashCardState, localDataAdapter, type DataAdapter } from "./dataAdapter";
import type { SupabaseDataAdapter } from "./supabaseAdapter";
import { REPAIR_CAP, enqueueRepair, removeRepairItem, takeNextCardId, type RepairItem } from "./studyPolicy";
import { stateName } from "./scheduler";
import type {
  AttemptKind,
  Card,
  ConceptEdge,
  ConceptNode,
  LearnerId,
  LearnerSnapshot,
  ReviewRating,
} from "./types";
import { LEARNERS } from "./types";

type View = "study" | "map" | "progress";


function dueIds(cards: Card[], snapshot: LearnerSnapshot, now = new Date()): string[] {
  return cards
    .filter((card) => {
      const state = snapshot.cardStates[card.id];
      return state && (state.reviewCount === 0 || new Date(state.fsrs.due) <= now);
    })
    .sort((a, b) => {
      const aState = snapshot.cardStates[a.id];
      const bState = snapshot.cardStates[b.id];
      return new Date(aState.fsrs.due).getTime() - new Date(bState.fsrs.due).getTime();
    })
    .map((card) => card.id);
}

function App() {
  // Shared-device mode: choosing Hiệp or Hoàng is the complete entry flow.
  // No email, password, PIN, or Supabase Auth screen is required.
  return <LocalApp />;
}

function LocalApp() {
  const [learnerId, setLearnerId] = useState<LearnerId | null>(() => {
    const stored = window.localStorage.getItem("twogether.active-learner");
    return stored === "hiep" || stored === "hoang" ? stored : null;
  });

  const chooseLearner = (next: LearnerId) => {
    window.localStorage.setItem("twogether.active-learner", next);
    setLearnerId(next);
  };

  if (!learnerId) return <LoginView onChoose={chooseLearner} />;
  return <LearningApp learnerId={learnerId} onLogout={() => setLearnerId(null)} />;
}

function LoginView({ onChoose }: { onChoose: (learnerId: LearnerId) => void }) {
  return (
    <main className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <section className="login-panel" aria-labelledby="welcome-title">
        <div className="brand-lockup">
          <span className="brand-word">twogether<span>.</span></span>
          <span className="brand-note">learn for keeps</span>
        </div>
        <div className="eyebrow">PRIVATE LEARNING STUDIO · LOCAL PREVIEW</div>
        <h1 id="welcome-title">Học để nhớ lâu,<br /><em>cùng nhau.</em></h1>
        <p className="login-lede">Một câu hỏi mở. Một lần tự gọi ý. Một bước nhỏ đủ thật để ngày mai vẫn còn ở đó.</p>
        <div className="learner-picker" aria-label="Chọn tài khoản học">
          {LEARNERS.map((learner) => (
            <button data-testid={`learner-choice-${learner.id}`} className={`learner-choice ${learner.tone}`} key={learner.id} onClick={() => onChoose(learner.id)}>
              <span className="avatar avatar-large">{learner.initial}</span>
              <span className="learner-choice-copy"><strong>{learner.name}</strong><small>Không gian học riêng</small></span>
              <span className="arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <p className="preview-note"><span className="status-dot" /> Bản xem thử lưu trạng thái riêng trên trình duyệt này. Đây chưa phải đăng nhập production.</p>
      </section>
    </main>
  );
}

function LearningApp({ learnerId, onLogout, adapter = localDataAdapter }: { learnerId: LearnerId; onLogout: () => void; adapter?: DataAdapter & Partial<Pick<SupabaseDataAdapter, "recordReviewAsync">> }) {
  const cards = useMemo(() => adapter.listCards(), [adapter]);
  const nodes = useMemo(() => adapter.listNodes(), [adapter]);
  const edges = useMemo(() => adapter.listEdges(), [adapter]);
  const [snapshot, setSnapshot] = useState(() => adapter.readLearner(learnerId, learnerId));
  const initialQueue = useMemo(() => dueIds(cards, snapshot), [cards, snapshot]);
  const [view, setView] = useState<View>("study");
  const [remainingIds, setRemainingIds] = useState<string[]>(() => initialQueue.slice(1));
  const [currentCardId, setCurrentCardId] = useState<string | null>(() => initialQueue[0] ?? null);
  const [repairQueue, setRepairQueue] = useState<RepairItem[]>([]);
  const [completedReviews, setCompletedReviews] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attemptText, setAttemptText] = useState("");
  const [attemptKind, setAttemptKind] = useState<AttemptKind>("mental");
  const [hintVisible, setHintVisible] = useState(false);
  const [lastInterval, setLastInterval] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  const learner = LEARNERS.find((item) => item.id === learnerId)!;
  const currentCard = cards.find((card) => card.id === currentCardId) ?? null;
  const currentState = currentCard ? snapshot.cardStates[currentCard.id] : null;
  const currentCardNodeTitle = currentCard ? nodes.find((node) => node.id === currentCard.node_id)?.title ?? "Nội dung" : "Nội dung";
  const dueCount = dueIds(cards, snapshot).length;

  const restartSession = () => {
    const nextQueue = dueIds(cards, snapshot);
    setRemainingIds(nextQueue.slice(1));
    setCurrentCardId(nextQueue[0] ?? null);
    setRepairQueue([]);
    setCompletedReviews(0);
    setRevealed(false);
    setAttemptText("");
    setHintVisible(false);
    setMessage(null);
  };

  const advanceAfterReview = (nextRepairQueue: RepairItem[], nextCompleted: number) => {
    const nextId = takeNextCardId(remainingIds, nextRepairQueue, nextCompleted);
    const isRepair = nextRepairQueue.some((item) => item.cardId === nextId);
    if (nextId && !isRepair) setRemainingIds((ids) => ids.slice(1));
    setCurrentCardId(nextId);
    setRepairQueue(nextRepairQueue);
    setRevealed(false);
    setAttemptText("");
    setHintVisible(false);
  };

  const handleAttempt = () => {
    setAttemptKind(attemptText.trim() ? "typed" : "mental");
    setRevealed(true);
  };

  const handleGrade = async (rating: ReviewRating) => {
    if (!currentCard || !currentState || !revealed || savingReview) return;
    setSavingReview(true);
    try {
      const input = {
        sessionLearnerId: learnerId,
        requestedLearnerId: learnerId,
        cardId: currentCard.id,
        rating,
        attemptKind,
        occurredAt: new Date(),
        idempotencyKey: `${learnerId}-${currentCard.id}-${Date.now()}`,
        oldStateHash: hashCardState(currentState),
      };
      const result = adapter.recordReviewAsync ? await adapter.recordReviewAsync(input) : adapter.recordReview(input);
      setSnapshot(result.snapshot);
      setLastInterval(result.intervalLabel);
      setMessage(rating === "Good" ? `Đã ghi Nhớ · xem lại ${result.intervalLabel}` : "Đã ghi Quên · card sẽ quay lại sau vài card khác");
      const nextCompleted = completedReviews + 1;
      setCompletedReviews(nextCompleted);
      const existing = repairQueue.find((item) => item.cardId === currentCard.id);
      let nextRepairQueue: RepairItem[];
      if (rating === "Good") {
        nextRepairQueue = removeRepairItem(repairQueue, currentCard.id);
      } else if (existing && existing.appearances >= REPAIR_CAP) {
        nextRepairQueue = removeRepairItem(repairQueue, currentCard.id);
        setMessage("Card này đã thử đủ 3 lần trong phiên · tạm dừng để não nghỉ");
      } else {
        nextRepairQueue = enqueueRepair(repairQueue, currentCard.id, nextCompleted);
      }
      advanceAfterReview(nextRepairQueue, nextCompleted);
    } catch (error) {
      setMessage(error instanceof Error ? `Chưa ghi được: ${error.message}` : "Chưa ghi được lượt học; hãy thử lại");
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="app-shell">
      <AppHeader learner={learner} onLogout={onLogout} />
      <main className="main-content">
        <div className="topline">
          <div><span className="eyebrow">THỨ HAI · 18 THÁNG 8</span></div>
          <span className="offline-note">Thông báo đẩy đang tắt</span>
        </div>
        {view === "study" && (
          <StudyView
            dueCount={dueCount}
            currentCard={currentCard}
            cardNodeTitle={currentCardNodeTitle}
            repairQueue={repairQueue}
            completedReviews={completedReviews}
            revealed={revealed}
            attemptText={attemptText}
            setAttemptText={setAttemptText}
            hintVisible={hintVisible}
            setHintVisible={setHintVisible}
            handleAttempt={handleAttempt}
            handleGrade={handleGrade}
            restartSession={restartSession}
            message={message}
            lastInterval={lastInterval}
            savingReview={savingReview}
          />
        )}
        {view === "map" && <MapView nodes={nodes} edges={edges} cards={cards} snapshot={snapshot} />}
        {view === "progress" && <ProgressView cards={cards} snapshot={snapshot} learnerName={learner.name} />}
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

function AppHeader({ learner, onLogout }: { learner: (typeof LEARNERS)[number]; onLogout: () => void }) {
  return (
    <header className="app-header">
      <div className="brand-lockup compact"><span className="brand-word">twogether<span>.</span></span><span className="brand-note">learn for keeps</span></div>
      <div className="header-user">
        <button className={`avatar avatar-small ${learner.tone} learner-switch`} onClick={onLogout} aria-label="Mở bộ chọn hồ sơ" title="Mở bộ chọn hồ sơ">{learner.initial}</button>
      </div>
    </header>
  );
}

function StudyView({
  dueCount,
  currentCard,
  cardNodeTitle,
  repairQueue,
  completedReviews,
  revealed,
  attemptText,
  setAttemptText,
  hintVisible,
  setHintVisible,
  handleAttempt,
  handleGrade,
  restartSession,
  message,
  lastInterval,
  savingReview,
}: {
  dueCount: number;
  currentCard: Card | null;
  cardNodeTitle: string;
  repairQueue: RepairItem[];
  completedReviews: number;
  revealed: boolean;
  attemptText: string;
  setAttemptText: (value: string) => void;
  hintVisible: boolean;
  setHintVisible: (value: boolean) => void;
  handleAttempt: () => void;
  handleGrade: (rating: ReviewRating) => void;
  restartSession: () => void;
  message: string | null;
  lastInterval: string | null;
  savingReview: boolean;
}) {
  if (!currentCard) {
    return (
      <section className="empty-state surface" aria-live="polite">
        <div className="empty-symbol">✦</div>
        <span className="eyebrow">HÔM NAY ĐÃ ĐỦ</span>
        <h1>Một phiên học vừa đủ.</h1>
        <p>Không cần lấp đầy mọi khoảng trống. Não cần thời gian để làm việc ở phía sau.</p>
        <div className="empty-actions"><button className="button button-primary" onClick={restartSession}>Kiểm tra lại hàng đợi</button><span className="helper-text">{completedReviews} lượt đã ghi trong phiên này</span></div>
      </section>
    );
  }

  const progress = Math.min(100, Math.round((completedReviews / Math.max(1, dueCount)) * 100));
  return (
    <>
      <section className="study-intro">
        <div><h1>Chậm một nhịp,<br /><em>nhớ thêm một chút.</em></h1></div>
        <div data-testid="study-progress" className="study-progress" aria-label={`${progress}% phiên học`}><span>{String(Math.min(dueCount, completedReviews)).padStart(2, "0")}</span><i>/ {String(Math.max(dueCount, 1)).padStart(2, "0")}</i><small>đã gọi ý</small></div>
      </section>
      <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <section className="study-layout">
        <div className="study-side-note">
          <span className="side-note-number">01</span>
          <span className="side-note-copy">Gọi ý<br />trước phản hồi</span>
        </div>
        <article data-testid="study-card" className={`study-card surface ${revealed ? "is-revealed" : ""}`} aria-labelledby="card-prompt">
          <div className="card-meta"><span className="card-node">{cardNodeTitle}</span></div>
          <div className="card-question"><span className="question-mark" aria-hidden="true">?</span><h2 id="card-prompt">{currentCard.prompt}</h2></div>
          {!revealed ? (
            <div className="attempt-panel">
              <textarea value={attemptText} onChange={(event) => setAttemptText(event.target.value)} placeholder="Viết thứ gì đó vào đây" aria-label="Câu trả lời riêng, không được lưu" rows={3} />
              <div className="attempt-actions"><button className="hint-button" onClick={() => setHintVisible(!hintVisible)} aria-expanded={hintVisible}>{hintVisible ? "Ẩn gợi ý" : "Gợi ý nhỏ"}<span aria-hidden="true">⌁</span></button><button className="button button-dark" onClick={handleAttempt}>Đã thử — xem đáp án <span aria-hidden="true">↗</span></button></div>
              {hintVisible && <p className="hint-copy" role="note">Gợi ý: hãy trả lời bằng chức năng của ý tưởng, không chỉ bằng tên gọi.</p>}
            </div>
          ) : (
            <div data-testid="reveal-panel" className="reveal-panel" aria-live="polite">
              <div className="answer-block"><span className="section-label">LỜI GIẢI NGẮN</span><p className="model-answer">{currentCard.model_answer}</p></div>
              <div className="explanation-grid"><div><span className="section-label">VÌ SAO</span><p>{currentCard.explanation}</p></div><div className="misconception"><span className="section-label">DỄ NHẦM</span><p>{currentCard.misconception}</p></div></div>
              <div className="transfer-block"><span className="section-label">THỬ CHUYỂN SANG TÌNH HUỐNG MỚI</span><p>{currentCard.transfer_prompt}</p></div>
              <div className="grade-actions"><button className="button button-forgot" disabled={savingReview} onClick={() => handleGrade("Again")}><span className="grade-icon">↺</span><span><strong>Quên</strong><small>Cần gặp lại sau vài card</small></span></button><button className="button button-remember" disabled={savingReview} onClick={() => handleGrade("Good")}><span className="grade-icon">✦</span><span><strong>Nhớ</strong><small>{savingReview ? "Đang ghi…" : lastInterval ?? "Đưa vào lịch FSRS"}</small></span></button></div>
            </div>
          )}
          {repairQueue.length > 0 && <footer className="card-footer"><span className="repair-badge">↺ {repairQueue.length} đang củng cố</span></footer>}
        </article>
      </section>
      {message && <p className="toast" role="status">{message}</p>}
    </>
  );
}
type DisplayNodeKind = ConceptNode["kind"] | "universal";
type DisplayNode = Pick<ConceptNode, "id" | "title" | "purpose" | "status"> & {
  kind: DisplayNodeKind;
  virtual?: boolean;
};
type TreePosition = { x: number; y: number };
type TreeEdge = { from: string; to: string; type: string; virtual?: boolean };

const UNIVERSAL_ROOT: DisplayNode = {
  id: "twogether-universal-root",
  kind: "universal",
  title: "Bản chất chung",
  purpose: "Mọi nhánh bắt đầu từ nguyên lý, đi qua cơ chế, ranh giới rồi chuyển sang tình huống mới.",
  status: "framework",
  virtual: true,
};

const treeKindLabels: Record<DisplayNodeKind, string> = {
  universal: "Gốc chung",
  root: "Bộ kiến thức",
  trunk: "Thân",
  branch: "Cành",
  leaf: "Lá",
};

const TREE_VIEWBOX_WIDTH = 1000;
const TREE_NODE_HEIGHT = 146;
const TREE_ROW_GAP = 172;
const TREE_TOP = 28;

function MapView({ nodes, edges, cards, snapshot }: { nodes: ConceptNode[]; edges: ConceptEdge[]; cards: Card[]; snapshot: LearnerSnapshot }) {
  const displayNodes: DisplayNode[] = [UNIVERSAL_ROOT, ...nodes];
  const [selectedNodeId, setSelectedNodeId] = useState(UNIVERSAL_ROOT.id);
  const labelFor = (id: string) => displayNodes.find((node) => node.id === id)?.title ?? id;
  const layers: Array<{ kind: DisplayNodeKind; label: string; nodes: DisplayNode[] }> = [
    { kind: "universal", label: "Gốc chung", nodes: [UNIVERSAL_ROOT] },
    { kind: "root", label: "Bộ kiến thức", nodes: nodes.filter((node) => node.kind === "root") },
    { kind: "trunk", label: "Thân nguyên lý", nodes: nodes.filter((node) => node.kind === "trunk") },
    { kind: "branch", label: "Cành cơ chế", nodes: nodes.filter((node) => node.kind === "branch") },
    { kind: "leaf", label: "Lá chuyển giao", nodes: nodes.filter((node) => node.kind === "leaf") },
  ].filter((layer) => layer.nodes.length > 0) as Array<{ kind: DisplayNodeKind; label: string; nodes: DisplayNode[] }>;
  const treeEdges: TreeEdge[] = [
    ...nodes
      .filter((node) => node.kind === "root")
      .map((node) => ({ from: UNIVERSAL_ROOT.id, to: node.id, type: "part_of", virtual: true })),
    ...edges
      .filter((edge) => edge.type === "part_of" || edge.type === "prerequisite")
      .map((edge) => ({ from: edge.from, to: edge.to, type: edge.type })),
  ];
  const maxLayerNodes = Math.max(...layers.map((layer) => layer.nodes.length), 1);
  const stageWide = maxLayerNodes > 2;
  const nodePositions = new Map<string, TreePosition>();
  layers.forEach((layer, layerIndex) => {
    const count = layer.nodes.length;
    const spread = count === 1 ? 0 : Math.min(780, Math.max(300, (count - 1) * 230));
    const startX = (TREE_VIEWBOX_WIDTH - spread) / 2;
    layer.nodes.forEach((node, nodeIndex) => {
      const x = count === 1 ? TREE_VIEWBOX_WIDTH / 2 : startX + nodeIndex * (spread / (count - 1));
      nodePositions.set(node.id, { x, y: TREE_TOP + layerIndex * TREE_ROW_GAP });
    });
  });
  const stageHeight = TREE_TOP + Math.max(layers.length - 1, 0) * TREE_ROW_GAP + TREE_NODE_HEIGHT + 44;
  const childrenById = new Map<string, string[]>();
  treeEdges.forEach((edge) => {
    const children = childrenById.get(edge.from) ?? [];
    children.push(edge.to);
    childrenById.set(edge.from, children);
  });
  const descendantIds = (nodeId: string) => {
    const visited = new Set<string>();
    const pending = [nodeId];
    while (pending.length > 0) {
      const current = pending.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      pending.push(...(childrenById.get(current) ?? []));
    }
    return visited;
  };
  const progressForNode = (nodeId: string) => {
    const ids = descendantIds(nodeId);
    const nodeCards = cards.filter((card) => ids.has(card.node_id));
    const stable = nodeCards.filter((card) => snapshot.cardStates[card.id]?.fsrs.stability > 2).length;
    return { count: nodeCards.length, stable, percent: nodeCards.length ? Math.round((stable / nodeCards.length) * 100) : 0 };
  };
  const selectedNode = displayNodes.find((node) => node.id === selectedNodeId) ?? UNIVERSAL_ROOT;
  const selectedProgress = progressForNode(selectedNode.id);
  const selectedPrerequisites = edges
    .filter((edge) => edge.to === selectedNode.id && edge.type === "prerequisite")
    .map((edge) => labelFor(edge.from));
  const mapProgress = progressForNode(UNIVERSAL_ROOT.id);
  const selectNode = (nodeId: string) => setSelectedNodeId(nodeId);
  const edgePath = (edge: TreeEdge) => {
    const from = nodePositions.get(edge.from);
    const to = nodePositions.get(edge.to);
    if (!from || !to) return "";
    const startY = from.y + TREE_NODE_HEIGHT;
    const endY = to.y;
    const bend = Math.max(26, (endY - startY) * 0.45);
    return "M " + from.x + " " + startY + " C " + from.x + " " + (startY + bend) + ", " + to.x + " " + (endY - bend) + ", " + to.x + " " + endY;
  };

  return (
    <section className="map-page">
      <div className="page-heading map-heading">
        <div>
          <h1>Một gốc để nhớ lâu,<br /><em>nhiều cành để đi xa.</em></h1>
          <p className="map-subtitle">Mỗi nút mở ra một lớp hiểu khác nhau. Đi từ nguyên lý, qua cơ chế, rồi tự mình chuyển sang tình huống mới.</p>
        </div>
        <div className="map-summary" aria-label="Tóm tắt bản đồ">
          <div><strong>{displayNodes.length - 1}</strong><span>nhánh</span></div>
          <div><strong>{mapProgress.count}</strong><span>card trong cây</span></div>
        </div>
      </div>
      <div className="map-controls">
        <span className="map-instruction"><i aria-hidden="true" /> Chạm hoặc rê vào một nút để xem nhánh.</span>
        <span className="map-progress-caption">{mapProgress.stable}/{mapProgress.count} card đang bền</span>
      </div>
      <div className="knowledge-tree surface" data-testid="knowledge-tree">
        <div className="tree-viewport">
          <div
            className={"tree-stage" + (stageWide ? " is-wide" : "")}
            role="tree"
            aria-label="Cây kiến thức từ gốc chung đến các nhánh"
            data-testid="tree-map"
            style={{ height: stageHeight }}
          >
            <svg className="tree-links" viewBox={"0 0 " + TREE_VIEWBOX_WIDTH + " " + stageHeight} aria-hidden="true" preserveAspectRatio="none">
              <title>Đường nối giữa các lớp kiến thức</title>
              {treeEdges.filter((edge) => nodePositions.has(edge.from) && nodePositions.has(edge.to)).map((edge, index) => {
                const active = edge.from === selectedNode.id || edge.to === selectedNode.id;
                return <path key={edge.from + "-" + edge.to + "-" + index} data-testid="tree-link" className={"tree-link " + edge.type + (active ? " is-active" : "")} d={edgePath(edge)} />;
              })}
            </svg>
            {layers.map((layer, layerIndex) => layer.nodes.map((node) => {
              const position = nodePositions.get(node.id);
              if (!position) return null;
              const progress = progressForNode(node.id);
              const isSelected = selectedNode.id === node.id;
              const progressLabel = progress.count > 0 ? progress.stable + "/" + progress.count + " card bền hơn" : "Chưa có card trực tiếp";
              return (
                <button
                  type="button"
                  role="treeitem"
                  aria-level={layerIndex + 1}
                  aria-selected={isSelected}
                  aria-label={node.title + ". " + progressLabel}
                  data-testid={"tree-node-" + node.id}
                  className={"tree-node " + node.kind + (isSelected ? " is-selected" : "")}
                  style={{ left: (position.x / TREE_VIEWBOX_WIDTH) * 100 + "%", top: position.y }}
                  key={node.id}
                  onMouseEnter={() => selectNode(node.id)}
                  onFocus={() => selectNode(node.id)}
                  onClick={() => selectNode(node.id)}
                >
                  <span className="node-kind">{treeKindLabels[node.kind]}</span>
                  <strong className="tree-node-title">{node.title}</strong>
                  <span className="tree-node-meter" aria-hidden="true"><i style={{ width: progress.percent + "%" }} /></span>
                  <span className="tree-node-progress">{progressLabel}</span>
                </button>
              );
            }))}
          </div>
        </div>
        <div className="tree-legend" aria-label="Chú thích các đường nối">
          <span><i className="legend-line-solid" aria-hidden="true" /> thuộc về</span>
          <span><i className="legend-line-dashed" aria-hidden="true" /> prerequisite</span>
        </div>
      </div>
      <section className="tree-detail surface" aria-live="polite" data-testid="tree-detail">
        <div className="tree-detail-heading"><div><span className="tree-detail-label">ĐANG XEM</span><span className="node-kind">{treeKindLabels[selectedNode.kind]}</span></div><span className="tree-detail-percent">{selectedProgress.percent}% bền hơn</span></div>
        <h2 data-testid="tree-detail-title">{selectedNode.title}</h2>
        <p>{selectedNode.purpose}</p>
        <div className="tree-detail-stats"><span>{selectedProgress.count} card trong nhánh</span><span>{selectedProgress.stable} card đang bền</span></div>
        {selectedPrerequisites.length > 0 && <p className="tree-prerequisites"><strong>Học sau:</strong> {selectedPrerequisites.join(", ")}</p>}
      </section>
      <details className="accessible-map surface"><summary>Danh sách map cho bàn phím và trình đọc màn hình</summary><div className="table-wrap"><table><caption>Concept map và prerequisite</caption><thead><tr><th>Node</th><th>Loại</th><th>Mục đích</th><th>Trạng thái</th></tr></thead><tbody>{displayNodes.map((node) => { const p = progressForNode(node.id); return <tr key={node.id}><th scope="row">{node.title}</th><td>{treeKindLabels[node.kind]}</td><td>{node.purpose}</td><td>{p.stable}/{p.count} card có stability &gt; 2</td></tr>; })}</tbody></table></div><div className="edge-list"><span className="section-label">CÁC NỐI PREREQUISITE</span>{edges.filter((edge) => edge.type === "prerequisite").map((edge) => <span key={edge.from + "-" + edge.to}>{labelFor(edge.from)} <b>→</b> {labelFor(edge.to)}</span>)}</div></details>
    </section>
  );
}
function ProgressView({ cards, snapshot, learnerName }: { cards: Card[]; snapshot: LearnerSnapshot; learnerName: string }) {
  const reviewed = snapshot.reviewEvents.length;
  const remembered = snapshot.reviewEvents.filter((event) => event.rating === "Good").length;
  const stable = cards.filter((card) => snapshot.cardStates[card.id]?.fsrs.stability > 2).length;
  const today = snapshot.reviewEvents.filter((event) => event.occurredAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  return (
    <section className="progress-page"><div className="page-heading"><div><span className="eyebrow">PROGRESS · {learnerName.toUpperCase()}</span><h1>Nhìn thấy nhịp học,<br /><em>không chấm điểm con người.</em></h1></div></div><div className="stats-grid"><Stat value={String(today).padStart(2, "0")} label="lượt hôm nay" detail="mỗi lần gọi ý đều tính" tone="coral" /><Stat value={`${stable}/${cards.length}`} label="card đang bền" detail="dựa trên stability FSRS" tone="blue" /><Stat value={`${remembered}/${Math.max(reviewed, 1)}`} label="lần Nhớ" detail="tự đánh giá trung thực" tone="gold" /></div><div className="progress-columns"><section className="goal-card surface"><div className="goal-orbit" /><span className="eyebrow">MỤC TIÊU CHUNG · TUẦN NÀY</span><h2>Cùng nhau lớn lên,<br /><em>mỗi người 15 phút.</em></h2><p>Không thi đua số card. Hai người cùng góp những lần học đủ thật vào một bản đồ chung.</p><div className="goal-people"><div><span className="avatar avatar-small coral">H</span><span>Hiệp</span></div><div><span className="avatar avatar-small blue">H</span><span>Hoàng</span></div><span className="goal-line" /></div></section><section className="signal-card surface"><div className="signal-header"><span className="eyebrow">TÍN HIỆU NHẸ</span><span className="signal-date">7 ngày gần đây</span></div><div className="week-bars" aria-label="Lịch học 7 ngày">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => <div key={day}><span className={index === 0 && today > 0 ? "filled" : index < 2 && reviewed > 0 ? "partial" : ""} style={{ height: `${28 + ((index * 13 + reviewed * 7) % 45)}%` }} /><small>{day}</small></div>)}</div><p className="signal-caption">Streak là lời mời quay lại, không phải bài kiểm tra. Nghỉ một ngày không xoá lịch sử học.</p></section></div></section>
  );
}

function Stat({ value, label, detail, tone }: { value: string; label: string; detail: string; tone: string }) {
  return <div data-testid={`stat-${tone}`} className={`stat-card surface ${tone}`}><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>;
}

function BottomNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return <nav className="bottom-nav" aria-label="Điều hướng chính"><button data-testid="nav-study" className={view === "study" ? "active" : ""} onClick={() => setView("study")}><span aria-hidden="true">◌</span><small>Học</small></button><button data-testid="nav-map" className={view === "map" ? "active" : ""} onClick={() => setView("map")}><span aria-hidden="true">⌘</span><small>Bản đồ</small></button><button data-testid="nav-progress" className={view === "progress" ? "active" : ""} onClick={() => setView("progress")}><span aria-hidden="true">◒</span><small>Tiến độ</small></button></nav>;
}

export default App;
