import { Show, createSignal, For } from "solid-js";
import {
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineArrowUpTray,
  HiOutlineViewColumns
} from "solid-icons/hi";
import {
  getCurrentCard,
  editor,
  addNode,
  updateNode,
  createTextNode,
  createMediaNode,
  quickInsertTemplates,
  buildNodeFromTemplateDef
} from "../State"
import "./style.css";

export default function Sidebar() {
  const [page, setPage] = createSignal("insert");
  const [draggingKey, setDraggingKey] = createSignal(null);

  function buildNodeFromTemplate(key) {
    const def = quickInsertTemplates[key]
    if (!def) return null

    const { icon, label, ...fields } = def
    const node = def.type === "media" ? createMediaNode() : createTextNode()
    Object.assign(node, fields)
    return node
  }

  function insertTemplate(key, cardId = editor.card.current) {
    if (!cardId) return
    const node = buildNodeFromTemplate(key)
    if (!node) return
    addNode(cardId, node)
    return node
  }

  let suppressClick = false

  const handleDragStart = (key) => (e) => {
    setDraggingKey(key)
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("application/x-quick-insert", key)
    e.dataTransfer.setData("text/plain", key)
    suppressClick = true
  }

  const handleDragEnd = () => {
    setDraggingKey(null)
    setTimeout(() => { suppressClick = false }, 0)
  }

  const handleTileClick = (key) => () => {
    if (suppressClick) return
    insertTemplate(key)
  }

  return (
    <div class="sidebar x">
      <div class="sidebar_sidebar y">
        <button
          class={page() === "insert" ? "active" : ""}
          onClick={() => setPage("insert")}
        >
          <HiOutlineArrowRightEndOnRectangle />
        </button>

        <button
          class={page() === "layout" ? "active" : ""}
          onClick={() => setPage("layout")}
        >
          <HiOutlineViewColumns />
        </button>

        <button
          class={page() === "uploads" ? "active" : ""}
          onClick={() => setPage("uploads")}
        >
          <HiOutlineArrowUpTray />
        </button>
      </div>

      <div class="sidebar_content">
        <div class="sidebar_page">
          <Show when={page() === "insert"}>
            <div>
              <div class="label">Quick Insert</div>

              <div class="quick_insert_tiles y">
                <For each={Object.entries(quickInsertTemplates)}>
                  {([key, template]) => {
                    const Icon = template.icon;

                    return (
                      <div
                        class="insert_tile"
                        classList={{ dragging: draggingKey() === key }}
                        draggable={true}
                        onDragStart={handleDragStart(key)}
                        onDragEnd={handleDragEnd}
                        onClick={() => insertTemplate(key)}
                        title="Click to insert, or drag onto the canvas"
                      >
                        <Icon />
                        <span>{template.label}</span>
                      </div>
                    );
                  }}
                </For>
              </div>

              <div class="label">Text</div>
              <div class="label">Media</div>
            </div>
          </Show>

          <Show when={page() === "layout"}>
            <div>Layout content</div>
          </Show>

          <Show when={page() === "uploads"}>
            <div>Uploads content</div>
          </Show>
        </div>
      </div>
    </div>
  );
}

export { }
