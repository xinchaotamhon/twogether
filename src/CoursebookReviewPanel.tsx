import { useState } from "react";
import packetJson from "../content/drafts/empower-a2-coursebook-final-review-v1.json";
import { EMPOWER_VOCABULARY_CARD_IDS } from "./empowerCurriculum";
import { publishCardDraft, saveCardDraft } from "./localWorkspace";
import type { Card } from "./types";

interface CoursebookCandidate extends Card {
  glossary_terms: string[];
  source_pdf_pages: number[];
  deck: string;
  source_scope: string;
  prerequisite_card_ids: string[];
  provenance_note: string;
}

const sourceCards = (packetJson as unknown as { cards: CoursebookCandidate[] }).cards.filter(
  (card) => EMPOWER_VOCABULARY_CARD_IDS.has(card.id),
);

export function CoursebookReviewPanel({ cards, onChanged }: { cards: Card[]; onChanged: () => void }) {
  const [notice, setNotice] = useState<string | null>(null);
  const publishedIds = new Set(cards.filter((card) => card.status === "published").map((card) => card.id));
  const approvedCount = sourceCards.filter((card) => publishedIds.has(card.id)).length;

  const approve = (candidate: CoursebookCandidate) => {
    const runtimeCard = cards.find((card) => card.id === candidate.id);
    if (!runtimeCard) return;
    saveCardDraft({ ...runtimeCard, status: "draft", reviewer: null });
    publishCardDraft(runtimeCard.id);
    setNotice(`Đã duyệt “${candidate.glossary_terms.join(", ")}” và đưa thẻ vào cây.`);
    onChanged();
  };

  return (
    <details className="coursebook-review surface">
      <summary>
        <span>
          <span className="eyebrow">CHỈ DUYỆT TỪ MỚI</span>
          <strong>Empower A2 · 7 thẻ Vocabulary Focus</strong>
        </span>
        <span>{approvedCount}/7 đã duyệt</span>
      </summary>
      <div className="coursebook-review-intro">
        <p>
          74 thẻ kiến thức khác đã vào cây. Bảy thẻ dưới đây được giữ riêng để
          bạn kiểm tra từ/cụm từ mới; duyệt thẻ nào thì thẻ đó xuất hiện trong
          bộ <strong>Empower · Từ mới</strong> trên cây.
        </p>
      </div>
      <div className="coursebook-review-grid">
        {sourceCards.map((candidate) => {
          const approved = publishedIds.has(candidate.id);
          return (
            <article className={`coursebook-review-card ${approved ? "is-approved" : ""}`} key={candidate.id}>
              <div className="coursebook-card-meta">
                <span>PDF {candidate.source_pdf_pages.join(", ")}</span>
                <span>{approved ? "đã duyệt" : "chờ duyệt"}</span>
              </div>
              <div className="vocabulary-term-list" aria-label="Từ mới trong thẻ">
                {candidate.glossary_terms.map((term) => <span key={term}>{term}</span>)}
              </div>
              <h3>{candidate.prompt}</h3>
              <details>
                <summary>Xem nội dung trước khi duyệt</summary>
                <div>
                  <span className="section-label">LỜI GIẢI</span>
                  <p>{candidate.model_answer}</p>
                  <span className="section-label">VÌ SAO</span>
                  <p>{candidate.explanation}</p>
                  <span className="section-label">TÌNH HUỐNG MỚI</span>
                  <p>{candidate.transfer_prompt}</p>
                  <span className="section-label">MỘT CÁCH LÀM</span>
                  <p>{candidate.transfer_answer}</p>
                </div>
              </details>
              <button type="button" className="button button-primary" disabled={approved} onClick={() => approve(candidate)}>
                {approved ? "Đã có trong cây" : "Duyệt và đưa vào cây"}
              </button>
            </article>
          );
        })}
      </div>
      {notice && <p className="inline-notice" role="status">{notice}</p>}
    </details>
  );
}
