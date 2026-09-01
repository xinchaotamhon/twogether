import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  hashCardState,
  localDataAdapter,
  type DataAdapter,
} from "./dataAdapter";
import {
  REPAIR_CAP,
  enqueueRepair,
  removeRepairItem,
  takeNextCardId,
  type RepairItem,
} from "./studyPolicy";
import { createInitialFsrsCard, stateName } from "./scheduler";
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
import type {
  CardCollection,
  CollectionRunPlan,
  RunAttempt,
} from "./featureTypes";
import {
  COLLECTION_FIXTURES,
  createRunPlan,
  dueCardIdsForCollection,
} from "./collections";
import {
  addRunAttempt,
  archiveCard,
  getWorkspaceCards,
  listCollections,
  loadRun,
  publishCardDraft,
  qualifyAndPersistRun,
  readDailyQualifications,
  saveCardDraft,
  saveRun,
} from "./localWorkspace";
import { createCollection } from "./collectionWorkspace";
import { deriveStreak, type StreakProjection } from "./streak";
import { addGraphNode, readGraph } from "./graphWorkspace";
import { exportCardPacket, importPacketAsDraft } from "./contentPacket";
import {
  ENGLISH_CORE_DRAFT_CARD_IDS,
  ENGLISH_CORE_DRAFT_COLLECTIONS,
  draftCardsForCollection,
} from "./curriculumDrafts";
import { supportForCard } from "./cardSupport";
import { StudyView } from "./StudyView";
import { createSupabaseBrowserClient } from "./supabaseClient";
import {
  createSupabaseDataAdapter,
  importLocalLearningState,
  type SupabaseDataAdapter,
} from "./supabaseAdapter";
import "./curriculumDrafts.css";

type View = "study" | "map" | "progress" | "cards";
const TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
const KnowledgeMap = lazy(() =>
  import("./KnowledgeMap").then((module) => ({ default: module.KnowledgeMap })),
);
const CardLibraryView = lazy(() =>
  import("./CardLibraryView").then((module) => ({
    default: module.CardLibraryView,
  })),
);

function dueIds(
  cards: Card[],
  snapshot: LearnerSnapshot,
  collection: CardCollection,
  now = new Date(),
): string[] {
  return dueCardIdsForCollection(
    cards.filter((card) => card.status === "published"),
    collection,
    snapshot,
    now,
  );
}

function App() {
  const client = useMemo(() => createSupabaseBrowserClient(), []);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const syncMode = String(
    import.meta.env.VITE_SYNC_MODE ?? "cloud",
  ).toLowerCase();
  if (!client || syncMode === "local" || useLocalFallback) return <LocalApp />;
  return (
    <PairedSupabaseApp
      client={client}
      onUseLocal={() => setUseLocalFallback(true)}
    />
  );
}

function PairedSupabaseApp({
  client,
  onUseLocal,
}: {
  client: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>;
  onUseLocal: () => void;
}) {
  const [status, setStatus] = useState<
    "loading" | "pairing" | "ready" | "device" | "setup-error"
  >("loading");
  const [learnerId, setLearnerId] = useState<LearnerId | null>(null);
  const [adapter, setAdapter] = useState<SupabaseDataAdapter | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const hydrate = async () => {
    setStatus("loading");
    setMessage(null);
    let { data: sessionData, error: sessionError } =
      await client.auth.getSession();
    if (sessionError) {
      setMessage("Không đọc được phiên đồng bộ trên thiết bị này.");
      setStatus("setup-error");
      return;
    }
    if (!sessionData.session) {
      const anonymous = await client.auth.signInAnonymously();
      if (anonymous.error || !anonymous.data.session) {
        setMessage(
          "Supabase chưa bật Anonymous Sign-Ins. Hãy hoàn tất bước cài đặt một lần.",
        );
        setStatus("setup-error");
        return;
      }
      sessionData = { session: anonymous.data.session };
    }

    const learnerResult = await client.rpc("current_learner_id");
    if (learnerResult.error) {
      setMessage(
        "Cơ sở dữ liệu chưa có bản nâng cấp ghép thiết bị và đồng bộ.",
      );
      setStatus("setup-error");
      return;
    }
    const remoteLearner = learnerResult.data;
    if (remoteLearner !== "hiep" && remoteLearner !== "hoang") {
      setStatus("pairing");
      return;
    }

    try {
      await importLocalLearningState(client, remoteLearner);
      const nextAdapter = createSupabaseDataAdapter(client, remoteLearner);
      await nextAdapter.initialize();
      setLearnerId(remoteLearner);
      setAdapter(nextAdapter);
      setStatus("ready");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không tải được dữ liệu học đã đồng bộ.",
      );
      setStatus("setup-error");
    }
  };

  useEffect(() => {
    void hydrate();
  }, []);

  const claim = async (code: string) => {
    setMessage(null);
    const { error } = await client.rpc("claim_device_pairing", {
      p_code: code,
      p_label: navigator.userAgent.slice(0, 80),
    });
    if (error) {
      setMessage("Mã ghép không đúng, đã hết hạn hoặc đã được dùng.");
      return;
    }
    await hydrate();
  };

  if (status === "loading")
    return (
      <CloudStatus
        title="Đang lấy tiến độ mới nhất…"
        body="FSRS và streak đang được đọc từ không gian học riêng của bạn."
      />
    );
  if (status === "pairing")
    return (
      <PairingView onClaim={claim} message={message} onUseLocal={onUseLocal} />
    );
  if (status === "setup-error")
    return (
      <CloudSetupView
        message={message}
        onRetry={hydrate}
        onUseLocal={onUseLocal}
      />
    );
  if (status === "device" && learnerId)
    return (
      <DevicePairingView
        client={client}
        learnerId={learnerId}
        onBack={() => setStatus("ready")}
      />
    );
  if (status === "ready" && learnerId && adapter)
    return (
      <LearningApp
        learnerId={learnerId}
        adapter={adapter}
        onLogout={() => setStatus("device")}
      />
    );
  return (
    <CloudSetupView
      message="Phiên đồng bộ chưa sẵn sàng."
      onRetry={hydrate}
      onUseLocal={onUseLocal}
    />
  );
}

function CloudStatus({ title, body }: { title: string; body: string }) {
  return (
    <main className="login-shell">
      <section className="login-panel" role="status">
        <div className="brand-word">
          twogether<span>.</span>
        </div>
        <div className="eyebrow">ĐỒNG BỘ AN TOÀN</div>
        <h1>{title}</h1>
        <p className="login-lede">{body}</p>
      </section>
    </main>
  );
}

function PairingView({
  onClaim,
  message,
  onUseLocal,
}: {
  onClaim: (code: string) => Promise<void>;
  message: string | null;
  onUseLocal: () => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-word">
          twogether<span>.</span>
        </div>
        <div className="eyebrow">CHỈ MỘT LẦN TRÊN THIẾT BỊ NÀY</div>
        <h1>Ghép tiến độ học.</h1>
        <p className="login-lede">
          Nhập mã của Hiệp hoặc Hoàng. Sau lần này, mở web là nhận đúng FSRS và
          streak; không cần email hay PIN mỗi ngày.
        </p>
        <label className="pairing-code-label">
          Mã ghép thiết bị
          <input
            autoFocus
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Ví dụ: A1B2C3D4E5"
          />
        </label>
        <button
          className="button button-primary"
          disabled={submitting || code.replace(/\W/g, "").length < 8}
          onClick={async () => {
            setSubmitting(true);
            await onClaim(code);
            setSubmitting(false);
          }}
        >
          {submitting ? "Đang ghép…" : "Ghép thiết bị"}
        </button>
        {message && (
          <p className="toast" role="alert">
            {message}
          </p>
        )}
        <button className="text-button" onClick={onUseLocal}>
          Dùng dữ liệu trên máy tạm thời
        </button>
      </section>
    </main>
  );
}

