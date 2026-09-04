import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GlossaryText } from "./GlossaryHelp";
import { glossaryIdForLabel } from "./glossary";

describe("inline glossary boundaries", () => {
  it("does not turn parts of longer words into glossary links", () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderToStaticMarkup(
      <GlossaryText text="in within inside" termIds={[glossaryIdForLabel("in")!]} />,
    );
    expect(wrapper.textContent).toBe("in within inside");
    expect([...wrapper.querySelectorAll("button")].map((button) => button.textContent)).toEqual(["in"]);
  });

  it("prefers the whole precise label over its shorter overlapping labels", () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderToStaticMarkup(<GlossaryText text="a non-finite verb; a finite verb" />);
    expect([...wrapper.querySelectorAll("button")].map((button) => button.textContent)).toEqual(["non-finite verb", "finite verb"]);
  });
});
