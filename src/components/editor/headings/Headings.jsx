import "./style.css"
import { Show, For, Index, createSignal } from "solid-js"
import {
  getFocusedNode,
  updateNodeById,
  removeNode,
  getCurrentCard,
  copyNode,
  pasteNode,
  duplicateNode,
  hasClipboardNode,
  focusNode,
  setEditor,
  getNodeStyle
} from "../State"

import {
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentDuplicate,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineBars3BottomLeft,
  HiOutlineBars3,
  HiOutlineBars3BottomRight,
  HiOutlineBold,
  HiOutlineItalic,
  HiOutlineUnderline,
  HiOutlineStrikethrough,
  HiOutlineXMark
} from "solid-icons/hi"

const ALIGNMENTS = [
  { value: "left", label: "Align left", Icon: HiOutlineBars3BottomLeft },
  { value: "center", label: "Align center", Icon: HiOutlineBars3 },
  { value: "right", label: "Align right", Icon: HiOutlineBars3BottomRight }
]

const FIT_OPTIONS = ["contain", "cover", "fill", "none", "scale-down"]

const MEDIA_FLAGS = [
  { key: "autoplay", label: "Autoplay" },
  { key: "loop", label: "Loop" },
  { key: "muted", label: "Muted" },
  { key: "controls", label: "Controls" }
]

// ---- text-decoration helpers (underline + line-through can coexist) ----
const getDecorations = node => {
  const value = String(getNodeStyle(node, "text-decoration") ?? "none")
  return value.split(/\s+/).filter(token => token && token !== "none")
}

const hasDecoration = (node, token) => getDecorations(node).includes(token)

const isBold = node => {
  const weight = getNodeStyle(node, "font-weight")
  return weight === "bold" || Number(weight) >= 600
}

const isItalic = node => getNodeStyle(node, "font-style") === "italic"