function CloudSetupView({
  message,
  onRetry,
  onUseLocal,
}: {
  message: string | null;
  onRetry: () => Promise<void>;
  onUseLocal: () => void;
}) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-word">
          twogether<span>.</span>
        </div>
        <div className="eyebrow">CẦN CÀI ĐẶT MỘT LẦN</div>
        <h1>Chưa nối được máy chủ.</h1>
        <p className="login-lede">
          {message ?? "Hãy chạy migration Supabase và bật Anonymous Sign-Ins."}
        </p>
        <button className="button button-dark" onClick={() => void onRetry()}>
          Thử lại
        </button>
        <button className="text-button" onClick={onUseLocal}>
          Học bằng dữ liệu trên máy trước
        </button>
      </section>
    </main>
  );
}

function DevicePairingView({
  client,
  learnerId,
  onBack,
}: {
  client: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>;
  learnerId: LearnerId;
  onBack: () => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const createCode = async () => {
    const { data, error } = await client.rpc("create_device_pairing", {
      p_label: `Từ thiết bị của ${learnerId}`,
    });
    if (error) setMessage("Chưa tạo được mã; hãy thử lại khi có mạng.");
    else {
      setCode(String(data));
      setMessage(null);
    }
  };
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="eyebrow">GHÉP MÁY KHÁC · {learnerId.toUpperCase()}</div>
        <h1>Mang tiến độ sang thiết bị mới.</h1>
        <p className="login-lede">
          Mã chỉ dùng một lần và hết hạn sau 10 phút. Không đăng xuất thiết bị
          này vì tài khoản ẩn danh không thể khôi phục bằng email.
        </p>
        {code && (
          <div className="pairing-code" aria-label={`Mã ghép ${code}`}>
            {code}
          </div>
        )}
        <button
          className="button button-primary"
          onClick={() => void createCode()}
        >
          {code ? "Tạo mã khác" : "Tạo mã ghép"}
        </button>
        <button className="text-button" onClick={onBack}>
          Quay lại học
        </button>
        {message && (
          <p className="toast" role="alert">
            {message}
          </p>
        )}
      </section>
    </main>
  );
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
  return (
    <LearningApp learnerId={learnerId} onLogout={() => setLearnerId(null)} />
  );
}

