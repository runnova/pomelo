import { For, Show, onMount, onCleanup, createMemo, createEffect, createSignal } from "solid-js"
import {
  getCurrentCard,
  focusNode,
  blurNode,
  editor,
  moveNode,
  updateNodeById
} from "../../State"

const TAP_MAX_DURATION = 200
const MOVE_THRESHOLD = 8

let dragState = null
const [dropIndicator, setDropIndicator] = createSignal(null)
const [draggedNodeId, setDraggedNodeId] = createSignal(null)

function RenderText(props) {
  let el

  createEffect(() => {
    if (document.activeElement !== el && el.textContent !== props.node.content) {
      el.textContent = props.node.content
    }
  })

  createEffect(() => {
    if (editor.focus !== props.node.id && document.activeElement === el) {
      el.blur()
    }
  })

  return (
    <div
      ref={el}
      class="text-node"
      contentEditable={editor.focus === props.node.id}
      spellcheck={false}
      onInput={e => {
        updateNodeById(props.node.id, node => ({
          ...node,
          content: e.currentTarget.textContent
        }))
      }}
      onPaste={e => {
        e.preventDefault()
        const text = e.clipboardData.getData("text/plain")
        document.execCommand("insertText", false, text)
      }}
      onKeyDown={e => {
        if (e.key === "Escape") e.currentTarget.blur()
      }}
    />
  )
}

function RenderMedia(props) {
  const { node } = props
  switch (node.mediaType) {
    case "image":
      return <img src={node.src} alt={node.caption} style={{ "object-fit": node.fit }} />
    case "video":
      return (
        <video
          src={node.src}
          controls={node.controls}
          autoplay={node.autoplay}
          loop={node.loop}
          muted={node.muted}
          style={{ "object-fit": node.fit }}
        />
      )
    default:
      return null
  }
}

function computeDropTarget(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY)
  if (!target) return null

  const colEl = target.closest(".col")
  if (!colEl) return null

  const column = colEl.classList.contains("media") ? "media" : "text"
  const card = getCurrentCard()
  if (!card) return null

  const columnNodes = card.nodes.filter(n => n.column === column)
  const nodeEl = target.closest(".node")

  if (nodeEl) {
    const targetId = nodeEl.dataset.id
    const foundIndex = columnNodes.findIndex(n => n.id === targetId)
    if (foundIndex === -1) return null

    const rect = nodeEl.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const before = clientY < midpoint

    return {
      column,
      index: before ? foundIndex : foundIndex + 1,
      targetId,
      before
    }
  }

  // Fallback: end of column
  return {
    column,
    index: columnNodes.length,
    targetId: null,
    before: false
  }
}

function RenderNode(props) {
  const { node, cardId, index } = props
  const [isDragging, setIsDragging] = createSignal(false)

  let startX = 0, startY = 0, startTime = 0
  let pointerId = null
  let el

  const beginDrag = () => {
    setIsDragging(true)
    setDraggedNodeId(node.id)
    dragState = {
      nodeId: node.id,
      sourceCardId: cardId,
      sourceColumn: node.column
    }
    focusNode(node.id)

    document.body.style.userSelect = "none"
    if (el) el.style.opacity = "0.4"
  }

  const endDrag = () => {
    setIsDragging(false)
    setDraggedNodeId(null)
    dragState = null
    setDropIndicator(null)
    document.body.style.userSelect = ""
    if (el) el.style.opacity = ""
  }

  const onPointerDown = e => {
    if (e.button !== undefined && e.button !== 0) return

    // Don't start drag if clicking inside editable text
    if (
      node.type === "text" &&
      document.activeElement &&
      el.contains(document.activeElement) &&
      e.target === document.activeElement
    ) return

    pointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    startTime = performance.now()

    el.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = e => {
    if (pointerId === null || e.pointerId !== pointerId) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (!isDragging() && Math.hypot(dx, dy) > MOVE_THRESHOLD) {
      beginDrag()
    }

    if (isDragging()) {
      const dropTarget = computeDropTarget(e.clientX, e.clientY)
      setDropIndicator(dropTarget)
    }
  }

  const onPointerUp = e => {
    if (pointerId === null || e.pointerId !== pointerId) return

    el.releasePointerCapture?.(e.pointerId)

    if (isDragging()) {
      const dropTarget = computeDropTarget(e.clientX, e.clientY)
      if (dropTarget && dragState) {
        moveNode(dragState.sourceCardId, dragState.nodeId, dropTarget.column, dropTarget.index)
      }
      endDrag()
    } else {
      const elapsed = performance.now() - startTime
      if (elapsed < TAP_MAX_DURATION) {
        focusNode(node.id)
      }
    }

    pointerId = null
  }

  const onPointerCancel = () => {
    if (isDragging()) endDrag()
    pointerId = null
  }

  onCleanup(() => {
    if (isDragging()) endDrag()
  })

  const showIndicatorBefore = createMemo(() => {
    const di = dropIndicator()
    return di && di.targetId === node.id && di.before && draggedNodeId() !== node.id
  })

  const showIndicatorAfter = createMemo(() => {
    const di = dropIndicator()
    return di && di.targetId === node.id && !di.before && draggedNodeId() !== node.id
  })

  return (
    <>
      <Show when={showIndicatorBefore()}>
        <div class="drop-indicator before" />
      </Show>

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
          "being-dragged": draggedNodeId() === node.id
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div class="drag-handle">
          <span class="grip">⋮⋮</span>
        </div>

        {node.type === "text" ? <RenderText node={node} /> : <RenderMedia node={node} />}
      </div>

      <Show when={showIndicatorAfter()}>
        <div class="drop-indicator after" />
      </Show>
    </>
  )
}

function ColumnEndIndicator(props) {
  const show = createMemo(() => {
    const di = dropIndicator()
    return di && di.column === props.column && di.targetId === null
  })

  return (
    <Show when={show()}>
      <div class="drop-indicator column-end" />
    </Show>
  )
}

export default function PreviewPage(props) {
  onMount(() => {
    const handler = e => {
      if (e.key === "Escape") blurNode()
    }
    window.addEventListener("keydown", handler)
    onCleanup(() => window.removeEventListener("keydown", handler))
  })

  return (
    <Show when={getCurrentCard()}>
      {card => (
        <div
          class="card previewPage"
          onClick={() => blurNode()}
          style={{
            padding: `${card().layout.padding}px`,
            gap: `${card().layout.gap}px`,
            transform: `scale(${(props.zoom() + 50) / 100 })`,
            "transform-origin": "center center"
          }}
        >
          <div
            class={`text col ${card().textColumn === "left" ? "left" : "right"}`}
            style={{ flex: card().textColumn === "left" ? card().layout.ratio[0] : card().layout.ratio[1] }}
          >
            <For each={card().nodes.filter(n => n.column === "text")}>
              {(node, index) => (
                <RenderNode node={node} cardId={card().id} index={index()} />
              )}
            </For>
            <ColumnEndIndicator column="text" />
          </div>

          <div
            class="media col"
            style={{ flex: card().textColumn === "left" ? card().layout.ratio[1] : card().layout.ratio[0] }}
          >
            <For each={card().nodes.filter(n => n.column === "media")}>
              {(node, index) => (
                <RenderNode node={node} cardId={card().id} index={index()} />
              )}
            </For>
            <ColumnEndIndicator column="media" />
          </div>
        </div>
      )}
    </Show>
  )
}