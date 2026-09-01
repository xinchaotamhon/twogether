import { useState } from "react";
import {
  ENGLISH_CORE_DRAFT_CARD_IDS,
  ENGLISH_CORE_DRAFT_COLLECTIONS,
  draftCardsForCollection,
} from "./curriculumDrafts";
import { exportCardPacket, importPacketAsDraft } from "./contentPacket";
import { archiveCard, publishCardDraft, saveCardDraft } from "./localWorkspace";
import { supportForCard } from "./cardSupport";
import { CoursebookReviewPanel } from "./CoursebookReviewPanel";
import type { Card, ConceptNode } from "./types";

interface CardLibraryViewProps {
  cards: Card[];
  nodes: ConceptNode[];
  onChanged: () => void;
}

export function CardLibraryView({
  cards,
  nodes,
  onChanged,
}: CardLibraryViewProps) {
  const [editing, setEditing] = useState<Card | null>(null);
  const [packetText, setPacketText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    ENGLISH_CORE_DRAFT_COLLECTIONS[0]?.id ?? "",
  );
  const selectedCollection =
    ENGLISH_CORE_DRAFT_COLLECTIONS.find(
      (collection) => collection.id === selectedCollectionId,
    ) ?? ENGLISH_CORE_DRAFT_COLLECTIONS[0];
  const coreCards = selectedCollection
    ? draftCardsForCollection(selectedCollection.id).map((card) => ({
        ...card,
        ...(supportForCard(card.id) ?? {}),
        ...(cards.find((candidate) => candidate.id === card.id) ?? {}),
      }))
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
    transfer_answer: "",
    prerequisite_node_ids: [],
    source_refs: ["local-authoring:p0"],
    status: "draft",
    author: "local",
    reviewer: null,
  });

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

  const save = () => {
    if (!editing?.prompt.trim() || !editing.model_answer.trim()) {
      setNotice("Câu hỏi và lời giải ngắn là bắt buộc.");
      return;
    }
    saveCardDraft({
      ...editing,
      transfer_answer: editing.transfer_answer?.trim() || undefined,
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
      <CoursebookReviewPanel onChanged={onChanged} />
      <section
        className="support-review surface"
        aria-labelledby="support-review-title"
      >
        <div>
          <span className="eyebrow">LỚP HỖ TRỢ · ĐANG DÙNG</span>
          <h2 id="support-review-title">
            80 lời giải chuyển giao và glossary.
          </h2>
          <p>
            Lời giải chuyển giao là một cách làm mẫu, không phải đáp án duy nhất
            và không thay đổi lịch FSRS.
          </p>
        </div>
      </section>
      <section
        className="draft-core-library surface"
        aria-labelledby="english-core-title"
      >
        <div className="draft-core-heading">
          <div>
            <span className="eyebrow">CURRICULUM · ĐÃ DUYỆT</span>
            <h2 id="english-core-title">English Core v1 · 80 thẻ đang học</h2>
            <p>
              Mười bộ nguyên lý đang nằm trong lịch học. Chỉnh một thẻ sẽ tạo
              bản nháp mới, không làm mất bản đã duyệt hay lịch sử ôn.
            </p>
          </div>
          <span className="draft-core-count">10 bộ · 8 thẻ/bộ</span>
        </div>
        <div
          className="draft-collection-tabs"
          role="tablist"
          aria-label="Các bộ thẻ English Core v1"
        >
          {ENGLISH_CORE_DRAFT_COLLECTIONS.map((collection, index) => (
            <button
              type="button"
              key={collection.id}
              data-testid={`draft-collection-${collection.id}`}
              role="tab"
              aria-selected={collection.id === selectedCollection?.id}
              className={`draft-collection-tab ${collection.id === selectedCollection?.id ? "is-active" : ""}`}
              onClick={() => setSelectedCollectionId(collection.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{collection.title}</strong>
            </button>
          ))}
        </div>
        {selectedCollection && (
          <div
            data-testid="draft-collection-panel"
            role="tabpanel"
            className="draft-collection-panel"
          >
            <div className="draft-collection-summary">
              <div>
                <span className="node-kind">đã duyệt · đang học</span>
                <h3>{selectedCollection.title}</h3>
                <p>{selectedCollection.description}</p>
              </div>
              <span>{coreCards.length}/8 thẻ</span>
            </div>
            <div className="draft-card-grid">
              {coreCards.map((card, index) => (
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
                  <div className="draft-support-preview">
                    <span className="section-label">LỜI GIẢI CHUYỂN GIAO</span>
                    <p>{card.transfer_answer ?? "Chưa có lời giải mẫu."}</p>
                    <small>
                      {card.glossary_refs?.join(" · ") ||
                        "Không có thuật ngữ gắn kèm"}
                    </small>
                  </div>
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
          <label>
            Lời giải chuyển giao
            <textarea
              value={editing.transfer_answer ?? ""}
              onChange={(event) =>
                update("transfer_answer", event.target.value)
              }
              rows={3}
              placeholder="Một cách làm mẫu, không phải đáp án duy nhất"
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