function LoginView({ onChoose }: { onChoose: (learnerId: LearnerId) => void }) {
  return (
    <main className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <section className="login-panel" aria-labelledby="welcome-title">
        <div className="brand-lockup">
          <span className="brand-word">
            twogether<span>.</span>
          </span>
          <span className="brand-note">learn for keeps</span>
        </div>
        <div className="eyebrow">PRIVATE LEARNING STUDIO · LOCAL PREVIEW</div>
        <h1 id="welcome-title">
          Học để nhớ lâu,
          <br />
          <em>cùng nhau.</em>
        </h1>
        <p className="login-lede">
          Một câu hỏi mở. Một lần tự gọi ý. Một bước nhỏ đủ thật để ngày mai vẫn
          còn ở đó.
        </p>
        <div className="learner-picker" aria-label="Chọn tài khoản học">
          {LEARNERS.map((learner) => (
            <button
              data-testid={`learner-choice-${learner.id}`}
              className={`learner-choice ${learner.tone}`}
              key={learner.id}
              onClick={() => onChoose(learner.id)}
            >
              <span className="avatar avatar-large">{learner.initial}</span>
              <span className="learner-choice-copy">
                <strong>{learner.name}</strong>
                <small>Không gian học riêng</small>
              </span>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <p className="preview-note">
          <span className="status-dot" /> Chọn người học để mở đúng tiến độ
          riêng trên thiết bị này.
        </p>
      </section>
    </main>
  );
}

function LearningApp({
  learnerId,
  onLogout,
  adapter = localDataAdapter,
}: {
  learnerId: LearnerId;
  onLogout: () => void;
  adapter?: DataAdapter & Partial<SupabaseDataAdapter>;
}) {
  const baseCards = useMemo(() => adapter.listCards(), [adapter]);
  const baseNodes = useMemo(() => adapter.listNodes(), [adapter]);
  const baseEdges = useMemo(() => adapter.listEdges(), [adapter]);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const cards = useMemo(
    () => getWorkspaceCards(baseCards),
    [baseCards, workspaceVersion],
  );
  const graph = useMemo(
    () => readGraph(baseNodes, baseEdges),
    [baseNodes, baseEdges, workspaceVersion],
  );
  const [snapshot, setSnapshot] = useState(() =>
    adapter.readLearner(learnerId, learnerId),
  );
  const [view, setView] = useState<View>("map");
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    () =>
      window.localStorage.getItem(`twogether.collection.${learnerId}`) ??
      COLLECTION_FIXTURES[0].id,
  );
  const collections = useMemo(() => listCollections(), [workspaceVersion]);
  const selectedCollection =
    collections.find((collection) => collection.id === selectedCollectionId) ??
    collections[0];
  const focusStorageKey = `twogether.focused-collections.${learnerId}.v1`;
  const [focusedCollectionIds, setFocusedCollectionIds] = useState<string[]>(
    () => {
      try {
        const parsed = JSON.parse(
          window.localStorage.getItem(focusStorageKey) ?? "[]",
        );
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (id): id is string => typeof id === "string",
          );
          if (valid.length) return valid;
        }
      } catch {
        // A malformed preference never blocks learning or touches review state.
      }
      return [selectedCollectionId];
    },
  );
  const publishedCards = useMemo(
    () => cards.filter((card) => card.status === "published"),
    [cards],
  );
  const initialPlan = useMemo(() => {
    const savedId = window.localStorage.getItem(
      `twogether.run.${learnerId}.${selectedCollection.id}`,
    );
    const saved = savedId ? loadRun(savedId) : null;
    if (
      saved?.plan.collectionId === selectedCollection.id &&
      saved.plan.learnerId === learnerId
    )
      return saved.plan;
    const plan = createRunPlan({
      id: `${learnerId}-${selectedCollection.id}-${Date.now()}`,
      learnerId,
      collectionId: selectedCollection.id,
      requiredCardIds: dueIds(publishedCards, snapshot, selectedCollection),
      createdAt: new Date(),
      timezone: TIMEZONE,
    });
    saveRun({ plan, attempts: [], status: "active" });
    window.localStorage.setItem(
      `twogether.run.${learnerId}.${selectedCollection.id}`,
      plan.id,
    );
    return plan;
  }, [learnerId]);
  const savedInitialRun = loadRun(initialPlan.id);
  const [runPlan, setRunPlan] = useState<CollectionRunPlan>(initialPlan);
  const [runAttempts, setRunAttempts] = useState<RunAttempt[]>(
    () => savedInitialRun?.attempts ?? [],
  );
  const initialRemaining = runPlan.requiredCardIds.filter(
    (id) =>
      !runAttempts.some(
        (attempt) => attempt.cardId === id && attempt.attemptConfirmed,
      ),
  );
  const [remainingIds, setRemainingIds] = useState<string[]>(
    initialRemaining.slice(1),
  );
  const [currentCardId, setCurrentCardId] = useState<string | null>(
    initialRemaining[0] ?? null,
  );
  const [repairQueue, setRepairQueue] = useState<RepairItem[]>([]);
  const [reviewActions, setReviewActions] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attemptText, setAttemptText] = useState("");
  const [attemptKind, setAttemptKind] = useState<AttemptKind>("mental");
  const [lastInterval, setLastInterval] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [pendingReview, setPendingReview] = useState<{
    cardId: string;
    rating: ReviewRating;
    key: string;
  } | null>(null);
  const learner = LEARNERS.find((item) => item.id === learnerId)!;
  const rawCurrentCard =
    cards.find((card) => card.id === currentCardId) ?? null;
  const currentCard = rawCurrentCard
    ? { ...rawCurrentCard, ...(supportForCard(rawCurrentCard.id) ?? {}) }
    : rawCurrentCard;
  const currentState = currentCard ? snapshot.cardStates[currentCard.id] : null;
  const currentCardNodeTitle = currentCard
    ? (graph.nodes.find((node) => node.id === currentCard.node_id)?.title ??
      "Nội dung")
    : "Nội dung";
  const completedUnique = new Set(
    runAttempts
      .filter((attempt) => attempt.attemptConfirmed)
      .map((attempt) => attempt.cardId),
  ).size;
  const dueCount = runPlan.requiredCardIds.length;
  const [streak, setStreak] = useState<StreakProjection>(() =>
    deriveStreak(readDailyQualifications(), learnerId),
  );
  useEffect(() => {
    if (!adapter.readStreak) return;
    void adapter
      .readStreak()
      .then(setStreak)
      .catch(() =>
        setMessage("Chưa đọc được streak mới nhất; lịch FSRS vẫn được giữ."),
      );
  }, [adapter, learnerId]);
  useEffect(() => {
    if (!adapter.startRun) return;
    void adapter
      .startRun(runPlan)
      .catch((error) =>
        setMessage(
          error instanceof Error
            ? `Chưa đồng bộ phiên học: ${error.message}`
            : "Chưa đồng bộ phiên học.",
        ),
      );
  }, [adapter, runPlan.id]);
  const refreshWorkspace = () => setWorkspaceVersion((value) => value + 1);
  const toggleFocusedCollection = (collectionId: string) => {
    setFocusedCollectionIds((current) => {
      const next = current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId];
      window.localStorage.setItem(focusStorageKey, JSON.stringify(next));
      return next;
    });
  };
  const resetStudy = (plan: CollectionRunPlan, attempts: RunAttempt[] = []) => {
    setRunPlan(plan);
    setRunAttempts(attempts);
    const untouched = plan.requiredCardIds.filter(
      (id) =>
        !attempts.some(
          (attempt) => attempt.cardId === id && attempt.attemptConfirmed,
        ),
    );
    setRemainingIds(untouched.slice(1));
    setCurrentCardId(untouched[0] ?? null);
    setRepairQueue([]);
    setReviewActions(0);
    setRevealed(false);
    setAttemptText("");
    setPendingReview(null);
    setMessage(null);
  };
  const startCollection = (collection: CardCollection) => {
    window.localStorage.setItem(
      `twogether.collection.${learnerId}`,
      collection.id,
    );
    const plan = createRunPlan({
      id: `${learnerId}-${collection.id}-${Date.now()}`,
      learnerId,
      collectionId: collection.id,
      requiredCardIds: dueIds(publishedCards, snapshot, collection),
      createdAt: new Date(),
      timezone: TIMEZONE,
    });
    saveRun({ plan, attempts: [], status: "active" });
    window.localStorage.setItem(
      `twogether.run.${learnerId}.${collection.id}`,
      plan.id,
    );
    setSelectedCollectionId(collection.id);
    resetStudy(plan);
    setView("study");
  };
  const advanceAfterReview = (
    nextRepairQueue: RepairItem[],
    nextReviewActions: number,
  ): string | null => {
    const scheduled = takeNextCardId(
      remainingIds,
      nextRepairQueue,
      nextReviewActions,
    );
    const nextId = scheduled ?? nextRepairQueue[0]?.cardId ?? null;
    const isRepair = nextRepairQueue.some((item) => item.cardId === nextId);
    if (nextId && !isRepair) setRemainingIds((ids) => ids.slice(1));
    setCurrentCardId(nextId);
    setRepairQueue(nextRepairQueue);
    setRevealed(false);
    setAttemptText("");
    setPendingReview(null);
    return nextId;
  };
  const handleAttempt = () => {
    setAttemptKind(attemptText.trim() ? "typed" : "mental");
    setRevealed(true);
  };
  const handleGrade = async (rating: ReviewRating) => {
    if (!currentCard || !currentState || !revealed || savingReview) return;
    setSavingReview(true);
    const retry =
      pendingReview?.cardId === currentCard.id ? pendingReview : null;
    const effectiveRating = retry?.rating ?? rating;
    const idempotencyKey =
      retry?.key ?? `${learnerId}-${currentCard.id}-${crypto.randomUUID()}`;
    if (!retry)
      setPendingReview({
        cardId: currentCard.id,
        rating: effectiveRating,
        key: idempotencyKey,
      });
    try {
      const input = {
        sessionLearnerId: learnerId,
        requestedLearnerId: learnerId,
        cardId: currentCard.id,
        rating: effectiveRating,
        attemptKind,
        occurredAt: new Date(),
        idempotencyKey,
        oldStateHash: hashCardState(currentState),
        runId: runPlan.id,
      };
      const result = adapter.recordReviewAsync
        ? await adapter.recordReviewAsync(input)
        : adapter.recordReview(input);
      setSnapshot(result.snapshot);
      setLastInterval(result.intervalLabel);
      const nextReviewActions = reviewActions + 1;
      setReviewActions(nextReviewActions);
      const savedRun = addRunAttempt(runPlan.id, learnerId, currentCard.id);
      const nextAttempts = savedRun?.attempts ?? [
        ...runAttempts,
        { cardId: currentCard.id, attemptConfirmed: true },
      ];
      setRunAttempts(nextAttempts);
      const existing = repairQueue.find(
        (item) => item.cardId === currentCard.id,
      );
      let nextRepairQueue: RepairItem[];
      if (effectiveRating === "Good")
        nextRepairQueue = removeRepairItem(repairQueue, currentCard.id);
      else if (existing && existing.appearances >= REPAIR_CAP)
        nextRepairQueue = removeRepairItem(repairQueue, currentCard.id);
      else
        nextRepairQueue = enqueueRepair(
          repairQueue,
          currentCard.id,
          nextReviewActions,
        );
      const nextId = advanceAfterReview(nextRepairQueue, nextReviewActions);
      setMessage(
        effectiveRating === "Good"
          ? `Đã ghi Nhớ · xem lại ${result.intervalLabel}`
          : "Đã ghi Quên · sẽ gặp lại trong vòng củng cố",
      );
      if (!nextId && nextRepairQueue.length === 0) {
        const qualification = qualifyAndPersistRun(runPlan.id);
        if (adapter.finalizeRun) {
          const remoteStreak = await adapter.finalizeRun(
            runPlan.id,
            new Date(),
            TIMEZONE,
          );
          setStreak(remoteStreak);
          setMessage(
            `Hoàn thành bộ · streak ${remoteStreak.currentDays} ngày · đã đồng bộ`,
          );
        } else if (qualification.didQualify) {
          const localStreak = deriveStreak(
            qualification.dailyQualifications,
            learnerId,
          );
          setStreak(localStreak);
          setMessage(`Hoàn thành bộ · streak ${localStreak.currentDays} ngày`);
        }
      }
    } catch (error) {
      if (
        adapter.reload &&
        error instanceof Error &&
        error.name === "ReviewConflictError"
      ) {
        await adapter.reload();
        setSnapshot(adapter.readLearner(learnerId, learnerId));
        setPendingReview(null);
      }
      setMessage(
        error instanceof Error
          ? `Chưa ghi được: ${error.message}`
          : "Chưa ghi được lượt học; hãy thử lại",
      );
    } finally {
      setSavingReview(false);
    }
  };
  return (
    <div className="app-shell">
      <AppHeader
        learner={learner}
        onLogout={onLogout}
        streak={streak.currentDays}
      />
      <main className={`main-content${view === "map" ? " map-main-content" : ""}`}>
        {view === "study" && (
          <>
            <div className="topline">
              <div>
                <span className="eyebrow">
                  HÔM NAY ·{" "}
                  {new Date().toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
              <span className="offline-note">Thông báo đẩy đang tắt</span>
            </div>
            <CollectionShelf
              collections={collections}
              selectedCollectionId={selectedCollection.id}
              runPlan={runPlan}
              completedUnique={completedUnique}
              onSelect={startCollection}
              onCreated={refreshWorkspace}
            />
          </>
        )}
        {view === "study" && (
          <StudyView
            dueCount={dueCount}
            currentCard={currentCard}
            cardNodeTitle={currentCardNodeTitle}
            repairQueue={repairQueue}
            completedReviews={completedUnique}
            revealed={revealed}
            attemptText={attemptText}
            setAttemptText={setAttemptText}
            handleAttempt={handleAttempt}
            handleGrade={handleGrade}
            restartSession={() => startCollection(selectedCollection)}
            message={message}
            lastInterval={lastInterval}
            savingReview={savingReview}
          />
        )}
        {view === "map" && (
          <Suspense
            fallback={
              <section className="map-loading surface" role="status">
                Đang mở bản đồ…
              </section>
            }
          >
            <KnowledgeMap
              nodes={graph.nodes}
              edges={graph.edges}
              cards={publishedCards}
              collections={collections}
              snapshot={snapshot}
              focusedCollectionIds={focusedCollectionIds}
              onToggleCollection={toggleFocusedCollection}
              onStartCollection={startCollection}
            />
          </Suspense>
        )}
        {view === "progress" && (
          <ProgressView
            cards={publishedCards}
            snapshot={snapshot}
            learnerName={learner.name}
            streak={streak}
            onOpenLibrary={() => setView("cards")}
          />
        )}
        {view === "cards" && (
          <Suspense
            fallback={
              <section className="map-loading surface" role="status">
                Đang mở thư viện thẻ…
              </section>
            }
          >
            <CardLibraryView
              cards={cards}
              nodes={graph.nodes}
              edges={graph.edges}
              learnerId={learnerId}
              onChanged={refreshWorkspace}
            />
          </Suspense>
        )}
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

function AppHeader({
  learner,
  onLogout,
  streak,
}: {
  learner: (typeof LEARNERS)[number];
  onLogout: () => void;
  streak: number;
}) {
  return (
    <header className="app-header">
      <div className="brand-lockup compact">
        <span className="brand-word">
          twogether<span>.</span>
        </span>
        <span className="brand-note">learn for keeps</span>
      </div>
      <div className="header-user">
        <span className="header-streak" aria-label={`${streak} ngày streak`}>
          🔥 {streak}
        </span>
        <button
          className={`avatar avatar-small ${learner.tone} learner-switch`}
          onClick={onLogout}
          aria-label="Mở bộ chọn hồ sơ"
          title="Mở bộ chọn hồ sơ"
        >
          {learner.initial}
        </button>
      </div>
    </header>
  );
}

function CollectionShelf({
  collections,
  selectedCollectionId,
  runPlan,
  completedUnique,
  onSelect,
  onCreated,
}: {
  collections: CardCollection[];
  selectedCollectionId: string;
  runPlan: CollectionRunPlan;
  completedUnique: number;
  onSelect: (collection: CardCollection) => void;
  onCreated: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const submit = () => {
    if (!title.trim()) return;
    createCollection({
      title,
      description: "Bộ do anh em tự tạo, bám vào gốc chung.",
      rootNodeId: null,
      cardIds: [],
    });
    setTitle("");
    setCreating(false);
    onCreated();
  };
  return (
    <section className="collection-shelf" aria-label="Chọn bộ thẻ">
      <div className="collection-shelf-head">
        <div>
          <span className="eyebrow">BỘ THẺ ĐANG HỌC</span>
          <strong>
            {completedUnique}/{runPlan.requiredCardIds.length || 0} thẻ đã gọi ý
          </strong>
        </div>
        <button className="text-button" onClick={() => setCreating(!creating)}>
          {creating ? "Đóng" : "+ Tạo bộ"}
        </button>
      </div>
      <div className="collection-list">
        {collections.map((collection) => (
          <button
            type="button"
            data-testid={`collection-${collection.id}`}
            className={`collection-chip ${collection.id === selectedCollectionId ? "is-active" : ""}`}
            key={collection.id}
            onClick={() => onSelect(collection)}
          >
            <span className="collection-chip-dot" />
            <span>
              <strong>{collection.title}</strong>
              <small>
                {collection.cardIds.length} card · {collection.description}
              </small>
            </span>
          </button>
        ))}
      </div>
      {creating && (
        <div className="collection-create">
          <label htmlFor="new-collection-title">Tên bộ mới</label>
          <input
            id="new-collection-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ví dụ: React từ gốc"
          />
          <button className="button button-dark" onClick={submit}>
            Tạo bộ
          </button>
          <small>Bộ mới bắt đầu rỗng; thêm card ở mục Thẻ.</small>
        </div>
      )}
    </section>
  );
}

function LegacyStudyView({
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
  if (!currentCard)
    return (
      <section className="empty-state surface" aria-live="polite">
        <div className="empty-symbol">✦</div>
        <span className="eyebrow">PHIÊN ĐÃ XONG</span>
        <h1>Một phiên học vừa đủ.</h1>
        <p>
          Hoàn thành bộ là một cam kết quay lại, không phải tuyên bố đã nhớ hết
          mọi thứ.
        </p>
        <div className="empty-actions">
          <button className="button button-primary" onClick={restartSession}>
            Học lại bộ này
          </button>
          <span className="helper-text">
            {completedReviews}/{dueCount} card đã được gọi ý
          </span>
        </div>
      </section>
    );
  const progress = Math.min(
    100,
    Math.round((completedReviews / Math.max(1, dueCount)) * 100),
  );
  return (
    <>
      <section className="study-intro">
        <div>
          <h1>
            Chậm một nhịp,
            <br />
            <em>nhớ thêm một chút.</em>
          </h1>
        </div>
        <div
          data-testid="study-progress"
          className="study-progress"
          aria-label={`${progress}% phiên học`}
        >
          <span>
            {String(Math.min(dueCount, completedReviews)).padStart(2, "0")}
          </span>
          <i>/ {String(Math.max(dueCount, 1)).padStart(2, "0")}</i>
          <small>đã gọi ý</small>
        </div>
      </section>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <section className="study-layout">
        <div className="study-side-note">
          <span className="side-note-number">01</span>
          <span className="side-note-copy">
            Gọi ý<br />
            trước phản hồi
          </span>
        </div>
        <article
          data-testid="study-card"
          className={`study-card surface ${revealed ? "is-revealed" : ""}`}
          aria-labelledby="card-prompt"
        >
          <div className="card-meta">
            <span className="card-node">{cardNodeTitle}</span>
          </div>
          <div className="card-question">
            <span className="question-mark" aria-hidden="true">
              ?
            </span>
            <h2 id="card-prompt">{currentCard.prompt}</h2>
          </div>
          {!revealed ? (
            <div className="attempt-panel">
              <textarea
                value={attemptText}
                onChange={(event) => setAttemptText(event.target.value)}
                placeholder="Viết thứ gì đó vào đây"
                aria-label="Câu trả lời riêng, không được lưu"
                rows={3}
              />
              <div className="attempt-actions">
                <button
                  className="hint-button"
                  onClick={() => setHintVisible(!hintVisible)}
                  aria-expanded={hintVisible}
                >
                  {hintVisible ? "Ẩn gợi ý" : "Gợi ý nhỏ"}
                  <span aria-hidden="true">⌁</span>
                </button>
                <button className="button button-dark" onClick={handleAttempt}>
                  Đã thử — xem đáp án <span aria-hidden="true">↗</span>
                </button>
              </div>
              {hintVisible && (
                <p className="hint-copy" role="note">
                  Gợi ý: hãy trả lời bằng chức năng của ý tưởng, không chỉ bằng
                  tên gọi.
                </p>
              )}
            </div>
          ) : (
            <div
              data-testid="reveal-panel"
              className="reveal-panel"
              aria-live="polite"
            >
              <div className="answer-block">
                <span className="section-label">LỜI GIẢI NGẮN</span>
                <p className="model-answer">{currentCard.model_answer}</p>
              </div>
              <div className="explanation-grid">
                <div>
                  <span className="section-label">VÌ SAO</span>
                  <p>{currentCard.explanation}</p>
                </div>
                <div className="misconception">
                  <span className="section-label">DỄ NHẦM</span>
                  <p>{currentCard.misconception}</p>
                </div>
              </div>
              <div className="transfer-block">
                <span className="section-label">
                  THỬ CHUYỂN SANG TÌNH HUỐNG MỚI
                </span>
                <p>{currentCard.transfer_prompt}</p>
              </div>
              <div className="grade-actions">
                <button
                  className="button button-forgot"
                  disabled={savingReview}
                  onClick={() => handleGrade("Again")}
                >
                  <span className="grade-icon">↺</span>
                  <span>
                    <strong>Quên</strong>
                    <small>Cần gặp lại sau vài card</small>
                  </span>
                </button>
                <button
                  className="button button-remember"
                  disabled={savingReview}
                  onClick={() => handleGrade("Good")}
                >
                  <span className="grade-icon">✦</span>
                  <span>
                    <strong>Nhớ</strong>
                    <small>
                      {savingReview
                        ? "Đang ghi…"
                        : (lastInterval ?? "Đưa vào lịch FSRS")}
                    </small>
                  </span>
                </button>
              </div>
            </div>
          )}
          {repairQueue.length > 0 && (
            <footer className="card-footer">
              <span className="repair-badge">
                ↺ {repairQueue.length} đang củng cố
              </span>
            </footer>
          )}
        </article>
      </section>
      {message && (
        <p className="toast" role="status">
          {message}
        </p>
      )}
    </>
  );
}

type DisplayNode = Pick<ConceptNode, "id" | "title" | "purpose" | "status"> & {
  kind: ConceptNode["kind"] | "universal";
  virtual?: boolean;
};
type TreeEdge = { from: string; to: string; type: string; virtual?: boolean };
const UNIVERSAL_ROOT: DisplayNode = {
  id: "twogether-universal-root",
  kind: "universal",
  title: "Bản chất chung",
  purpose:
    "Mọi nhánh bắt đầu từ nguyên lý, đi qua cơ chế, ranh giới rồi chuyển sang tình huống mới.",
  status: "framework",
  virtual: true,
};
const treeKindLabels: Record<DisplayNode["kind"], string> = {
  universal: "Gốc chung",
  root: "Bộ kiến thức",
  trunk: "Thân nguyên lý",
  branch: "Cành cơ chế",
  leaf: "Lá chuyển giao",
};

function MapView({
  nodes,
  edges,
  cards,
  snapshot,
  learnerId,
  onGraphChanged,
}: {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  cards: Card[];
  snapshot: LearnerSnapshot;
  learnerId: LearnerId;
  onGraphChanged: () => void;
}) {
  const displayNodes: DisplayNode[] = [UNIVERSAL_ROOT, ...nodes];
  const [selectedNodeId, setSelectedNodeId] = useState(UNIVERSAL_ROOT.id);
  const labelFor = (id: string) =>
    displayNodes.find((node) => node.id === id)?.title ?? id;
  const structuralEdges = edges.filter(
    (edge) => edge.type === "part_of" || edge.type === "prerequisite",
  );
  const nodesWithParents = new Set(structuralEdges.map((edge) => edge.to));
  const entryNodes = nodes.filter((node) => !nodesWithParents.has(node.id));
  const depthById = new Map<string, number>(
    entryNodes.map((node) => [node.id, 0]),
  );
  for (let pass = 0; pass < nodes.length; pass += 1)
    structuralEdges.forEach((edge) => {
      const fromDepth = depthById.get(edge.from);
      if (fromDepth === undefined) return;
      depthById.set(
        edge.to,
        Math.max(depthById.get(edge.to) ?? 0, fromDepth + 1),
      );
    });
  nodes.forEach((node) => {
    if (!depthById.has(node.id)) depthById.set(node.id, 0);
  });
  const depthLevels = [...new Set(depthById.values())].sort((a, b) => a - b);
  const layers = [
    { label: "Gốc chung", nodes: [UNIVERSAL_ROOT] },
    ...depthLevels.map((depth) => ({
      label: `Lớp ${depth + 1}`,
      nodes: nodes.filter((node) => depthById.get(node.id) === depth),
    })),
  ];
  const treeEdges: TreeEdge[] = [
    ...entryNodes.map((node) => ({
      from: UNIVERSAL_ROOT.id,
      to: node.id,
      type: "part_of",
      virtual: true,
    })),
    ...structuralEdges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      type: edge.type,
    })),
  ];
  const treeStageHeight = layers.length * 172 + 180;
  const widestLayer = Math.max(...layers.map((layer) => layer.nodes.length));
  const treeStageWidth = Math.max(1000, widestLayer * 280 + 120);
  const layerIndexFor = (id: string) =>
    Math.max(
      0,
      layers.findIndex((layer) => layer.nodes.some((node) => node.id === id)),
    );
  const xFor = (id: string) => {
    const layer = layers[layerIndexFor(id)];
    const index = layer.nodes.findIndex((node) => node.id === id);
    return ((index + 1) / (layer.nodes.length + 1)) * 1000;
  };
  const children = new Map<string, string[]>();
  treeEdges.forEach((edge) =>
    children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]),
  );
  const descendants = (id: string) => {
    const found = new Set<string>();
    const pending = [id];
    while (pending.length) {
      const next = pending.shift()!;
      if (found.has(next)) continue;
      found.add(next);
      pending.push(...(children.get(next) ?? []));
    }
    return found;
  };
  const progressFor = (id: string) => {
    const ids = descendants(id);
    const nodeCards = cards.filter((card) => ids.has(card.node_id));
    const stable = nodeCards.filter(
      (card) => snapshot.cardStates[card.id]?.fsrs.stability > 2,
    ).length;
    return {
      count: nodeCards.length,
      stable,
      percent: nodeCards.length
        ? Math.round((stable / nodeCards.length) * 100)
        : 0,
    };
  };
  const selected =
    displayNodes.find((node) => node.id === selectedNodeId) ?? UNIVERSAL_ROOT;
  const selectedProgress = progressFor(selected.id);
  const mapProgress = progressFor(UNIVERSAL_ROOT.id);
  const prerequisites = edges
    .filter((edge) => edge.to === selected.id && edge.type === "prerequisite")
    .map((edge) => labelFor(edge.from));
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [parentId, setParentId] = useState(nodes[0]?.id ?? "");
  const [relation, setRelation] = useState<"part_of" | "prerequisite">(
    "part_of",
  );
  const [graphMessage, setGraphMessage] = useState<string | null>(null);
  const addNode = () => {
    const result = addGraphNode(
      {
        title,
        purpose,
        kind: "branch",
        parentId,
        relation,
        maintainer: learnerId,
      },
      edges,
    );
    if (!result.ok) setGraphMessage(result.error);
    else {
      setGraphMessage(
        `Đã thêm nhánh “${result.node.title}” ở trạng thái draft.`,
      );
      setTitle("");
      setPurpose("");
      onGraphChanged();
    }
  };
  return (
    <section className="map-page">
      <div className="page-heading map-heading">
        <div>
          <h1>
            Một gốc để nhớ lâu,
            <br />
            <em>nhiều cành để đi xa.</em>
          </h1>
          <p className="map-subtitle">
            Mỗi nút mở ra một lớp hiểu khác nhau. Đi từ nguyên lý, qua cơ chế,
            rồi tự mình chuyển sang tình huống mới.
          </p>
        </div>
        <div className="map-summary" aria-label="Tóm tắt bản đồ">
          <div>
            <strong>{displayNodes.length - 1}</strong>
            <span>nhánh</span>
          </div>
          <div>
            <strong>{mapProgress.count}</strong>
            <span>card trong cây</span>
          </div>
        </div>
      </div>
      <div className="map-controls">
        <span className="map-instruction">
          <i aria-hidden="true" /> Chạm hoặc rê vào một nút để xem nhánh.
        </span>
        <span className="map-progress-caption">
          {mapProgress.stable}/{mapProgress.count} card đang bền
        </span>
      </div>
      <div className="knowledge-tree surface" data-testid="knowledge-tree">
        <div className="tree-viewport">
          <div
            className="tree-stage is-wide"
            role="tree"
            aria-label="Cây kiến thức từ gốc chung đến các nhánh"
            data-testid="tree-map"
            style={{
              minHeight: `${treeStageHeight}px`,
              width: `max(100%, ${treeStageWidth}px)`,
              minWidth: `${treeStageWidth}px`,
            }}
          >
            <svg
              className="tree-links"
              viewBox={`0 0 1000 ${treeStageHeight}`}
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <title>Đường nối giữa các lớp kiến thức</title>
              {treeEdges.map((edge, index) => {
                const fromLayer = layerIndexFor(edge.from);
                const toLayer = layerIndexFor(edge.to);
                const fromY = 28 + fromLayer * 172 + 146;
                const toY = 28 + toLayer * 172;
                const middleY = (fromY + toY) / 2;
                return (
                  <path
                    key={`${edge.from}-${edge.to}-${index}`}
                    data-testid="tree-link"
                    className={`tree-link ${edge.type}`}
                    d={`M ${xFor(edge.from)} ${fromY} C ${xFor(edge.from)} ${middleY}, ${xFor(edge.to)} ${middleY}, ${xFor(edge.to)} ${toY}`}
                  />
                );
              })}
            </svg>
            {layers.map((layer, layerIndex) =>
              layer.nodes.map((node, index) => {
                const progress = progressFor(node.id);
                const isSelected = selected.id === node.id;
                return (
                  <button
                    type="button"
                    role="treeitem"
                    aria-level={layerIndex + 1}
                    aria-selected={isSelected}
                    aria-label={`${node.title}. ${progress.stable}/${progress.count} card bền hơn`}
                    data-testid={`tree-node-${node.id}`}
                    className={`tree-node ${node.kind}${isSelected ? " is-selected" : ""}`}
                    style={{
                      left: `${((index + 1) / (layer.nodes.length + 1)) * 100}%`,
                      top: 28 + layerIndex * 172,
                    }}
                    key={node.id}
                    onMouseEnter={() => setSelectedNodeId(node.id)}
                    onFocus={() => setSelectedNodeId(node.id)}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <span className="node-kind">
                      {treeKindLabels[node.kind]}
                    </span>
                    <strong className="tree-node-title">{node.title}</strong>
                    <span className="tree-node-meter" aria-hidden="true">
                      <i style={{ width: `${progress.percent}%` }} />
                    </span>
                    <span className="tree-node-progress">
                      {progress.count
                        ? `${progress.stable}/${progress.count} card bền hơn`
                        : "Chưa có card trực tiếp"}
                    </span>
                  </button>
                );
              }),
            )}
          </div>
        </div>
        <div className="tree-legend" aria-label="Chú thích các đường nối">
          <span>
            <i className="legend-line-solid" aria-hidden="true" /> thuộc về
          </span>
          <span>
            <i className="legend-line-dashed" aria-hidden="true" /> prerequisite
          </span>
        </div>
      </div>
      <section
        className="tree-detail surface"
        aria-live="polite"
        data-testid="tree-detail"
      >
        <div className="tree-detail-heading">
          <div>
            <span className="tree-detail-label">ĐANG XEM</span>
            <span className="node-kind">{treeKindLabels[selected.kind]}</span>
          </div>
          <span className="tree-detail-percent">
            {selectedProgress.percent}% bền hơn
          </span>
        </div>
        <h2 data-testid="tree-detail-title">{selected.title}</h2>
        <p>{selected.purpose}</p>
        <div className="tree-detail-stats">
          <span>{selectedProgress.count} card trong nhánh</span>
          <span>{selectedProgress.stable} card đang bền</span>
        </div>
        {prerequisites.length > 0 && (
          <p className="tree-prerequisites">
            <strong>Học sau:</strong> {prerequisites.join(", ")}
          </p>
        )}
      </section>
      <details className="accessible-map surface">
        <summary>Danh sách map cho bàn phím và trình đọc màn hình</summary>
        <div className="table-wrap">
          <table>
            <caption>Concept map và prerequisite</caption>
            <thead>
              <tr>
                <th>Node</th>
                <th>Loại</th>
                <th>Mục đích</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {displayNodes.map((node) => {
                const p = progressFor(node.id);
                return (
                  <tr key={node.id}>
                    <th scope="row">{node.title}</th>
                    <td>{treeKindLabels[node.kind]}</td>
                    <td>{node.purpose}</td>
                    <td>
                      {p.stable}/{p.count} card có stability &gt; 2
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="edge-list">
          <span className="section-label">CÁC NỐI PREREQUISITE</span>
          {edges
            .filter((edge) => edge.type === "prerequisite")
            .map((edge) => (
              <span key={`${edge.from}-${edge.to}`}>
                {labelFor(edge.from)} <b>→</b> {labelFor(edge.to)}
              </span>
            ))}
        </div>
      </details>
      <section className="graph-authoring surface">
        <div>
          <span className="eyebrow">THÊM NHÁNH</span>
          <h2>Cho kiến thức mới một chỗ để bám.</h2>
          <p>
            Nhánh mới được lưu draft; relation prerequisite sẽ được kiểm tra
            vòng trước khi nối vào cây.
          </p>
        </div>
        <div className="graph-authoring-grid">
          <label>
            Tên nhánh
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Component boundaries"
            />
          </label>
          <label>
            Bám vào
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quan hệ
            <select
              value={relation}
              onChange={(event) =>
                setRelation(event.target.value as "part_of" | "prerequisite")
              }
            >
              <option value="part_of">thuộc về</option>
              <option value="prerequisite">học trước</option>
            </select>
          </label>
          <label>
            Mục đích
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Nó giúp hiểu nguyên lý nào?"
              rows={2}
            />
          </label>
        </div>
        <button className="button button-dark" onClick={addNode}>
          Thêm nhánh draft
        </button>
        {graphMessage && (
          <p className="toast" role="status">
            {graphMessage}
          </p>
        )}
      </section>
    </section>
  );
}

function ProgressView({
  cards,
  snapshot,
  learnerName,
  streak,
  onOpenLibrary,
}: {
  cards: Card[];
  snapshot: LearnerSnapshot;
  learnerName: string;
  streak: StreakProjection;
  onOpenLibrary: () => void;
}) {
  const reviewed = snapshot.reviewEvents.length;
  const remembered = snapshot.reviewEvents.filter(
    (event) => event.rating === "Good",
  ).length;
  const stable = cards.filter(
    (card) => snapshot.cardStates[card.id]?.fsrs.stability > 2,
  ).length;
  const today = snapshot.reviewEvents.filter(
    (event) =>
      event.occurredAt.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length;
  return (
    <section className="progress-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TIẾN ĐỘ · {learnerName.toUpperCase()}</span>
          <h1>
            Nhìn thấy nhịp học,
            <br />
            <em>không chấm điểm con người.</em>
          </h1>
        </div>
        <button className="button button-dark" onClick={onOpenLibrary}>
          Quản lý thẻ
        </button>
      </div>
      <div className="stats-grid">
        <Stat
          value={`${streak.currentDays}`}
          label="ngày streak"
          detail={`kỷ lục ${streak.bestDays} ngày · hoàn thành một bộ/ngày`}
          tone="coral"
        />
        <Stat
          value={`${stable}/${cards.length}`}
          label="card đang bền"
          detail="dựa trên stability FSRS"
          tone="blue"
        />
        <Stat
          value={`${remembered}/${Math.max(reviewed, 1)}`}
          label="lần Nhớ"
          detail={`${today} lượt hôm nay`}
          tone="gold"
        />
      </div>
      <div className="progress-columns">
        <section className="goal-card surface">
          <div className="goal-orbit" />
          <span className="eyebrow">MỤC TIÊU CHUNG · TUẦN NÀY</span>
          <h2>
            Một bộ nhỏ mỗi ngày,
            <br />
            <em>đủ để giữ lửa.</em>
          </h2>
          <p>
            Streak ghi nhận việc bạn hoàn thành một phiên học trung thực; nó
            không đòi bạn phải nhớ ngay tất cả.
          </p>
          <div className="goal-people">
            <div>
              <span className="avatar avatar-small coral">H</span>
              <span>Hiệp</span>
            </div>
            <div>
              <span className="avatar avatar-small blue">H</span>
              <span>Hoàng</span>
            </div>
            <span className="goal-line" />
          </div>
        </section>
        <section className="signal-card surface">
          <div className="signal-header">
            <span className="eyebrow">TÍN HIỆU NHẸ</span>
            <span className="signal-date">Streak</span>
          </div>
          <div className="streak-hero">
            <strong>🔥 {streak.currentDays}</strong>
            <span>ngày liên tiếp đã quay lại</span>
          </div>
          <p className="signal-caption">
            Nghỉ một ngày không xoá lịch sử. Chỉ cần chọn một bộ và bắt đầu lại.
          </p>
        </section>
      </div>
    </section>
  );
}
function Stat({
  value,
  label,
  detail,
  tone,
}: {
  value: string;
  label: string;
  detail: string;
  tone: string;
}) {
  return (
    <div data-testid={`stat-${tone}`} className={`stat-card surface ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}

function LegacyCardLibraryView({
  cards,
  nodes,
  supportPreviewEnabled,
  onSupportPreviewChange,
  onChanged,
}: {
  cards: Card[];
  nodes: ConceptNode[];
  supportPreviewEnabled: boolean;
  onSupportPreviewChange: (enabled: boolean) => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Card | null>(null);
  const [packetText, setPacketText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedDraftCollectionId, setSelectedDraftCollectionId] = useState(
    ENGLISH_CORE_DRAFT_COLLECTIONS[0]?.id ?? "",
  );
  const selectedDraftCollection =
    ENGLISH_CORE_DRAFT_COLLECTIONS.find(
      (collection) => collection.id === selectedDraftCollectionId,
    ) ?? ENGLISH_CORE_DRAFT_COLLECTIONS[0];
  const draftCards = selectedDraftCollection
    ? draftCardsForCollection(selectedDraftCollection.id).map(
        (card) => cards.find((candidate) => candidate.id === card.id) ?? card,
      )
    : [];
  const regularCards = cards.filter(
    (card) => !ENGLISH_CORE_DRAFT_CARD_IDS.has(card.id),
  );
  const blank = (): Card => ({
    id: `local-card-${Date.now()}`,
    node_id: nodes[0]?.id ?? "core-en-module-01",
    card_type: "core_recall",
    prompt: "",
    model_answer: "",
    explanation: "",
    misconception: "",
    transfer_prompt: "",
    prerequisite_node_ids: [],
    source_refs: ["local-authoring:p0"],
    status: "draft",
    author: "local",
    reviewer: null,
  });
  const save = () => {
    if (!editing?.prompt.trim() || !editing.model_answer.trim()) {
      setNotice("Câu hỏi và lời giải ngắn là bắt buộc.");
      return;
    }
    const scaffoldPrompt = editing.scaffold_prompt?.trim();
    const scaffoldAnswer = editing.scaffold_answer?.trim();
    if (Boolean(scaffoldPrompt) !== Boolean(scaffoldAnswer)) {
      setNotice("Cần nhập đủ cả câu hỏi phụ và lời giải câu phụ.");
      return;
    }
    saveCardDraft({
      ...editing,
      scaffold_prompt: scaffoldPrompt || undefined,
      scaffold_answer: scaffoldAnswer || undefined,
      glossary_refs: [...new Set(editing.glossary_refs ?? [])],
    });
    setEditing(null);
    setNotice("Đã lưu bản nháp. Bạn có thể xuất bản sau khi tự review.");
    onChanged();
  };
  const importCards = () => {
    try {
      const imported = importPacketAsDraft(JSON.parse(packetText));
      imported.forEach((card) => saveCardDraft(card));
      setPacketText("");
      setNotice(`Đã nhập ${imported.length} card ở trạng thái draft.`);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Packet không hợp lệ");
    }
  };
  const exportVisible = () => {
    const packet = exportCardPacket(
      {
        packet_id: `export-${Date.now()}`,
        created_at: new Date().toISOString(),
        created_by: { actor_type: "human", actor_id: "local" },
        sources: [
          {
            source_ref: "local-export",
            kind: "workspace",
            raw_private_content_included: false,
          },
        ],
      },
      cards,
    );
    setPacketText(JSON.stringify(packet, null, 2));
    setNotice("Đã tạo packet; bạn có thể copy để AI khác đọc và tạo tiếp.");
  };
  const update = (key: keyof Card, value: string) =>
    setEditing((card) => (card ? { ...card, [key]: value } : card));
  const updateGlossaryRefs = (value: string) =>
    setEditing((card) =>
      card
        ? {
            ...card,
            glossary_refs: value
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean),
          }
        : card,
    );
  return (
    <section className="library-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THƯ VIỆN CARD · CRUD LOCAL</span>
          <h1>
            Chủ động sửa,
            <br />
            <em>chủ động hiểu.</em>
          </h1>
          <p className="map-subtitle">
            Card AI nhập vào luôn là draft; lịch sử review của card không bị xoá
            khi bạn chỉnh nội dung.
          </p>
        </div>
        <button
          className="button button-dark"
          onClick={() => setEditing(blank())}
        >
          + Card mới
        </button>
      </div>
      <div className="library-actions">
        <button className="text-button" onClick={exportVisible}>
          Xuất packet cho AI
        </button>
        <button className="text-button" onClick={() => setPacketText("")}>
          Xoá vùng packet
        </button>
      </div>
      <section
        className="support-review surface"
        aria-labelledby="support-review-title"
      >
        <div>
          <span className="eyebrow">LỚP HỖ TRỢ · AI DRAFT</span>
          <h2 id="support-review-title">
            80 câu phụ và glossary đang chờ bạn duyệt.
          </h2>
          <p>
            Bật dùng thử chỉ trên trình duyệt này. Câu phụ không thay đáp án
            chính và không đổi lịch FSRS.
          </p>
        </div>
        <button
          type="button"
          className={`button ${supportPreviewEnabled ? "button-primary" : "button-dark"}`}
          onClick={() => onSupportPreviewChange(!supportPreviewEnabled)}
        >
          {supportPreviewEnabled ? "Tắt bản dùng thử" : "Dùng thử lớp hỗ trợ"}
        </button>
      </section>
      <section
        className="draft-core-library surface"
        aria-labelledby="english-core-draft-title"
      >
        <div className="draft-core-heading">
          <div>
            <span className="eyebrow">CURRICULUM · ĐÃ DUYỆT</span>
            <h2 id="english-core-draft-title">
              English Core v1 · 80 thẻ đang học
            </h2>
            <p>
              Mười bộ nguyên lý đã được Hiệp duyệt và đang nằm trong lịch học.
              Đưa một thẻ vào vùng chỉnh sửa sẽ tạo bản nháp mới, không làm mất
              bản đã duyệt hay lịch sử ôn.
            </p>
          </div>
          <span className="draft-core-count">10 bộ · 8 thẻ/bộ</span>
        </div>
        <div
          className="draft-collection-tabs"
          role="tablist"
          aria-label="Các bộ thẻ đã duyệt English Core v1"
        >
          {ENGLISH_CORE_DRAFT_COLLECTIONS.map((collection, index) => (
            <button
              type="button"
              key={collection.id}
              data-testid={`draft-collection-${collection.id}`}
              id={`draft-collection-tab-${collection.id}`}
              role="tab"
              aria-selected={collection.id === selectedDraftCollection?.id}
              aria-controls="draft-collection-panel"
              className={`draft-collection-tab ${collection.id === selectedDraftCollection?.id ? "is-active" : ""}`}
              onClick={() => setSelectedDraftCollectionId(collection.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{collection.title}</strong>
            </button>
          ))}
        </div>
        {selectedDraftCollection && (
          <div
            id="draft-collection-panel"
            data-testid="draft-collection-panel"
            role="tabpanel"
            aria-labelledby={`draft-collection-tab-${selectedDraftCollection.id}`}
            className="draft-collection-panel"
          >
            <div className="draft-collection-summary">
              <div>
                <span className="node-kind">đã duyệt · đang học</span>
                <h3>{selectedDraftCollection.title}</h3>
                <p>{selectedDraftCollection.description}</p>
              </div>
              <span>{draftCards.length}/8 thẻ</span>
            </div>
            <div className="draft-card-grid">
              {draftCards.map((card, index) => (
                <article
                  className="draft-review-card"
                  data-testid={`draft-card-${card.id}`}
                  key={card.id}
                >
                  <div className="draft-review-card-head">
                    <span>THẺ {String(index + 1).padStart(2, "0")}</span>
                    <span>đã duyệt · đang học</span>
                  </div>
                  <h4>{card.prompt}</h4>
                  {supportForCard(card.id) && (
                    <div className="draft-support-preview">
                      <span className="section-label">CÂU PHỤ</span>
                      <p>{supportForCard(card.id)?.scaffold_prompt}</p>
                      <small>
                        {supportForCard(card.id)?.glossary_refs?.join(" · ") ||
                          "Không có thuật ngữ gắn kèm"}
                      </small>
                    </div>
                  )}
                  <p className="draft-card-meta">
                    {card.card_type.replace("_", " · ")} ·{" "}
                    {nodes.find((node) => node.id === card.node_id)?.title ??
                      card.node_id}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setEditing({ ...card, status: "draft", reviewer: null });
                      setNotice(
                        "Đã tạo bản chỉnh sửa nháp. Bản đã duyệt và lịch sử học vẫn được giữ nguyên.",
                      );
                    }}
                  >
                    Đưa vào chỉnh sửa
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      {editing && (
        <section className="editor-card surface">
          <div className="editor-head">
            <span className="eyebrow">BẢN NHÁP</span>
            <button className="text-button" onClick={() => setEditing(null)}>
              Đóng
            </button>
          </div>
          <label>
            Câu hỏi
            <textarea
              value={editing.prompt}
              onChange={(event) => update("prompt", event.target.value)}
              rows={3}
              placeholder="Buộc người học tự gọi đáp án"
            />
          </label>
          <div className="editor-grid">
            <label>
              Câu hỏi phụ
              <textarea
                value={editing.scaffold_prompt ?? ""}
                onChange={(event) =>
                  update("scaffold_prompt", event.target.value)
                }
                rows={2}
                placeholder="Giúp hiểu đề, không lộ đáp án chính"
              />
            </label>
            <label>
              Lời giải câu phụ
              <textarea
                value={editing.scaffold_answer ?? ""}
                onChange={(event) =>
                  update("scaffold_answer", event.target.value)
                }
                rows={2}
                placeholder="Giải thích đề đang yêu cầu thao tác gì"
              />
            </label>
          </div>
          <label>
            Glossary refs
            <input
              value={(editing.glossary_refs ?? []).join(", ")}
              onChange={(event) => updateGlossaryRefs(event.target.value)}
              placeholder="finite-verb, clause, subject"
            />
          </label>
          <label>
            Lời giải ngắn
            <textarea
              value={editing.model_answer}
              onChange={(event) => update("model_answer", event.target.value)}
              rows={2}
            />
          </label>
          <div className="editor-grid">
            <label>
              Vì sao
              <textarea
                value={editing.explanation}
                onChange={(event) => update("explanation", event.target.value)}
                rows={3}
              />
            </label>
            <label>
              Dễ nhầm
              <textarea
                value={editing.misconception}
                onChange={(event) =>
                  update("misconception", event.target.value)
                }
                rows={3}
              />
            </label>
          </div>
          <label>
            Thử chuyển sang tình huống mới
            <textarea
              value={editing.transfer_prompt}
              onChange={(event) =>
                update("transfer_prompt", event.target.value)
              }
              rows={2}
            />
          </label>
          <button className="button button-dark" onClick={save}>
            Lưu bản nháp
          </button>
        </section>
      )}
      <div className="card-library-list">
        {regularCards.map((card) => (
          <article
            className={`library-card surface ${card.status}`}
            key={card.id}
          >
            <div>
              <span className="node-kind">{card.status}</span>
              <h2>{card.prompt}</h2>
              <small>
                {nodes.find((node) => node.id === card.node_id)?.title ??
                  card.node_id}{" "}
                · {card.source_refs.join(", ")}
              </small>
            </div>
            <div className="library-card-actions">
              <button
                className="text-button"
                onClick={() => setEditing({ ...card })}
              >
                Sửa
              </button>
              {card.status === "draft" && (
                <button
                  className="text-button"
                  onClick={() => {
                    publishCardDraft(card.id);
                    setNotice("Đã xuất bản card vào bộ nội dung local.");
                    onChanged();
                  }}
                >
                  Xuất bản
                </button>
              )}
              {card.status !== "archived" && (
                <button
                  className="text-button danger"
                  onClick={() => {
                    saveCardDraft(card);
                    archiveCard(card.id);
                    setNotice("Đã archive card; lịch sử học vẫn còn.");
                    onChanged();
                  }}
                >
                  Archive
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <section className="packet-panel surface">
        <div>
          <span className="eyebrow">AI HANDOFF · JSON</span>
          <h2>Packet có thể đọc được ở phiên AI khác.</h2>
          <p>
            Giữ nguồn, trạng thái draft và nguyên lý; không chứa progress riêng
            của Hiệp/Hoàng.
          </p>
        </div>
        <textarea
          value={packetText}
          onChange={(event) => setPacketText(event.target.value)}
          placeholder="Dán card-packet.v1 vào đây để nhập draft, hoặc bấm Xuất packet cho AI."
          rows={8}
        />
        <button className="button button-primary" onClick={importCards}>
          Kiểm tra và nhập draft
        </button>
      </section>
      {notice && (
        <p className="toast" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

function BottomNav({
  view,
  setView,
}: {
  view: View;
  setView: (view: View) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <button
        data-testid="nav-map"
        className={view === "map" ? "active" : ""}
        onClick={() => setView("map")}
      >
        <span aria-hidden="true">⌘</span>
        <small>Cây</small>
      </button>
      <button
        data-testid="nav-study"
        className={view === "study" ? "active" : ""}
        onClick={() => setView("study")}
      >
        <span aria-hidden="true">◌</span>
        <small>Tiếp tục</small>
      </button>
      <button
        data-testid="nav-progress"
        className={view === "progress" ? "active" : ""}
        onClick={() => setView("progress")}
      >
        <span aria-hidden="true">◒</span>
        <small>Tiến độ</small>
      </button>
      <button
        data-testid="nav-cards"
        className={view === "cards" ? "active" : ""}
        onClick={() => setView("cards")}
      >
        <span aria-hidden="true">✎</span>
        <small>Thẻ</small>
      </button>
    </nav>
  );
}

export default App;
