import { GlossaryHelp } from "./GlossaryHelp";
import type { RepairItem } from "./studyPolicy";
import type { Card, ReviewRating } from "./types";

export interface StudyViewProps {
  dueCount: number;
  currentCard: Card | null;
  cardNodeTitle: string;
  repairQueue: RepairItem[];
  completedReviews: number;
  revealed: boolean;
  attemptText: string;
  setAttemptText: (value: string) => void;
  handleAttempt: () => void;
  handleGrade: (rating: ReviewRating) => void;
  restartSession: () => void;
  message: string | null;
  lastInterval: string | null;
  savingReview: boolean;
}

export function StudyView({
  dueCount,
  currentCard,
  cardNodeTitle,
  repairQueue,
  completedReviews,
  revealed,
  attemptText,
  setAttemptText,
  handleAttempt,
  handleGrade,
  restartSession,
  message,
  lastInterval,
  savingReview,
}: StudyViewProps) {
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
              <GlossaryHelp termIds={currentCard.glossary_refs} />
              <textarea
                value={attemptText}
                onChange={(event) => setAttemptText(event.target.value)}
                placeholder="Viết thứ gì đó vào đây"
                aria-label="Câu trả lời riêng, không được lưu"
                rows={3}
              />
              <div className="attempt-actions">
                <span className="attempt-reminder">
                  Tự nghĩ trước khi xem lời giải chính.
                </span>
                <button className="button button-dark" onClick={handleAttempt}>
                  Đã thử — xem đáp án <span aria-hidden="true">↗</span>
                </button>
              </div>
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
              <GlossaryHelp termIds={currentCard.glossary_refs} />
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
                {currentCard.transfer_answer && (
                  <details className="transfer-answer">
                    <summary>Xem lời giải gợi ý</summary>
                    <p data-testid="transfer-answer">
                      {currentCard.transfer_answer}
                    </p>
                    <small>
                      Một cách làm mẫu; cách diễn đạt khác vẫn có thể đúng.
                    </small>
                  </details>
                )}
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
