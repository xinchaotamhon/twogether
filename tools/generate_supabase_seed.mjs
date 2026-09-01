import { readFile, writeFile } from "node:fs/promises";

const packet = JSON.parse(await readFile("content/drafts/core-curriculum-drafts-v2.json", "utf8"));
const approval = JSON.parse(await readFile("content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json", "utf8"));
const transferPacket = JSON.parse(await readFile("content/drafts/english-core-transfer-answers-v1.json", "utf8"));
const supportPacket = JSON.parse(await readFile("content/drafts/english-core-support-v1.json", "utf8"));

const approvedIds = new Set(approval.card_ids);
const cards = packet.cards.filter((card) => card.track === "english" && approvedIds.has(card.id));
if (approval.decision !== "approved_for_published_study" || cards.length !== 80) throw new Error("Owner approval must cover exactly 80 English Core cards.");
const nodeIds = new Set(cards.map((card) => card.node_id));
const nodes = packet.nodes.filter((node) => nodeIds.has(node.id));
const edges = packet.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
const transferById = new Map(transferPacket.answers.map((item) => [item.card_id, item.transfer_answer]));
const glossaryById = new Map(supportPacket.support_records.map((item) => [item.card_id, item.glossary_refs]));
if (transferById.size !== 80 || cards.some((card) => !transferById.get(card.id))) throw new Error("Transfer-answer packet must cover all 80 cards.");

const text = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const array = (values = []) => values.length ? `ARRAY[${values.map(text).join(", ")}]::text[]` : "ARRAY[]::text[]";
const nodeRows = nodes.map((node) => `  (${text(node.id)}, ${text(node.kind)}, ${text(node.title)}, ${text(node.purpose)}, 'published', ${array(node.source_refs)}, ${node.maintainer ? text(node.maintainer) : "null"})`).join(",\n");
const edgeRows = edges.map((edge) => `  (${text(edge.from)}, ${text(edge.to)}, ${text(edge.type)})`).join(",\n");
const cardRows = cards.map((card) => `  (${[
  text(card.id), text(card.node_id), text(card.card_type), text(card.prompt), text(card.model_answer),
  text(card.explanation), text(card.misconception), text(card.transfer_prompt), text(transferById.get(card.id)),
  array(glossaryById.get(card.id) ?? []), array(card.prerequisite_node_ids), array([...card.source_refs, "english-core-transfer-answers-v1"]),
  "'published'", text(card.author), "'hiep'",
].join(", ")})`).join(",\n");

const sql = `-- Generated from the owner-approved English Generative Core v1 manifest.
-- Includes 80 approved main cards plus owner-requested visible transfer examples and glossary refs.
-- Re-running this file is idempotent. Historical 12-card fixtures are not seeded.

begin;

insert into public.concept_nodes (id, kind, title, purpose, status, source_refs, maintainer) values
${nodeRows}
on conflict (id) do update set kind = excluded.kind, title = excluded.title, purpose = excluded.purpose, status = excluded.status, source_refs = excluded.source_refs, maintainer = excluded.maintainer, updated_at = now();

insert into public.concept_edges (from_node_id, to_node_id, edge_type) values
${edgeRows}
on conflict (from_node_id, to_node_id, edge_type) do nothing;

insert into public.cards (id, node_id, card_type, prompt, model_answer, explanation, misconception, transfer_prompt, transfer_answer, glossary_refs, prerequisite_node_ids, source_refs, status, author, reviewer) values
${cardRows}
on conflict (id) do update set node_id = excluded.node_id, card_type = excluded.card_type, prompt = excluded.prompt, model_answer = excluded.model_answer, explanation = excluded.explanation, misconception = excluded.misconception, transfer_prompt = excluded.transfer_prompt, transfer_answer = excluded.transfer_answer, glossary_refs = excluded.glossary_refs, prerequisite_node_ids = excluded.prerequisite_node_ids, source_refs = excluded.source_refs, status = excluded.status, author = excluded.author, reviewer = excluded.reviewer, updated_at = now();

commit;
`;

await writeFile("supabase/seed.sql", sql, "utf8");
console.log(`generated supabase/seed.sql from ${nodes.length} nodes, ${edges.length} edges, ${cards.length} owner-approved cards`);
