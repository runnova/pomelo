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
  focusNode
} from "../State"

import {
  HiOutlineClipboardDocument,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentDuplicate,
  HiOutlineTrash,
  HiOutlinePlus
} from "solid-icons/hi"

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

  const addStyle = id => {
    if (!newProperty() || !newValue()) return

    updateStyle(id, newProperty(), newValue())

    setNewProperty("")
    setNewValue("")
  }

  return (
    <div class="headings_sidebar">
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
                  updateNodeById(node().id, n => ({
                    ...n,
                    [n.type === "media" ? "src" : "content"]: e.currentTarget.value
                  }))
                }
              />
            </div>

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
                          updateStyle(
                            node().id,
                            key(),
                            e.currentTarget.value
                          )
                        }
                      />
                    </div>
                  )
                }}
              </Index>

              <div class="label">New CSS:</div>

              <small className="box warning">Custom CSS styles may not apply correctly when you export deck into different formats.</small>
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

                <button
                  class="input"
                  onClick={() => addStyle(node().id)}
                >
                  <HiOutlinePlus />
                </button>
              </div>
            </details>
          </>
        )}
      </Show>
      <div class="label">Headings</div>

      <div class="heading">
        <h1>Hi</h1>
      </div>

      <div class="heading active">
        <h2>Hello</h2>
      </div>
    </div>
  )
}