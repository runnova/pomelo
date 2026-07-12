import { Show, createSignal } from "solid-js";
import {
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineArrowUpTray,
  HiOutlineViewColumns
} from "solid-icons/hi";
import {
  createTextNode,
  addNode,
  editor
} from "../State";
import "./style.css";

export default function Sidebar() {
  const [page, setPage] = createSignal("insert");

  const insertText = (level, content = "") => {
    if (!editor.card.current) return;

    const node = createTextNode();
    node.content = content;
    node.level = level;

    addNode(editor.card.current, node);
  };

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

              <div class="quick_insert_tiles">
                <div class="insert_tile" onClick={() => insertText(1)}>
                  H1
                </div>

                <div class="insert_tile" onClick={() => insertText(2)}>
                  H2
                </div>

                <div class="insert_tile" onClick={() => insertText(3)}>
                  H3
                </div>

                <div class="insert_tile" onClick={() => insertText(null)}>
                  Sub
                </div>

                <div class="insert_tile" onClick={() => insertText(null)}>
                  P
                </div>

                <div class="insert_tile" onClick={() => insertText(null)}>
                  Foot
                </div>
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