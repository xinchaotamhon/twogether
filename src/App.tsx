import { useMemo, useState } from "react";
import { createLocalDataAdapter, hashCardState, localDataAdapter } from "./dataAdapter";
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

const cardTypeLabels: Record<Card["card_type"], string> = {
  core_recall: "Gọi ý",
  mechanism: "Cơ chế",
  contrast: "Phân biệt",
  boundary: "Ranh giới",
  application: "Ứng dụng",
  production: "Tự tạo",
};

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
            <button className={`learner-choice ${learner.tone}`} key={learner.id} onClick={() => onChoose(learner.id)}>
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

function LearningApp({ learnerId, onLogout }: { learnerId: LearnerId; onLogout: () => void }) {
  const adapter = localDataAdapter;
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

  const learner = LEARNERS.find((item) => item.id === learnerId)!;
  const currentCard = cards.find((card) => card.id === currentCardId) ?? null;
  const currentState = currentCard ? snapshot.cardStates[currentCard.id] : null;
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

  const handleGrade = (rating: ReviewRating) => {
    if (!currentCard || !currentState || !revealed) return;
    const result = adapter.recordReview({
      sessionLearnerId: learnerId,
      requestedLearnerId: learnerId,
      cardId: currentCard.id,
      rating,
      attemptKind,
      occurredAt: new Date(),
      idempotencyKey: `${learnerId}-${currentCard.id}-${Date.now()}`,
      oldStateHash: hashCardState(currentState),
    });
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
  };

  const shellProps = { learner, learnerId, onLogout, view, setView };
  return (
    <div className="app-shell">
      <AppHeader {...shellProps} />
      <main className="main-content">
        <div className="topline">
          <div><span className="eyebrow">THỨ HAI · 18 THÁNG 8</span><span className="sync-pill"><span className="status-dot" /> local · riêng tư</span></div>
          <span className="offline-note">Thông báo đẩy đang tắt</span>
        </div>
        {view === "study" && (
          <StudyView
            learnerName={learner.name}
            dueCount={dueCount}
            currentCard={currentCard}
            currentState={currentState}
            remainingCount={remainingIds.length + repairQueue.length}
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
          />
        )}
        {view === "map" && <MapView nodes={nodes} edges={edges} cards={cards} snapshot={snapshot} />}
        {view === "progress" && <ProgressView cards={cards} snapshot={snapshot} learnerName={learner.name} />}
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

function AppHeader({ learner, onLogout }: { learner: (typeof LEARNERS)[number]; learnerId: LearnerId; onLogout: () => void; view: View; setView: (view: View) => void }) {
  return (
    <header className="app-header">
      <div className="brand-lockup compact"><span className="brand-word">twogether<span>.</span></span><span className="brand-note">learn for keeps</span></div>
      <div className="header-user">
        <span className={`avatar avatar-small ${learner.tone}`}>{learner.initial}</span>
        <span className="header-user-name">{learner.name}</span>
        <button className="text-button" onClick={onLogout}>Đổi người</button>
      </div>
    </header>
  );
}

function StudyView({
  learnerName,
  dueCount,
  currentCard,
  currentState,
  remainingCount,
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
}: {
  learnerName: string;
  dueCount: number;
  currentCard: Card | null;
  currentState: LearnerSnapshot["cardStates"][string] | null;
  remainingCount: number;
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
        <div><span className="eyebrow">PHIÊN CỦA {learnerName.toUpperCase()}</span><h1>Chậm một nhịp,<br /><em>nhớ thêm một chút.</em></h1></div>
        <div className="study-progress" aria-label={`${progress}% phiên học`}><span>{String(Math.min(dueCount, completedReviews)).padStart(2, "0")}</span><i>/ {String(Math.max(dueCount, 1)).padStart(2, "0")}</i><small>đã gọi ý</small></div>
      </section>
      <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <section className="study-layout">
        <div className="study-side-note">
          <span className="side-note-number">01</span>
          <span className="side-note-copy">Gọi ý<br />trước phản hồi</span>
        </div>
        <article className={`study-card surface ${revealed ? "is-revealed" : ""}`} aria-labelledby="card-prompt">
          <div className="card-meta"><span className="card-type">{cardTypeLabels[currentCard.card_type]}</span><span className="card-node">English foundations <span aria-hidden="true">·</span> fixture nội bộ</span></div>
          <div className="card-question"><span className="question-mark" aria-hidden="true">?</span><h2 id="card-prompt">{currentCard.prompt}</h2></div>
          {!revealed ? (
            <div className="attempt-panel">
              <p>Hãy nhớ thầm, nói ra, hoặc viết riêng câu trả lời. App chỉ lưu việc bạn đã thử.</p>
              <textarea value={attemptText} onChange={(event) => setAttemptText(event.target.value)} placeholder="Viết riêng nếu điều đó giúp bạn gọi ý…" aria-label="Câu trả lời riêng, không được lưu" rows={3} />
              <div className="attempt-actions"><button className="hint-button" onClick={() => setHintVisible(!hintVisible)} aria-expanded={hintVisible}>{hintVisible ? "Ẩn gợi ý" : "Gợi ý nhỏ"}<span aria-hidden="true">⌁</span></button><button className="button button-dark" onClick={handleAttempt}>Đã thử — xem đáp án <span aria-hidden="true">↗</span></button></div>
              {hintVisible && <p className="hint-copy" role="note">Gợi ý: hãy trả lời bằng chức năng của ý tưởng, không chỉ bằng tên gọi.</p>}
            </div>
          ) : (
            <div className="reveal-panel" aria-live="polite">
              <div className="answer-block"><span className="section-label">LỜI GIẢI NGẮN</span><p className="model-answer">{currentCard.model_answer}</p></div>
              <div className="explanation-grid"><div><span className="section-label">VÌ SAO</span><p>{currentCard.explanation}</p></div><div className="misconception"><span className="section-label">DỄ NHẦM</span><p>{currentCard.misconception}</p></div></div>
              <div className="transfer-block"><span className="section-label">THỬ CHUYỂN SANG TÌNH HUỐNG MỚI</span><p>{currentCard.transfer_prompt}</p></div>
              <div className="grade-actions"><button className="button button-forgot" onClick={() => handleGrade("Again")}><span className="grade-icon">↺</span><span><strong>Quên</strong><small>Cần gặp lại sau vài card</small></span></button><button className="button button-remember" onClick={() => handleGrade("Good")}><span className="grade-icon">✦</span><span><strong>Nhớ</strong><small>{lastInterval ?? "Đưa vào lịch FSRS"}</small></span></button></div>
            </div>
          )}
          <footer className="card-footer"><span>{currentState ? stateName(currentState.fsrs.state) : "new"} · {remainingCount} card còn trong phiên</span>{repairQueue.length > 0 && <span className="repair-badge">↺ {repairQueue.length} đang củng cố</span>}</footer>
        </article>
      </section>
      {message && <p className="toast" role="status">{message}</p>}
    </>
  );
}

function MapView({ nodes, edges, cards, snapshot }: { nodes: ConceptNode[]; edges: ConceptEdge[]; cards: Card[]; snapshot: LearnerSnapshot }) {
  const progressForNode = (nodeId: string) => {
    const nodeCards = cards.filter((card) => card.node_id === nodeId);
    const stable = nodeCards.filter((card) => snapshot.cardStates[card.id]?.fsrs.stability > 2).length;
    return { count: nodeCards.length, stable, percent: nodeCards.length ? Math.round((stable / nodeCards.length) * 100) : 0 };
  };
  const labelFor = (id: string) => nodes.find((node) => node.id === id)?.title ?? id;
  return (
    <section className="map-page">
      <div className="page-heading"><div><span className="eyebrow">KNOWLEDGE MAP · DAG</span><h1>Một bản đồ để<br /><em>biết mình đang ở đâu.</em></h1></div><span className="map-legend"><i className="legend-dot" /> shared content<br /><i className="legend-ring" /> private progress</span></div>
      <p className="page-lede">Đây là một lối đi gợi ý, không phải chiếc cây hoàn hảo của tiếng Anh. Một nền tảng có thể nâng đỡ nhiều nhánh.</p>
      <div className="map-canvas surface">
        <div className="map-line line-a" /><div className="map-line line-b" /><div className="map-line line-c" />
        {nodes.map((node, index) => {
          const progress = progressForNode(node.id);
          return <div className={`map-node map-node-${index} ${node.kind}`} key={node.id}><span className="node-kind">{node.kind}</span><div className="node-title">{node.title}</div><p>{node.purpose}</p><div className="node-progress"><span style={{ width: `${progress.percent}%` }} /><small>{progress.stable}/{progress.count} bền hơn</small></div></div>;
        })}
      </div>
      <details className="accessible-map surface"><summary>Danh sách map cho bàn phím và trình đọc màn hình</summary><div className="table-wrap"><table><caption>Concept map và prerequisite</caption><thead><tr><th>Node</th><th>Loại</th><th>Mục đích</th><th>Trạng thái</th></tr></thead><tbody>{nodes.map((node) => { const p = progressForNode(node.id); return <tr key={node.id}><th scope="row">{node.title}</th><td>{node.kind}</td><td>{node.purpose}</td><td>{p.stable}/{p.count} card có stability &gt; 2</td></tr>; })}</tbody></table></div><div className="edge-list"><span className="section-label">CÁC NỐI PREREQUISITE</span>{edges.filter((edge) => edge.type === "prerequisite").map((edge) => <span key={`${edge.from}-${edge.to}`}>{labelFor(edge.from)} <b>→</b> {labelFor(edge.to)}</span>)}</div></details>
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
  return <div className={`stat-card surface ${tone}`}><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>;
}

function BottomNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return <nav className="bottom-nav" aria-label="Điều hướng chính"><button className={view === "study" ? "active" : ""} onClick={() => setView("study")}><span aria-hidden="true">◌</span><small>Học</small></button><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><span aria-hidden="true">⌘</span><small>Bản đồ</small></button><button className={view === "progress" ? "active" : ""} onClick={() => setView("progress")}><span aria-hidden="true">◒</span><small>Tiến độ</small></button></nav>;
}

export default App;
