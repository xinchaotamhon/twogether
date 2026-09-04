import { describe, expect, it } from "vitest";
import { glossaryTermsFor, glossaryTermsInText } from "./glossary";

describe("English Core glossary", () => {
  it("explains finite and non-finite verbs in Vietnamese", () => {
    const terms = glossaryTermsFor(["finite-verb", "non-finite-verb"]);

    expect(terms).toHaveLength(2);
    expect(terms[0].meaningVi.toLowerCase()).toContain("hữu hạn");
    expect(terms[1].meaningVi.toLowerCase()).toContain("không hữu hạn");
    expect(terms.every((term) => term.explanation && term.example && term.whyItMatters)).toBe(true);
  });

  it("discovers precise terms in every content field even when an old ref is missing", () => {
    expect(
      glossaryTermsInText("The subject carries tense; walking is a non-finite verb.").map(
        (term) => term.id,
      ),
    ).toEqual(expect.arrayContaining(["non-finite-verb", "subject", "tense"]));
    expect(glossaryTermsInText("A subjective opinion").map((term) => term.id)).not.toContain("subject");
  });
});
