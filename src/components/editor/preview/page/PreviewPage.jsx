import {
  For,
  Show,
  onMount,
  onCleanup,
  createMemo,
  createEffect,
  createSignal,
} from "solid-js";
import {
  getCurrentCard,
  focusNode,
  blurNode,
  editor,
  moveNode,
  updateNodeById,
  addNode,
  buildNodeFromTemplateDef,
} from "../../State";
import { quickInsertTemplates } from "../../substate/quickInsertTemplates";

const TAP_MAX_DURATION = 200;
const MOVE_THRESHOLD = 8;

let dragState = null;
let rafId = null;
const [dropIndicator, setDropIndicator] = createSignal(null);
const [draggedNodeId, setDraggedNodeId] = createSignal(null);

function sameTarget(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.column === b.column && a.targetId === b.targetId && a.before === b.before
  );
}

function scheduleDropIndicator(x, y) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const next = computeDropTarget(x, y);
    const prev = dropIndicator();
    if (!sameTarget(prev, next)) setDropIndicator(next);
    rafId = null;
  });
}

function RenderText(props) {
  let el;

  createEffect(() => {
    if (
      document.activeElement !== el &&
      el.textContent !== props.node.content
    ) {
      el.textContent = props.node.content;
    }
  });

  createEffect(() => {
    if (editor.focus !== props.node.id && document.activeElement === el) {
      el.blur();
    }
  });

  return (
    <div
      ref={el}
      class="text-node"
      contentEditable={editor.focus === props.node.id}
      spellcheck={false}
      onInput={(e) => {
        updateNodeById(props.node.id, (node) => ({
          ...node,
          content: e.currentTarget.textContent,
        }));
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.blur();
      }}
    />
  );
}

// Track mounted media elements keyed by the node id they belong to.
// This lets any effect definitively pause everything that isn't part
// of the currently active card, instead of relying on autoplay timing
// or DOM lookups via closest(".node") (which can race with unmount).
const previewMedia = new Map();

function stopMediaElement(media) {
  try {
    media.pause();
  } catch {}
  media.removeAttribute("src");
  media.load();
}

function RenderMedia(props) {
  const { node } = props;
  let media;

  onMount(() => {
    if (!media) return;

    previewMedia.set(node.id, { el: media, cardId: props.cardId });

    // Don't rely on the native `autoplay` attribute: it fires as soon as
    // the element is attached, which can race ahead of the page-change
    // cleanup effect and stack multiple tracks. Gate playback on the
    // node's card actually being the current one, and drive it manually.
    if (node.autoplay && getCurrentCard()?.id === props.cardId) {
      media.play().catch(() => {});
    }
  });

  onCleanup(() => {
    if (!media) return;

    previewMedia.delete(node.id);
    stopMediaElement(media);
    media = null;
  });

  switch (node.mediaType) {
    case "image":
      return (
        <img
          src={node.src}
          alt={node.caption}
          draggable={false}
          style={{ "object-fit": node.fit }}
        />
      );

    case "video":
      return (
        <video
          ref={media}
          src={node.src}
          controls={node.controls}
          loop={node.loop}
          muted={node.muted}
          draggable={false}
          style={{ "object-fit": node.fit }}
        />
      );

    case "audio":
      return (
        <audio
          ref={media}
          src={node.src}
          controls={node.controls}
          loop={node.loop}
          muted={node.muted}
          draggable={false}
          style={{ "object-fit": node.fit }}
        />
      );

    default:
      return null;
  }
}

function computeDropTarget(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  if (!target) return null;

  const colEl = target.closest(".col");
  if (!colEl) return null;

  const column = colEl.classList.contains("media") ? "media" : "text";
  const card = getCurrentCard();
  if (!card) return null;

  const columnNodes = card.nodes.filter((n) => n.column === column);
  const nodeEl = target.closest(".node");

  if (nodeEl) {
    const targetId = nodeEl.dataset.id;
    const foundIndex = columnNodes.findIndex((n) => n.id === targetId);
    if (foundIndex === -1) return null;

    const rect = nodeEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const buffer = rect.height * 0.15;

    let before;
    if (clientY < midpoint - buffer) {
      before = true;
    } else if (clientY > midpoint + buffer) {
      before = false;
    } else {
      const current = dropIndicator();
      before =
        current?.targetId === targetId ? current.before : clientY < midpoint;
    }

    return {
      column,
      index: before ? foundIndex : foundIndex + 1,
      targetId,
      before,
    };
  }

  return {
    column,
    index: columnNodes.length,
    targetId: null,
    before: false,
  };
}

const handleColumnDragOver = (e) => {
  if (![...e.dataTransfer.types].includes("application/x-quick-insert")) return;
  e.preventDefault();
  scheduleDropIndicator(e.clientX, e.clientY);
};

const handleColumnDrop = (e) => {
  const key = e.dataTransfer.getData("application/x-quick-insert");
  if (!key) return;
  e.preventDefault();

  const card = getCurrentCard();
  if (!card) return;

  const dropTarget = computeDropTarget(e.clientX, e.clientY) ?? {
    column: e.currentTarget.classList.contains("media") ? "media" : "text",
    index: 0,
  };

  const def = quickInsertTemplates[key];
  if (!def) return;

  const node = buildNodeFromTemplateDef(def);
  node.column = dropTarget.column;
  addNode(card.id, node, dropTarget.index);

  setDropIndicator(null);
};

