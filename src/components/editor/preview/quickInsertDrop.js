import { getCurrentCard, addNode, buildNodeFromTemplateDef } from "../State";
import { quickInsertTemplates } from "../substate/quickInsertTemplates";
import { computeDropTarget, scheduleDropIndicator, clearDropIndicator } from "./dragStore";

const MIME = "application/x-quick-insert";
const columnOf = (el) => (el.classList.contains("media") ? "media" : "text");

export function handleColumnDragOver(e) {
  if (![...e.dataTransfer.types].includes(MIME)) return;
  e.preventDefault();
  scheduleDropIndicator(e.clientX, e.clientY);
}

export function handleColumnDrop(e) {
  const key = e.dataTransfer.getData(MIME);
  const card = getCurrentCard();
  const def = key && quickInsertTemplates[key];
  if (!def || !card) { clearDropIndicator(); return; }
  e.preventDefault();

  const target =
    computeDropTarget(e.clientX, e.clientY) ??
    { column: columnOf(e.currentTarget), index: 0 };

  clearDropIndicator();
  const node = buildNodeFromTemplateDef(def);
  node.column = target.column;
  addNode(card.id, node, target.index);
}
