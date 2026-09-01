import { useMemo, useState } from "react";
import packetJson from "../content/drafts/english-core-beginner-revision-v2.json";
import { createCollection } from "./collectionWorkspace";
import { publishCardDraft, saveCardDraft } from "./localWorkspace";
import type { Card } from "./types";

interface BeginnerCandidate extends Card {
  track: "english";
  revision_of?: string;
  revision_reason: string;
}
interface RevisionCollection {
  id: string;
  node_id: string;
  title: string;
  card_ids: string[];
}
const packet = packetJson as unknown as {
  packet_id: string;
  status: "review";
  provenance: { review_status: string };
  collections: RevisionCollection[];
  cards: BeginnerCandidate[];
};
const FLAG_KEY = "twogether.english-core.beginner-v2.review-flags.v1";

function readFlags(): Set<string> {
  try {
    const value = JSON.parse(window.localStorage.getItem(FLAG_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

export function EnglishCoreRevisionPanel({ onChanged }: { onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(readFlags);
  const [collectionId, setCollectionId] = useState(packet.collections[0]?.id ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const visibleCards = useMemo(() => {
    const collection = packet.collections.find((item) => item.id === collectionId);
    const ids = new Set(collection?.card_ids ?? []);
    return packet.cards.filter((card) => ids.has(card.id));
  }, [collectionId]);
  const eligible = packet.cards.filter((card) => !flagged.has(card.id));

  const toggle = (cardId: string) => {
    const next = new Set(flagged);
    if (next.has(cardId)) next.delete(cardId);
    else next.add(cardId);
    window.localStorage.setItem(FLAG_KEY, JSON.stringify([...next]));
    setFlagged(next);
  };

  const applyEligible = () => {
    for (const candidate of eligible) {
      const {
        track: _track,
        revision_of: _revisionOf,
        revision_reason: _revisionReason,
        ...card
      } = candidate;
      saveCardDraft({ ...card, status: "draft", reviewer: null });
      publishCardDraft(card.id);
    }
    for (const collection of packet.collections) {
      const acceptedIds = collection.card_ids.filter((id) => {
        if (!flagged.has(id)) return true;
        const candidate = packet.cards.find((card) => card.id === id);
        // Rewrites deliberately retain the stable v1 id. When a rewrite is
        // rejected, keep that id in the collection so the published v1 card
        // and its FSRS history remain available. Only rejected bridge cards
        // (which have no previous version) disappear from the collection.
        return Boolean(candidate?.revision_of);
      });
      createCollection({
        id: collection.id,
        title: collection.title,
        description: `${acceptedIds.length} thẻ nguyên lý viết cho người bắt đầu; số lượng theo nội dung, không theo quota.`,
        rootNodeId: collection.node_id,
        cardIds: acceptedIds,
      });
    }
    setNotice(`Đã áp dụng ${eligible.length} thẻ bạn chấp nhận; ${flagged.size} thẻ giữ lại để sửa tiếp. Lịch FSRS theo stable ID vẫn được giữ.`);
    onChanged();
  };

  return <details className="coursebook-review surface" data-testid="beginner-core-review" onToggle={(event) => setExpanded(event.currentTarget.open)}>
    <summary>
      <span><span className="eyebrow">ENGLISH CORE · DUYỆT LẦN 2</span><strong>89 thẻ tự học từ số 0</strong></span>
      <span>{flagged.size} cần sửa</span>
    </summary>
    {expanded && <><div className="coursebook-review-intro">
      <p>
        Bản v1 vẫn được giữ nguyên trong lúc bạn duyệt. Bản này viết lại 80 thẻ và thêm 9 thẻ cầu nối cho Hoàng; câu chuyển giao luôn đi cùng đúng lời giải của nó. Tích <strong>Đánh dấu cần sửa</strong> nếu một thẻ chưa đạt.
      </p>
      <div>
        <label>
          Chọn nhánh
          <select value={collectionId} onChange={(event) => setCollectionId(event.target.value)}>
            {packet.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.title} · {collection.card_ids.length} thẻ</option>)}
          </select>
        </label>
        <button className="button button-primary" onClick={applyEligible}>Duyệt và áp dụng {eligible.length} thẻ</button>
      </div>
    </div>
    <div className="coursebook-review-grid">
      {visibleCards.map((card) => <article key={card.id} className={`coursebook-review-card ${flagged.has(card.id) ? "is-flagged" : ""}`} data-testid={`beginner-review-${card.id}`}>
        <div className="coursebook-card-meta"><span>{card.revision_reason === "new_beginner_bridge" ? "THẺ CẦU NỐI MỚI" : "VIẾT LẠI"}</span><span>{card.id}</span></div>
        <h3>{card.prompt}</h3>
        <details>
          <summary>Xem toàn bộ nội dung</summary>
          <div>
            <span className="section-label">LỜI GIẢI CHÍNH</span><p>{card.model_answer}</p>
            <span className="section-label">VÌ SAO</span><p>{card.explanation}</p>
            <span className="section-label">DỄ NHẦM</span><p>{card.misconception}</p>
            <span className="section-label">THỬ CHUYỂN SANG TÌNH HUỐNG MỚI</span><p>{card.transfer_prompt}</p>
            <span className="section-label">MỘT LỜI GIẢI GỢI Ý</span><p>{card.transfer_answer}</p>
          </div>
        </details>
        <label className="coursebook-flag"><input type="checkbox" checked={flagged.has(card.id)} onChange={() => toggle(card.id)} /><span>Đánh dấu cần sửa</span></label>
      </article>)}
    </div>
    {notice && <p className="toast" role="status">{notice}</p>}</>}
  </details>;
}
