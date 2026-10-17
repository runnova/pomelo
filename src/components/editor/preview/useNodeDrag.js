import { createSignal, onCleanup } from "solid-js";
import { focusNode, moveNode } from "../State";
import {
  drag, computeDropTarget, scheduleDropIndicator, cancelScheduledIndicator,
  clearDropIndicator, setDraggedNodeId,
} from "./dragStore";

const TAP_MAX_DURATION = 200;
const MOVE_THRESHOLD = 8;

export function useNodeDrag({ node, cardId, getEl }) {
  const [isDragging, setIsDragging] = createSignal(false);
  let startX = 0, startY = 0, startTime = 0, pointerId = null;

  const beginDrag = () => {
    setIsDragging(true);
    setDraggedNodeId(node.id);
    drag.state = { nodeId: node.id, sourceCardId: cardId, sourceColumn: node.column };
    focusNode(node.id);
    document.body.style.userSelect = "none";
    const el = getEl();
    if (el) { el.style.opacity = "0.4"; el.style.pointerEvents = "none"; }
  };

  const endDrag = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
    drag.state = null;
    clearDropIndicator();
    document.body.style.userSelect = "";
    const el = getEl();
    if (el) { el.style.opacity = ""; el.style.pointerEvents = ""; }
  };

  const isOwnPointer = (e) => pointerId !== null && e.pointerId === pointerId;

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = getEl();
    if (node.type === "text" && e.target === document.activeElement && el.contains(e.target)) return;

    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    startTime = performance.now();
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isOwnPointer(e)) return;
    if (!isDragging() && Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_THRESHOLD) {
      beginDrag();
    }
    if (isDragging()) scheduleDropIndicator(e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    if (!isOwnPointer(e)) return;
    getEl().releasePointerCapture?.(e.pointerId);

    if (isDragging()) {
      const t = computeDropTarget(e.clientX, e.clientY);
      if (t && drag.state) {
        moveNode(drag.state.sourceCardId, drag.state.nodeId, t.column, t.index);
      }
      endDrag();
    } else if (performance.now() - startTime < TAP_MAX_DURATION) {
      focusNode(node.id);
    }
    pointerId = null;
  };

  const onPointerCancel = () => {
    if (isDragging()) endDrag();
    pointerId = null;
  };

  onCleanup(() => {
    if (isDragging()) endDrag();
    cancelScheduledIndicator();
  });

  return {
    isDragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
