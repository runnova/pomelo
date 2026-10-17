import { createSignal } from "solid-js";
import { getCurrentCard } from "../State";

export const drag = { state: null, rafId: null };
export const [dropIndicator, setDropIndicator] = createSignal(null);
export const [draggedNodeId, setDraggedNodeId] = createSignal(null);

const sameTarget = (a, b) =>
  a === b ||
  (!!a && !!b &&
    a.column === b.column && a.targetId === b.targetId && a.before === b.before);

export function computeDropTarget(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  const colEl = target?.closest(".col");
  const card = getCurrentCard();
  if (!colEl || !card) return null;

  const column = colEl.classList.contains("media") ? "media" : "text";
  const columnNodes = card.nodes.filter((n) => n.column === column);
  const nodeEl = target.closest(".node");

  if (!nodeEl) {
    return { column, index: columnNodes.length, targetId: null, before: false };
  }

  const targetId = nodeEl.dataset.id;
  const found = columnNodes.findIndex((n) => n.id === targetId);
  if (found === -1) return null;

  const rect = nodeEl.getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  const buffer = rect.height * 0.15;

  let before;
  if (clientY < mid - buffer) before = true;
  else if (clientY > mid + buffer) before = false;
  else {
    const cur = dropIndicator();
    before = cur?.targetId === targetId ? cur.before : clientY < mid;
  }

  return { column, index: before ? found : found + 1, targetId, before };
}

export function scheduleDropIndicator(x, y) {
  if (drag.rafId) cancelAnimationFrame(drag.rafId);
  drag.rafId = requestAnimationFrame(() => {
    const next = computeDropTarget(x, y);
    if (!sameTarget(dropIndicator(), next)) setDropIndicator(next);
    drag.rafId = null;
  });
}

export function cancelScheduledIndicator() {
  if (drag.rafId) cancelAnimationFrame(drag.rafId);
  drag.rafId = null;
}

export function clearDropIndicator() {
  cancelScheduledIndicator();
  setDropIndicator(null);
}
