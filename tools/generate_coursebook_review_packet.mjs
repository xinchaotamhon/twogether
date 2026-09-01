import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const reportPaths = [
  "tmp/coursebook-analysis/part-01-pages-001-060.json",
  "tmp/coursebook-analysis/part-02-pages-061-120.json",
  "tmp/coursebook-analysis/part-03-pages-121-176.json",
];
const sourcePdf = "D:/book/English/CourseBook/D_Empower_2nd_A2_Students_Book.pdf";
const reports = await Promise.all(reportPaths.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const sourceHash = await new Promise((resolve, reject) => {
  const hash = createHash("sha256");
  createReadStream(sourcePdf).on("data", (chunk) => hash.update(chunk)).on("end", () => resolve(hash.digest("hex"))).on("error", reject);
});
const curriculum = JSON.parse(await readFile("content/drafts/core-curriculum-drafts-v2.json", "utf8"));
const coreCardNode = new Map(curriculum.cards.filter((card) => card.track === "english").map((card) => [card.id, card.node_id]));

const allCandidates = reports.flatMap((report) => report.candidate_cards);
if (allCandidates.length !== 81 || new Set(allCandidates.map((card) => card.id)).size !== 81) throw new Error("Expected 81 unique coursebook candidates.");
const cards = allCandidates.map((candidate) => {
  const pages = [...new Set(candidate.source_pdf_pages)].sort((a, b) => a - b);
  const anchor = candidate.prerequisite_core_ids.find((id) => coreCardNode.has(id));
  return {
    id: `coursebook-${candidate.id}`,
    node_id: anchor ? coreCardNode.get(anchor) : "core-en-module-10",
    card_type: /tạo|viết|nói|hãy/i.test(candidate.prompt_vi) ? "production" : "application",
    prompt: candidate.prompt_vi,
    model_answer: candidate.model_answer_vi,
    explanation: candidate.explanation_vi,
    misconception: candidate.misconception_vi,
    transfer_prompt: candidate.transfer_prompt_vi,
    transfer_answer: candidate.transfer_answer_vi,
    glossary_terms: candidate.glossary_terms,
    prerequisite_card_ids: candidate.prerequisite_core_ids,
    prerequisite_node_ids: [...new Set(candidate.prerequisite_core_ids.map((id) => coreCardNode.get(id)).filter(Boolean))],
    source_refs: [`empower-a2-students-book:sha256:${sourceHash}:pdf-pages:${pages.join(",")}`, `coursebook-analysis:${candidate.id}`],
    source_pdf_pages: pages,
    source_scope: candidate.source_scope,
    deck: candidate.deck,
    status: "review",
    author: "ai-coursebook-synthesis",
    reviewer: null,
    provenance_note: candidate.provenance_note,
  };
});

const packet = {
  schema_version: 1,
  packet_id: "empower-a2-long-term-learning-review-v1",
  status: "review",
  created_at: new Date().toISOString(),
  source: {
    local_path: sourcePdf,
    sha256: sourceHash,
    pdf_pages: 176,
    copy_restricted: true,
    inspection: "All 176 PDF pages were visually inspected in three ranges; targeted grammar, vocabulary, pronunciation, functional-language and review pages were spot-checked.",
  },
  provenance: {
    created_by: { actor_type: "ai-team", actor_id: "codex-subagents" },
    requested_by: "hiep",
    review_status: "ai_draft_owner_review_required",
    transformation: "Original Vietnamese teaching prompts synthesized from course scope; no long textbook passage or exercise answer copied.",
  },
  review_contract: {
    checkbox_meaning: "flag_for_fix_or_exclusion",
    default_flagged: false,
    merge_rule: "Only unflagged cards are eligible for owner merge.",
  },
  units: reports.flatMap((report) => report.units),
  cards,
};

await writeFile("content/drafts/empower-a2-coursebook-final-review-v1.json", JSON.stringify(packet, null, 2) + "\n", "utf8");
console.log(`generated ${cards.length} review cards; source sha256 ${sourceHash}`);
