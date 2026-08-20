import { readFile, writeFile } from "node:fs/promises";

const nodes = JSON.parse(await readFile("content/nodes.json", "utf8"));
const cards = JSON.parse(await readFile("content/cards.json", "utf8"));

const text = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const array = (values) => values.length ? `ARRAY[${values.map(text).join(", ")}]::text[]` : "ARRAY[]::text[]";

const nodeRows = nodes.nodes.map((node) => `  (${text(node.id)}, ${text(node.kind)}, ${text(node.title)}, ${text(node.purpose)}, ${text(node.status)}, ${array(node.source_refs)}, ${node.maintainer ? text(node.maintainer) : "null"})`).join(",\n");
const edgeRows = nodes.edges.map((edge) => `  (${text(edge.from)}, ${text(edge.to)}, ${text(edge.type)})`).join(",\n");
const cardRows = cards.cards.map((card) => [
  card.id,
  card.node_id,
  card.card_type,
  card.prompt,
  card.model_answer,
  card.explanation,
  card.misconception,
  card.transfer_prompt,
  card.prerequisite_node_ids,
  card.source_refs,
  "published",
  card.author,
  card.reviewer,
].map((value, index) => Array.isArray(value) ? array(value) : value === null ? "null" : text(value)).join(", ")).map((row) => `  (${row})`).join(",\n");

const sql = `-- Generated from content/nodes.json and content/cards.json. Fixture content only; draft bundles are excluded.\n-- Re-running this file is idempotent.\n\nbegin;\n\ninsert into public.concept_nodes (id, kind, title, purpose, status, source_refs, maintainer) values\n${nodeRows}\non conflict (id) do update set kind = excluded.kind, title = excluded.title, purpose = excluded.purpose, status = excluded.status, source_refs = excluded.source_refs, maintainer = excluded.maintainer, updated_at = now();\n\ninsert into public.concept_edges (from_node_id, to_node_id, edge_type) values\n${edgeRows}\non conflict (from_node_id, to_node_id, edge_type) do nothing;\n\ninsert into public.cards (id, node_id, card_type, prompt, model_answer, explanation, misconception, transfer_prompt, prerequisite_node_ids, source_refs, status, author, reviewer) values\n${cardRows}\non conflict (id) do update set node_id = excluded.node_id, card_type = excluded.card_type, prompt = excluded.prompt, model_answer = excluded.model_answer, explanation = excluded.explanation, misconception = excluded.misconception, transfer_prompt = excluded.transfer_prompt, prerequisite_node_ids = excluded.prerequisite_node_ids, source_refs = excluded.source_refs, status = excluded.status, author = excluded.author, reviewer = excluded.reviewer, updated_at = now();\n\ncommit;\n`;

await writeFile("supabase/seed.sql", sql, "utf8");
console.log(`generated supabase/seed.sql from ${nodes.nodes.length} nodes, ${nodes.edges.length} edges, ${cards.cards.length} published fixture cards`);
