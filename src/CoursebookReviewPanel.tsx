import { useMemo, useState } from "react";
import packetJson from "../content/drafts/empower-a2-coursebook-final-review-v1.json";
import { createCollection } from "./collectionWorkspace";
import { publishCardDraft, saveCardDraft } from "./localWorkspace";
import type { Card } from "./types";

interface CoursebookCandidate extends Card {
  deck: string;
  source_pdf_pages: number[];
  source_scope: string;
  glossary_terms: string[];
  prerequisite_card_ids: string[];
  provenance_note: string;
}

const packet = packetJson as unknown as {
  packet_id: string;
  status: "review";
  source: { sha256: string; pdf_pages: number };
  provenance: { review_status: string };
  cards: CoursebookCandidate[];
};
const FLAG_KEY = "twogether.coursebook.empower-a2.review-flags.v1";
const COLLECTION_ID = "collection-empower-a2-learning-v1";

function readFlags(): Set<string> {
  try {
    const value = JSON.parse(window.localStorage.getItem(FLAG_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

export function CoursebookReviewPanel({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [flagged, setFlagged] = useState<Set<string>>(readFlags);
  const [deck, setDeck] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);
  const decks = useMemo(
    () => [...new Set(packet.cards.map((card) => card.deck))],
    [],
  );
  const visibleCards =
    deck === "all"
      ? packet.cards
      : packet.cards.filter((card) => card.deck === deck);
  const eligible = packet.cards.filter((card) => !flagged.has(card.id));

  const toggle = (cardId: string) => {
    const next = new Set(flagged);
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    window.localStorage.setItem(FLAG_KEY, JSON.stringify([...next]));
    setFlagged(next);
  };

  const mergeEligible = () => {
    for (const candidate of eligible) {
      const {
        deck: _deck,
        source_pdf_pages: _pages,
        source_scope: _scope,
        glossary_terms: _terms,
        prerequisite_card_ids: _prerequisites,
        provenance_note: _note,
        ...card
      } = candidate;
      saveCardDraft({ ...card, status: "draft", reviewer: null });
      publishCardDraft(card.id);
    }
    createCollection({
      id: COLLECTION_ID,
      title: "Empower A2 · Học bền vững",
      description: `${eligible.length} thẻ đã được Hiệp chọn từ 176 trang sách để học lâu dài bằng FSRS; kỳ thi chỉ quyết định thứ tự ưu tiên.`,
      rootNodeId: "core-en-module-10",
      cardIds: eligible.map((card) => card.id),
    });
    setNotice(
      `Đã gộp ${eligible.length} thẻ đạt yêu cầu; giữ lại ${flagged.size} thẻ cần sửa/bỏ.`,
    );
    onChanged();
  };

  return (
    <details className="coursebook-review surface" open>
      <summary>
        <span>
          <span className="eyebrow">SÁCH ĐANG HỌC · AI DRAFT</span>
          <strong>Empower A2 · 81 thẻ chờ bạn duyệt</strong>
        </span>
        <span>{flagged.size} cần sửa/bỏ</span>
      </summary>
      <div className="coursebook-review-intro">
        <p>
          Ba agent đã xem đủ 176/176 trang. Đây là nhánh học lâu dài nối vào
          English Core và đi theo FSRS; kỳ thi chỉ giúp ưu tiên phần cần học
          sớm. Tích <strong>Đánh dấu cần bỏ/sửa</strong> cho thẻ không đạt; nút
          gộp chỉ lấy các thẻ không bị tích.
        </p>
        <div>
          <label>
            Lọc theo bài
            <select
              value={deck}
              onChange={(event) => setDeck(event.target.value)}
            >
              <option value="all">Tất cả 81 thẻ</option>
              {decks.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary" onClick={mergeEligible}>
            Gộp {eligible.length} thẻ đạt yêu cầu
          </button>
        </div>
      </div>
      <div className="coursebook-review-grid">
        {visibleCards.map((card) => (
          <article
            key={card.id}
            className={`coursebook-review-card ${flagged.has(card.id) ? "is-flagged" : ""}`}
          >
            <div className="coursebook-card-meta">
              <span>PDF {card.source_pdf_pages.join(", ")}</span>
              <span>{card.deck}</span>
            </div>
            <h3>{card.prompt}</h3>
            <details>
              <summary>Xem nội dung thẻ</summary>
              <div>
                <span className="section-label">LỜI GIẢI</span>
                <p>{card.model_answer}</p>
                <span className="section-label">VÌ SAO</span>
                <p>{card.explanation}</p>
                <span className="section-label">THỬ CHUYỂN</span>
                <p>{card.transfer_prompt}</p>
                <span className="section-label">LỜI GIẢI GỢI Ý</span>
                <p>{card.transfer_answer}</p>
              </div>
            </details>
            <label className="coursebook-flag">
              <input
                type="checkbox"
                checked={flagged.has(card.id)}
                onChange={() => toggle(card.id)}
              />
              <span>Đánh dấu cần bỏ/sửa</span>
            </label>
          </article>
        ))}
      </div>
      {notice && (
        <p className="toast" role="status">
          {notice}
        </p>
      )}
    </details>
  );
}
