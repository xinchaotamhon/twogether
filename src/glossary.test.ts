import { describe, expect, it } from "vitest";
import { glossaryTermsFor } from "./glossary";

describe("English Core glossary", () => {
  it("explains finite and non-finite verbs in Vietnamese", () => {
    const terms = glossaryTermsFor(["finite-verb", "non-finite-verb"]);

    expect(terms).toHaveLength(2);
    expect(terms[0].meaningVi.toLowerCase()).toContain("hữu hạn");
    expect(terms[1].meaningVi.toLowerCase()).toContain("không hữu hạn");
    expect(terms.every((term) => term.explanation && term.example && term.whyItMatters)).toBe(true);
  });
});
