import { Show, createSignal, For } from "solid-js";
import {
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineArrowUpTray,
  HiOutlineViewColumns
} from "solid-icons/hi";
import {
  editor,
  addNode,
  createTextNode,
  createMediaNode,
  setCardRatio,
  getCurrentCard,
  buildNodeFromTemplateDef,
} from "../State";
import { quickInsertTemplates } from "../substate/quickInsertTemplates";
import "./style.css";

export default function Sidebar() {
  const [page, setPage] = createSignal("insert");
  const [draggingKey, setDraggingKey] = createSignal(null);

  function insertTemplate(key, cardId = editor.card.current) {
    if (!cardId) return;

    const node = buildNodeFromTemplateDef(def);
    if (!node) return;

    addNode(cardId, node);

    return node;
  }

  let suppressClick = false;

  const handleDragStart = (key) => (e) => {
    setDraggingKey(key);

    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/x-quick-insert", key);
    e.dataTransfer.setData("text/plain", key);

    suppressClick = true;
  };

  const handleDragEnd = () => {
    setDraggingKey(null);

    setTimeout(() => {
      suppressClick = false;
    }, 0);
  };

  const textTemplates = Object.entries(quickInsertTemplates).filter(
    ([_, template]) => template.type === "text"
  );

  const mediaTemplates = Object.entries(quickInsertTemplates).filter(
    ([_, template]) => template.type === "media"
  );

  const quickInsertKeys = [
    "H1",
    "P",
    "MediaBox"
  ];

  const quickTemplates = quickInsertKeys
    .map(key => [key, quickInsertTemplates[key]])
    .filter(([_, template]) => template);

  const renderTiles = (items) => (
    <For each={items}>
      {([key, template]) => {
        const Icon = template.icon;

        return (
          <div
            class="insert_tile"
            classList={{ dragging: draggingKey() === key }}
            draggable={true}
            onDragStart={handleDragStart(key)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (!suppressClick) {
                insertTemplate(key);
              }
            }}
            title="Click to insert, or drag onto the canvas"
          >
            <Icon />
            <span>{template.label}</span>
          </div>
        );
      }}
    </For>
  );

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
                {renderTiles(quickTemplates)}
              </div>

              <div class="label">Text</div>

              <div class="quick_insert_tiles y">
                {renderTiles(textTemplates)}
              </div>

              <div class="label">Media</div>

              <div class="quick_insert_tiles y">
                {renderTiles(mediaTemplates)}
              </div>
            </div>
          </Show>

          <Show when={page() === "layout"}>
            <div class="label">Layout</div>
            <div className="quick_insert_tiles">
              <div
                class="insert_tile"
                classList={{ active: getCurrentCard()?.layout.ratio.join(",") === "1,1" }}
                title="Click to insert, or drag onto the canvas"
                onClick={() => {
                  const card = getCurrentCard()
                  if (card) setCardRatio(card.id, [1, 1])
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit"><path d="M600-120q-33 0-56.5-23.5T520-200v-560q0-33 23.5-56.5T600-840h160q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H600Zm0-640v560h160v-560H600ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h160q33 0 56.5 23.5T440-760v560q0 33-23.5 56.5T360-120H200Zm0-640v560h160v-560H200Zm560 0H600h160Zm-400 0H200h160Z"/></svg>
                <span>1:1</span>
              </div>
              <div
                class="insert_tile"
                classList={{ active: getCurrentCard()?.layout.ratio.join(",") === "1,0" }}
                title="Click to insert, or drag onto the canvas"
                onClick={() => {
                  const card = getCurrentCard()
                  if (card) setCardRatio(card.id, [1, 0])
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg>
                <span>1:0</span>
              </div>
              <div
                class="insert_tile"
                classList={{ active: getCurrentCard()?.layout.ratio.join(",") === "1,2" }}
                title="Click to insert, or drag onto the canvas"
                onClick={() => {
                  const card = getCurrentCard()
                  if (card) setCardRatio(card.id, [1, 2])
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm120-80v-560H200v560h120Zm80 0h360v-560H400v560Zm-80 0H200h120Z"/></svg>
                <span>1:2</span>
              </div>
              <div
                class="insert_tile"
                classList={{ active: getCurrentCard()?.layout.ratio.join(",") === "2,1" }}
                title="Click to insert, or drag onto the canvas"
                onClick={() => {
                  const card = getCurrentCard()
                  if (card) setCardRatio(card.id, [2, 1])
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm440-80h120v-560H640v560Zm-80 0v-560H200v560h360Zm80 0h120-120Z"/></svg>
                <span>2:1</span>
              </div>
            </div>
          </Show>

          <Show when={page() === "uploads"}>
            <div>Uploads content</div>
          </Show>
        </div>
      </div>
    </div>
  );
}
