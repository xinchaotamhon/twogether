import { readFile, writeFile } from "node:fs/promises";

const graphPacket = JSON.parse(await readFile("content/drafts/core-curriculum-drafts-v2.json", "utf8"));
const packet = JSON.parse(await readFile("content/drafts/english-core-beginner-revision-v2.json", "utf8"));
const approval = JSON.parse(await readFile("content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json", "utf8"));

const approvedIds = new Set(approval.card_ids);
const cards = packet.cards.filter((card) => card.track === "english" && approvedIds.has(card.id));
if (approval.decision !== "approved_for_published_study" || cards.length !== 89) throw new Error("Owner approval must cover exactly 89 English Core v2 cards.");
const nodeIds = new Set(cards.map((card) => card.node_id));
const nodes = graphPacket.nodes.filter((node) => nodeIds.has(node.id));
const edges = graphPacket.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
if (cards.some((card) => !card.transfer_answer)) throw new Error("Every approved v2 card must include its own transfer answer.");

const text = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const array = (values = []) => values.length ? `ARRAY[${values.map(text).join(", ")}]::text[]` : "ARRAY[]::text[]";
const nodeRows = nodes.map((node) => `  (${text(node.id)}, ${text(node.kind)}, ${text(node.title)}, ${text(node.purpose)}, 'published', ${array(node.source_refs)}, ${node.maintainer ? text(node.maintainer) : "null"})`).join(",\n");
const edgeRows = edges.map((edge) => `  (${text(edge.from)}, ${text(edge.to)}, ${text(edge.type)})`).join(",\n");
const cardRows = cards.map((card) => `  (${[
  text(card.id), text(card.node_id), text(card.card_type), text(card.prompt), text(card.model_answer),
  text(card.explanation), text(card.misconception), text(card.transfer_prompt), text(card.transfer_answer),
  array(card.glossary_refs ?? []), array(card.prerequisite_node_ids), array(card.source_refs),
  "'published'", text(card.author), "'hiep'",
].join(", ")})`).join(",\n");

const sql = `-- Generated from the owner-approved English Generative Core beginner v2 manifest.
-- Includes 89 approved cards with beginner-first explanations, matching transfer answers and glossary refs.
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
