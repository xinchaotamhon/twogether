import type { CardCollection } from "./featureTypes";
import { readWorkspace, writeWorkspace } from "./localWorkspace";

export function createCollection(input: { title: string; description: string; rootNodeId: string | null; cardIds: string[] }): CardCollection {
  const workspace = readWorkspace();
  const collection: CardCollection = { id: `local-collection-${Date.now()}`, title: input.title.trim() || "Bộ thẻ mới", description: input.description.trim() || "Một lối học mới bám vào cây kiến thức chung.", rootNodeId: input.rootNodeId, status: "published", cardIds: [...new Set(input.cardIds)] };
  workspace.collections.push(collection);
  writeWorkspace(workspace);
  return collection;
}
