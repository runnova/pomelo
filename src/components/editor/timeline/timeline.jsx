import "./style.css"
import { For } from "solid-js"
import {
  HiOutlinePlus,
  HiOutlineXMark,
} from "solid-icons/hi"
import {
  project,
  editor,
  setEditor,
  addCard,
  removeCard,
} from "../State"

function TimelineItem(props) {
  return (
    <div
      class={
        "timeline_item " +
        (editor.card.current === props.card.id ? "active" : "")
      }
      onClick={() => setEditor("card", "current", props.card.id)}
    >
      <div class="index">{props.index}</div>

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
              index={index() + 1}
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