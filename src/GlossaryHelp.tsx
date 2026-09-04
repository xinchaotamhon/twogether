import { useEffect, useMemo, useState, type ReactNode } from "react";
import { glossaryTermsFor, glossaryTermsInText, type GlossaryTerm } from "./glossary";

function GlossaryDialog({ term, onClose }: { term: GlossaryTerm; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="glossary-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="glossary-dialog" role="dialog" aria-modal="true" aria-labelledby="glossary-title" data-testid="glossary-dialog">
        <button type="button" className="glossary-close" aria-label="Đóng giải thích thuật ngữ" autoFocus onClick={onClose}>×</button>
        <span className="eyebrow">THUẬT NGỮ · {term.meaningVi.toUpperCase()}</span>
        <h2 id="glossary-title">{term.label}</h2>
        <p>{term.explanation}</p>
        <div className="glossary-example"><span className="section-label">VÍ DỤ</span><p>{term.example}</p></div>
        <div className="glossary-why"><span className="section-label">VÌ SAO CẦN BIẾT</span><p>{term.whyItMatters}</p></div>
      </section>
    </div>
  );
}

function useGlossaryDialog() {
  const [selected, setSelected] = useState<GlossaryTerm | null>(null);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);
  const open = (term: GlossaryTerm, target: HTMLElement) => {
    setReturnFocus(target);
    setSelected(term);
  };
  const close = () => {
    setSelected(null);
    window.setTimeout(() => returnFocus?.focus(), 0);
  };
  return { selected, open, close };
}

export function GlossaryHelp({ termIds }: { termIds?: readonly string[] }) {
  const terms = glossaryTermsFor(termIds);
  const dialog = useGlossaryDialog();
  if (!terms.length) return null;
  return (
    <div className="glossary-help" aria-label="Thuật ngữ cần hiểu">
      <span className="section-label">BẤM VÀO TỪ GẠCH CHÂN ĐỂ HIỂU</span>
      <div className="glossary-chips">
        {terms.map((term) => (
          <button type="button" className="glossary-chip" key={term.id} aria-haspopup="dialog" onClick={(event) => dialog.open(term, event.currentTarget)}>
            {term.label}<span aria-hidden="true">?</span>
          </button>
        ))}
      </div>
      {dialog.selected && <GlossaryDialog term={dialog.selected} onClose={dialog.close} />}
    </div>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Turns known technical terms into in-place help without changing the source wording. */
export function GlossaryText({ text, termIds, className }: { text: string; termIds?: readonly string[]; className?: string }) {
  const terms = useMemo(() => {
    const all = [...glossaryTermsFor(termIds), ...glossaryTermsInText(text)];
    return [...new Map(all.map((term) => [term.id, term])).values()];
  }, [termIds, text]);
  const dialog = useGlossaryDialog();
  const termByLabel = useMemo(
    () => new Map(terms.flatMap((term) => [
      [term.label.toLocaleLowerCase("en"), term] as const,
      [term.meaningVi.toLocaleLowerCase("vi"), term] as const,
    ])),
    [terms],
  );
  const parts = useMemo(() => {
    if (!terms.length) return [text];
    const labels = terms.flatMap((term) => [term.label, term.meaningVi]).sort((a, b) => b.length - a.length);
    return text.split(new RegExp(`(?<![\\p{L}\\p{N}-])(${labels.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}-])`, "giu"));
  }, [terms, text]);

  const rendered: ReactNode[] = parts.map((part, index) => {
    const term = termByLabel.get(part.toLocaleLowerCase("en"));
    return term ? (
      <button
        type="button"
        className="glossary-inline"
        aria-label={`Giải thích ${part}`}
        aria-haspopup="dialog"
        key={`${term.id}-${index}`}
        onClick={(event) => dialog.open(term, event.currentTarget)}
      >
        {part}
      </button>
    ) : <span key={`text-${index}`}>{part}</span>;
  });

  return (
    <>
      <span className={["glossary-text", className].filter(Boolean).join(" ")}>{rendered}</span>
      {dialog.selected && <GlossaryDialog term={dialog.selected} onClose={dialog.close} />}
    </>
  );
}