function RenderNode(props) {
  const { node, cardId, index } = props;
  const [isDragging, setIsDragging] = createSignal(false);

  let startX = 0,
    startY = 0,
    startTime = 0;
  let pointerId = null;
  let el;

  const beginDrag = () => {
    setIsDragging(true);
    setDraggedNodeId(node.id);
    dragState = {
      nodeId: node.id,
      sourceCardId: cardId,
      sourceColumn: node.column,
    };
    focusNode(node.id);

    document.body.style.userSelect = "none";
    if (el) {
      el.style.opacity = "0.4";
      el.style.pointerEvents = "none";
    }
  };

  const endDrag = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
    dragState = null;
    setDropIndicator(null);
    document.body.style.userSelect = "";
    if (el) {
      el.style.opacity = "";
      el.style.pointerEvents = "";
    }
  };

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    if (
      node.type === "text" &&
      document.activeElement &&
      el.contains(document.activeElement) &&
      e.target === document.activeElement
    )
      return;

    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    startTime = performance.now();

    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isDragging() && Math.hypot(dx, dy) > MOVE_THRESHOLD) {
      beginDrag();
    }

    if (isDragging()) {
      scheduleDropIndicator(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;

    el.releasePointerCapture?.(e.pointerId);

    if (isDragging()) {
      const dropTarget = computeDropTarget(e.clientX, e.clientY);

      if (dropTarget && dragState) {
        moveNode(
          dragState.sourceCardId,
          dragState.nodeId,
          dropTarget.column,
          dropTarget.index,
        );
      }

      endDrag();
    } else {
      const elapsed = performance.now() - startTime;

      if (elapsed < TAP_MAX_DURATION) {
        focusNode(node.id);
      }
    }

    pointerId = null;
  };

  const onPointerCancel = () => {
    if (isDragging()) endDrag();
    pointerId = null;
  };

  onCleanup(() => {
    if (isDragging()) endDrag();

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  const showIndicatorBefore = createMemo(() => {
    const di = dropIndicator();

    return !!(
      di &&
      di.targetId === node.id &&
      di.before &&
      draggedNodeId() !== node.id
    );
  });

  return (
    <>
      <div class="drop-zone" classList={{ active: showIndicatorBefore() }} />

      <div
        ref={el}
        class="node"
        data-id={node.id}
        data-type={node.type}
        data-column={node.column}
        style={node.style}
        classList={{
          focused: editor.focus === node.id,
          dragging: isDragging(),
          "being-dragged": draggedNodeId() === node.id,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={(e) => e.stopPropagation()}
      >
        <div class="drag-handle">
          <span class="grip">⋮⋮</span>
        </div>

        {node.type === "text" ? (
          <RenderText node={node} />
        ) : (
          <RenderMedia node={node} cardId={cardId} />
        )}
      </div>
    </>
  );
}

function ColumnEndIndicator(props) {
  const show = createMemo(() => {
    const di = dropIndicator();

    return !!(di && di.column === props.column && di.targetId === null);
  });

  return <div class="drop-zone column-end" classList={{ active: show() }} />;
}

export default function PreviewPage(props) {
  // Whenever the current card changes, stop every tracked media element
  // that doesn't belong to a node on the new card. This is keyed off the
  // node-id -> element map (not DOM lookups) so it can't race with
  // mount/unmount timing, and it deliberately does NOT depend on
  // `editor.focus` so it only reacts to page changes, not focus changes.
  createEffect(() => {
    const card = getCurrentCard();
    if (!card) return;

    const currentIds = new Set(card.nodes.map((n) => n.id));

    for (const [nodeId, { el, cardId }] of previewMedia) {
      if (cardId !== card.id || !currentIds.has(nodeId)) {
        stopMediaElement(el);
      }
    }
  });

  onCleanup(() => {
    for (const { el } of previewMedia.values()) {
      stopMediaElement(el);
    }
    previewMedia.clear();
  });

  onMount(() => {
    const handler = (e) => {
      if (e.key === "Escape") blurNode();
    };

    window.addEventListener("keydown", handler);

    onCleanup(() => {
      window.removeEventListener("keydown", handler);
    });
  });

  return (
    <Show when={getCurrentCard()}>
      {(card) => (
        <div
          class="card previewPage"
          onClick={() => blurNode()}
          style={{
            padding: `${card().layout.padding}px`,
            gap: `${card().layout.gap}px`,
            transform: `scale(${(props.zoom() + 50) / 100})`,
            "transform-origin": "center center",
          }}
        >
          <div
            class={`text col ${card().textColumn === "left" ? "left" : "right"}`}
            style={{
              flex:
                card().textColumn === "left"
                  ? card().layout.ratio[0]
                  : card().layout.ratio[1],
            }}
            onDragOver={handleColumnDragOver}
            onDrop={handleColumnDrop}
          >
            <For each={card().nodes.filter((n) => n.column === "text")}>
              {(node, index) => (
                <RenderNode
                  node={node}
                  cardId={card().id}
                  index={index()}
                />
              )}
            </For>

            <ColumnEndIndicator column="text" />
          </div>

          <div
            class="media col"
            style={{
              flex:
                card().textColumn === "left"
                  ? card().layout.ratio[1]
                  : card().layout.ratio[0],
            }}
            onDragOver={handleColumnDragOver}
            onDrop={handleColumnDrop}
          >
            <For each={card().nodes.filter((n) => n.column === "media")}>
              {(node, index) => (
                <RenderNode
                  node={node}
                  cardId={card().id}
                  index={index()}
                />
              )}
            </For>

            <ColumnEndIndicator column="media" />
          </div>
        </div>
      )}
    </Show>
  );
}
