import { useEffect, useState } from "react";
import { glossaryTermsFor, type GlossaryTerm } from "./glossary";

export function GlossaryHelp({ termIds }: { termIds?: readonly string[] }) {
  const terms = glossaryTermsFor(termIds);
  const [selected, setSelected] = useState<GlossaryTerm | null>(null);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);

  const close = () => {
    setSelected(null);
    window.setTimeout(() => returnFocus?.focus(), 0);
  };

  useEffect(() => {
    if (!selected) return undefined;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected, returnFocus]);

  if (!terms.length) return null;
  return <div className="glossary-help" aria-label="Thuật ngữ cần hiểu"><span className="section-label">BẤM ĐỂ HIỂU TỪ</span><div className="glossary-chips">{terms.map((term) => <button type="button" className="glossary-chip" key={term.id} aria-haspopup="dialog" onClick={(event) => { setReturnFocus(event.currentTarget); setSelected(term); }}>{term.label}<span aria-hidden="true">?</span></button>)}</div>{selected && <div className="glossary-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className="glossary-dialog" role="dialog" aria-modal="true" aria-labelledby="glossary-title" data-testid="glossary-dialog"><button type="button" className="glossary-close" aria-label="Đóng giải thích thuật ngữ" autoFocus onClick={close}>×</button><span className="eyebrow">THUẬT NGỮ · {selected.meaningVi.toUpperCase()}</span><h2 id="glossary-title">{selected.label}</h2><p>{selected.explanation}</p><div className="glossary-example"><span className="section-label">VÍ DỤ</span><p>{selected.example}</p></div><div className="glossary-why"><span className="section-label">VÌ SAO CẦN BIẾT</span><p>{selected.whyItMatters}</p></div></section></div>}</div>;
}
