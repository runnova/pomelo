import "./style.css"
import { For, createSignal, createEffect, onCleanup } from "solid-js"
import {
  HiOutlinePlus,
  HiOutlineXMark,
} from "solid-icons/hi"
import { toPng } from "html-to-image"
import {
  project,
  editor,
  setEditor,
  addCard,
  removeCard,
  moveCard,
} from "../State"

const [dragId, setDragId] = createSignal(null)
const [overIndex, setOverIndex] = createSignal(null)
const [thumbs, setThumbs] = createSignal({})

async function captureThumb(cardId) {
  const el = document.querySelector(`.card.previewPage`)
  if (!el) return

  // Only capture if this is currently the rendered/current card
  if (editor.card.current !== cardId) return

  try {
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 0.5,
      style: { transform: "none" },
    })
    setThumbs(prev => ({ ...prev, [cardId]: dataUrl }))
  } catch (err) {
    console.error("thumbnail capture failed", err)
  }
}

function TimelineItem(props) {
  let debounceTimer

  createEffect(() => {
    // Re-capture whenever this card's nodes/layout/background change
    // (touching card fields makes this effect track them)
    JSON.stringify(props.card)

    if (editor.card.current !== props.card.id) return

    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      captureThumb(props.card.id)
    }, 400)
  })

  onCleanup(() => clearTimeout(debounceTimer))

  return (
    <div
      class={
        "timeline_item " +
        (editor.card.current === props.card.id ? "active " : "") +
        (dragId() === props.card.id ? "dragging " : "") +
        (overIndex() === props.index - 1 && dragId() !== null ? "drag_over " : "")
      }
      draggable="true"
      onClick={() => setEditor("card", "current", props.card.id)}
      onDragStart={e => {
        setDragId(props.card.id)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", props.card.id)
      }}
      onDragEnd={() => {
        setDragId(null)
        setOverIndex(null)
      }}
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (dragId() === null || dragId() === props.card.id) return
        const rect = e.currentTarget.getBoundingClientRect()
        const midpoint = rect.left + rect.width / 2
        const targetIndex =
          e.clientX < midpoint ? props.index - 1 : props.index
        setOverIndex(targetIndex)
      }}
      onDrop={e => {
        e.preventDefault()
        const sourceId = dragId()
        const targetIndex = overIndex()
        if (sourceId !== null && targetIndex !== null) {
          moveCard(sourceId, targetIndex)
        }
        setDragId(null)
        setOverIndex(null)
      }}
    >
      <div class="index">{props.index + 1}</div>

      {thumbs()[props.card.id] ? (
        <img class="thumb" src={thumbs()[props.card.id]} alt="" draggable={false} />
      ) : (
        <div class="thumb thumb_placeholder" />
      )}

      <button
        class="remove"
        onClick={e => {
          e.stopPropagation()
          removeCard(props.card.id)
        }}
      >
        <HiOutlineXMark size={14} />
      </button>
    </div>
  )
}

export default function Timeline() {
  return (
    <div class="timeline_container">
      <div class="row timeline x">
        <For each={project.cards}>
          {(card, index) => (
            <TimelineItem
              card={card}
              index={index()}
            />
          )}
        </For>
        <button class="timeline_add" onClick={addCard}>
          <HiOutlinePlus size={18} />
        </button>
      </div>
    </div>
  )
}