export default function Headings() {
  const focusedNode = () => getFocusedNode()

  const [newProperty, setNewProperty] = createSignal("")
  const [newValue, setNewValue] = createSignal("")

  const updateStyle = (id, key, value) => {
    updateNodeById(id, node => ({
      ...node,
      style: {
        ...node.style,
        [key]: value
      }
    }))
  }

  const updateField = (id, key, value) => {
    updateNodeById(id, node => ({ ...node, [key]: value }))
  }

  const addStyle = id => {
    if (!newProperty() || !newValue()) return

    updateStyle(id, newProperty(), newValue())

    setNewProperty("")
    setNewValue("")
  }

  const toggleBold = node =>
    updateStyle(node.id, "font-weight", isBold(node) ? 400 : 700)

  const toggleItalic = node =>
    updateStyle(node.id, "font-style", isItalic(node) ? "normal" : "italic")

  const toggleDecoration = (node, token) => {
    const current = getDecorations(node)

    const next = current.includes(token)
      ? current.filter(t => t !== token)
      : [...current, token]

    updateStyle(node.id, "text-decoration", next.length ? next.join(" ") : "none")
  }

  const clearFormatting = node =>
    updateNodeById(node.id, n => {
      const style = { ...n.style }

      delete style["font-weight"]
      delete style["font-style"]
      delete style["text-decoration"]

      return {
        ...n,
        style
      }
    })

  return (
    <div class="headings_sidebar y">
      <div class="quick_action_tiles x">
        <button
          disabled={!focusedNode()}
          class={!focusedNode() ? "disabled" : ""}
          onClick={() => copyNode(focusedNode().id)}
        >
          <HiOutlineClipboardDocument size={18} />
          <span>Copy</span>
        </button>

        <button
          disabled={!hasClipboardNode()}
          class={!hasClipboardNode() ? "disabled" : ""}
          onClick={() => {
            const pasted = pasteNode(getCurrentCard().id)
            if (pasted) focusNode(pasted.id)
          }}
        >
          <HiOutlineClipboardDocumentCheck size={18} />
          <span>Paste</span>
        </button>

        <button
          disabled={!focusedNode()}
          class={!focusedNode() ? "disabled" : ""}
          onClick={() => {
            const copy = duplicateNode(focusedNode().id)
            if (copy) focusNode(copy.id)
          }}
        >
          <HiOutlineDocumentDuplicate size={18} />
          <span>Duplicate</span>
        </button>

        <button
          disabled={!focusedNode()}
          class={!focusedNode() ? "disabled" : ""}
          onClick={() => {
            removeNode(getCurrentCard().id, focusedNode().id)
            focusNode(null)
          }}
        >
          <HiOutlineTrash size={18} />
          <span>Delete</span>
        </button>
      </div>

      <Show when={focusedNode()}>
        {node => (
          <>
            <div class="label">Edit Element</div>

            <div class="inpgrp">
              <div class="label">
                {node().type === "media" ? "Source:" : "Content:"}
              </div>
              <input
                class="input"
                value={node().type === "media" ? node().src : node().content}
                onInput={e =>
                  updateField(
                    node().id,
                    node().type === "media" ? "src" : "content",
                    e.currentTarget.value
                  )
                }
              />
            </div>

            <Show when={node().type === "text"}>
              <div class="inpgrp">
                <div class="label">Alignment:</div>
                <div class="toggle_group x">
                  <For each={ALIGNMENTS}>
                    {({ value, label, Icon }) => (
                      <button
                        title={label}
                        class={
                          getNodeStyle(node(), "text-align") === value
                            ? "active"
                            : ""
                        }
                        onClick={() => updateStyle(node().id, "text-align", value)}
                      >
                        <Icon size={18} />
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <div class="inpgrp">
                <div class="label">Formatting:</div>
                <div class="toggle_group seperate_inputs x">
                  <button
                    title="Bold"
                    class={isBold(node()) ? "active" : ""}
                    onClick={() => toggleBold(node())}
                  >
                    <HiOutlineBold size={18} />
                  </button>

                  <button
                    title="Italic"
                    class={isItalic(node()) ? "active" : ""}
                    onClick={() => toggleItalic(node())}
                  >
                    <HiOutlineItalic size={18} />
                  </button>

                  <button
                    title="Underline"
                    class={hasDecoration(node(), "underline") ? "active" : ""}
                    onClick={() => toggleDecoration(node(), "underline")}
                  >
                    <HiOutlineUnderline size={18} />
                  </button>

                  <button
                    title="Strikethrough"
                    class={hasDecoration(node(), "line-through") ? "active" : ""}
                    onClick={() => toggleDecoration(node(), "line-through")}
                  >
                    <HiOutlineStrikethrough size={18} />
                  </button>

                  <button
                    title="Clear formatting"
                    onClick={() => clearFormatting(node())}
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                </div>
              </div>
            </Show>

            <Show when={node().type === "media"}>
              <div class="inpgrp">
                <div class="label">Caption:</div>
                <input
                  class="input"
                  value={node().caption ?? ""}
                  onInput={e =>
                    updateField(node().id, "caption", e.currentTarget.value)
                  }
                />
              </div>

              <div class="inpgrp">
                <div class="label">Credit:</div>
                <input
                  class="input"
                  value={node().credit ?? ""}
                  onInput={e =>
                    updateField(node().id, "credit", e.currentTarget.value)
                  }
                />
              </div>

              <div class="inpgrp">
                <div class="label">Fit:</div>
                <select
                  class="input"
                  value={node().fit ?? "contain"}
                  onChange={e =>
                    updateField(node().id, "fit", e.currentTarget.value)
                  }
                >
                  <For each={FIT_OPTIONS}>
                    {option => <option value={option}>{option}</option>}
                  </For>
                </select>
              </div>

              <div class="toggle_group x wrap">
                <For each={MEDIA_FLAGS}>
                  {({ key, label }) => (
                    <button
                      class={node()[key] ? "active" : ""}
                      onClick={() => updateField(node().id, key, !node()[key])}
                    >
                      {label}
                    </button>
                  )}
                </For>
              </div>
            </Show>

            <details class="css_editor">
              <summary>Properties</summary>
              <Index each={Object.entries(node().style ?? {})}>
                {entry => {
                  const key = () => entry()[0]
                  const value = () => entry()[1]

                  return (
                    <div class="inpgrp">
                      <div class="label">{key()}:</div>

                      <input
                        class="input"
                        value={value()}
                        onInput={e =>
                          updateStyle(node().id, key(), e.currentTarget.value)
                        }
                      />
                    </div>
                  )
                }}
              </Index>

              <div class="label">New CSS:</div>

              <small class="box warning">
                Custom CSS styles may not apply correctly when you export deck
                into different formats.
              </small>
              <div class="x thrinput">
                <input
                  class="input"
                  placeholder="property"
                  value={newProperty()}
                  onInput={e => setNewProperty(e.currentTarget.value)}
                />

                <input
                  class="input"
                  placeholder="value"
                  value={newValue()}
                  onInput={e => setNewValue(e.currentTarget.value)}
                />

                <button class="input" onClick={() => addStyle(node().id)}>
                  <HiOutlinePlus />
                </button>
              </div>
            </details>
          </>
        )}
      </Show>

      <div class="label">Headings</div>
      <div class="headingScroller y fill">
        {window.app.getProjectHeadings().map(({ cardId, node }) => (
          <div
            class={"heading " + node.heading}
            onClick={() => setEditor("card", "current", cardId)}
          >
            <span>{node.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
