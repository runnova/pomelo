import "./style.css"
import { Show, For, Index, createSignal } from "solid-js"
import { getFocusedNode, updateNodeById } from "../State"

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
      <Show when={focusedNode()}>
        {node => (
          <>
            <div class="label">Edit Element</div>

            <div class="focusedNodeEditor">

              <div class="inpgrp">
                <div class="label">Content:</div>
                <input
                  class="input"
                  value={node().content}
                  onInput={e =>
                    updateNodeById(node().id, n => ({
                      ...n,
                      content: e.currentTarget.value
                    }))
                  }
                />
              </div>

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
            </div>

            <div class="label">New CSS:</div>
            <div class="x thrinput">
              <input
                class="input"
                placeholder="property"
                value={newProperty()}
                onInput={e =>
                  setNewProperty(e.currentTarget.value)
                }
              />

              <input
                class="input"
                placeholder="value"
                value={newValue()}
                onInput={e =>
                  setNewValue(e.currentTarget.value)
                }
              />

              <button
                class="input"
                onClick={() => addStyle(node().id)}
              >
                <HiOutlinePlus></HiOutlinePlus>
              </button>
            </div>

            <div class="quick_action_tiles x">
              <button>
                <HiOutlineClipboardDocument size={18} />
                <span>Copy</span>
              </button>

              <button className="disabled">
                <HiOutlineClipboardDocumentCheck size={18} />
                <span>Paste</span>
              </button>

              <button>
                <HiOutlineDocumentDuplicate size={18} />
                <span>Duplicate</span>
              </button>

              <button>
                <HiOutlineTrash size={18} />
                <span>Delete</span>
              </button>
            </div>
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