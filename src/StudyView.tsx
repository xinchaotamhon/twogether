import { useEffect, useRef, useState } from "react";
import { GlossaryText } from "./GlossaryHelp";
import type { Card, ReviewRating } from "./types";

export interface StudyViewProps {
  dueCount: number;
  currentIndex: number;
  currentCard: Card | null;
  cardNodeTitle: string;
  forgottenCount: number;
  completedReviews: number;
  revealed: boolean;
  attemptText: string;
  setAttemptText: (value: string) => void;
  handleAttempt: () => void;
  onFlipToQuestion: () => void;
  handleGrade: (rating: ReviewRating) => void;
  restartSession: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onJumpTo: (index: number) => void;
  message: string | null;
  savingReview: boolean;
}

export function StudyView({
  dueCount,
  currentIndex,
  currentCard,
  cardNodeTitle,
  forgottenCount,
  completedReviews,
  revealed,
  attemptText,
  setAttemptText,
  handleAttempt,
  onFlipToQuestion,
  handleGrade,
  restartSession,
  onPrevious,
  onNext,
  onShuffle,
  onJumpTo,
  message,
  savingReview,
}: StudyViewProps) {
  const [backPage, setBackPage] = useState<"answer" | "transfer">("answer");
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => setBackPage("answer"), [currentCard?.id, revealed]);

  if (!currentCard)
    return (
      <section className="session-finished" aria-live="polite">
        <div className="empty-symbol">✦</div>
        <span className="eyebrow">ĐÃ ĐI QUA CẢ BỘ</span>
        <h1>Xong một vòng.</h1>
        <p>{forgottenCount ? `${forgottenCount} câu Quên đang được giữ tạm trong phiên này.` : "Không còn câu nào trong danh sách Quên của phiên này."}</p>
        <button className="button button-primary" onClick={restartSession}>
          {forgottenCount ? `Ôn lại ${forgottenCount} câu Quên` : "Học lại bộ này"}
        </button>
      </section>
    );

  const progress = Math.min(100, Math.round((completedReviews / Math.max(1, dueCount)) * 100));
  const glossaryRefs = currentCard.glossary_refs;
  const changeCard = (direction: "previous" | "next") => {
    if (direction === "previous") onPrevious();
    else onNext();
  };

  return (
    <section className="session-study" data-testid="session-study">
      <div className="session-navigation" aria-label="Điều hướng trong bộ thẻ">
        <button type="button" aria-label="Thẻ trước" onClick={onPrevious}>←</button>
        <label>
          <span>{currentIndex + 1}/{dueCount}</span>
          <input
            data-testid="card-jump-range"
            type="range"
            min="1"
            max={Math.max(1, dueCount)}
            value={Math.min(dueCount, currentIndex + 1)}
            onChange={(event) => onJumpTo(Number(event.target.value) - 1)}
            aria-label="Chuyển đến thẻ bất kỳ"
          />
        </label>
        <button type="button" className="shuffle-button" onClick={onShuffle}>Xáo ↝</button>
        <button type="button" aria-label="Thẻ sau" onClick={onNext}>→</button>
      </div>

      <div
        className="flip-card-stage"
        onPointerDown={(event) => { pointerStartX.current = event.clientX; }}
        onPointerUp={(event) => {
          if (pointerStartX.current === null) return;
          const distance = event.clientX - pointerStartX.current;
          pointerStartX.current = null;
          if (Math.abs(distance) < 60) return;
          changeCard(distance > 0 ? "previous" : "next");
        }}
      >
        <article
          data-testid="study-card"
          className={`study-flip-card ${revealed ? "is-revealed" : ""}`}
          aria-labelledby="card-prompt"
        >
          <section className="study-face study-face-front" aria-hidden={revealed} inert={revealed}>
            <div className="card-meta">
              <span className="card-node">{cardNodeTitle}</span>
              <span>MẶT CÂU HỎI</span>
            </div>
            <div className="flip-question">
              <span className="question-mark" aria-hidden="true">?</span>
              <h2 id="card-prompt"><GlossaryText text={currentCard.prompt} termIds={glossaryRefs} /></h2>
            </div>
            <div className="flip-attempt">
              <textarea
                value={attemptText}
                onChange={(event) => setAttemptText(event.target.value)}
                placeholder="Viết thứ gì đó vào đây"
                aria-label="Câu trả lời riêng, không được lưu"
                rows={2}
              />
              <button className="button button-dark" onClick={handleAttempt}>Đã thử — lật thẻ <span aria-hidden="true">↻</span></button>
            </div>
          </section>

          <section data-testid={revealed ? "reveal-panel" : undefined} className="study-face study-face-back" aria-hidden={!revealed} inert={!revealed}>
            <div className="card-meta">
              <span className="card-node">{cardNodeTitle}</span>
              <button type="button" className="flip-back-button" onClick={onFlipToQuestion}>↻ Xem câu hỏi</button>
            </div>
            <div className="back-page-tabs" role="tablist" aria-label="Nội dung mặt đáp án">
              <button type="button" role="tab" aria-selected={backPage === "answer"} onClick={() => setBackPage("answer")}>Đáp án & vì sao</button>
              <button type="button" role="tab" aria-selected={backPage === "transfer"} onClick={() => setBackPage("transfer")}>Tình huống mới</button>
            </div>
            {backPage === "answer" ? (
              <div className="back-page" role="tabpanel">
                <div className="answer-block">
                  <span className="section-label">LỜI GIẢI NGẮN</span>
                  <p className="model-answer"><GlossaryText text={currentCard.model_answer} termIds={glossaryRefs} /></p>
                </div>
                <div className="why-block">
                  <span className="section-label">VÌ SAO</span>
                  <p><GlossaryText text={currentCard.explanation} termIds={glossaryRefs} /></p>
                </div>
              </div>
            ) : (
              <div className="back-page transfer-page" role="tabpanel">
                <div>
                  <span className="section-label">THỬ CHUYỂN SANG TÌNH HUỐNG MỚI</span>
                  <p className="transfer-question"><GlossaryText text={currentCard.transfer_prompt} termIds={glossaryRefs} /></p>
                </div>
                {currentCard.transfer_answer && (
                  <div className="transfer-solution">
                    <span className="section-label">MỘT CÁCH LÀM</span>
                    <p data-testid="transfer-answer"><GlossaryText text={currentCard.transfer_answer} termIds={glossaryRefs} /></p>
                  </div>
                )}
              </div>
            )}
            <div className="grade-actions">
              <button className="button button-forgot" disabled={savingReview} onClick={() => handleGrade("Again")}>
                <span className="grade-icon">↺</span><span><strong>Quên</strong><small>Lưu tạm trong phiên</small></span>
              </button>
              <button className="button button-remember" disabled={savingReview} onClick={() => handleGrade("Good")}>
                <span className="grade-icon">✦</span><span><strong>Nhớ</strong><small>Gỡ khỏi danh sách sai</small></span>
              </button>
            </div>
          </section>
        </article>
      </div>

      <div className="session-status" aria-live="polite">
        <span>{progress}% đã tự kiểm tra</span>
        <span>↺ {forgottenCount} câu Quên</span>
        {message && <strong>{message}</strong>}
      </div>
    </section>
  );
}
