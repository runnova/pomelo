import { Show, createSignal, For } from "solid-js";
import {
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineArrowUpTray,
  HiOutlineViewColumns
} from "solid-icons/hi";
import { getCurrentCard, editor, addNode, updateNode, createTextNode, createMediaNode } from "../State"
import "./style.css";

export default function Sidebar() {
  const [page, setPage] = createSignal("insert");

  const quickInsertTemplates = {
    H1: {
      type: "text",
      content: "Heading 1",
      style: {
        "font-size": "48px",
        "font-weight": 700,
        "font-style": "normal",
        "line-height": "1.1",
        "letter-spacing": "0px",
        "text-align": "left",
        "text-decoration": "none"
      }
    },

    H2: {
      type: "text",
      content: "Heading 2",
      style: {
        "font-size": "36px",
        "font-weight": 700,
        "font-style": "normal",
        "line-height": "1.2",
        "letter-spacing": "0px",
        "text-align": "left",
        "text-decoration": "none"
      }
    },

    H3: {
      type: "text",
      content: "Heading 3",
      style: {
        "font-size": "28px",
        "font-weight": 600,
        "font-style": "normal",
        "line-height": "1.3",
        "letter-spacing": "0px",
        "text-align": "left",
        "text-decoration": "none"
      }
    },

    Sub: {
      type: "text",
      content: "Subtitle",
      style: {
        "font-size": "20px",
        "font-weight": 400,
        "font-style": "normal",
        "line-height": "1.4",
        "letter-spacing": "0px",
        "text-align": "left",
        "text-decoration": "none"
      }
    },

    P: {
      type: "text",
      content: "Paragraph text",
      style: {
        "font-size": "16px",
        "font-weight": 400,
        "font-style": "normal",
        "line-height": "1.6",
        "letter-spacing": "0px",
        "text-align": "left",
        "text-decoration": "none"
      }
    },

    Foot: {
      type: "text",
      content: "Footer text",
      style: {
        "font-size": "12px",
        "font-weight": 400,
        "font-style": "normal",
        "line-height": "1.4",
        "letter-spacing": "0px",
        "text-align": "left",
        "margin-top": "auto",
        "text-decoration": "none"
      }
    }
  }
  const insertTemplate = (template) => {
    if (!editor.card.current) return

    const node = createTextNode()

    Object.assign(node, quickInsertTemplates[template])

    addNode(editor.card.current, node)
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

              <div class="quick_insert_tiles">
                <For each={Object.keys(quickInsertTemplates)}>
                  {template => (
                    <div
                      class="insert_tile"
                      onClick={() => insertTemplate(template)}
                    >
                      {template}
                    </div>
                  )}
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