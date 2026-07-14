import { For, Show, onMount, onCleanup, createMemo, createEffect } from "solid-js"
import {
  getCurrentCard,
  focusNode,
  blurNode,
  editor,
  moveNode,
  updateNodeById  
} from "../../State"


function RenderText(props) {
  let el

  createEffect(() => {
    if (document.activeElement !== el && el.textContent !== props.node.content) {
      el.textContent = props.node.content
    }
  })

  return (
    <div
      ref={el}
      class="text-node"
      contentEditable
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
        if (e.key === "Escape") {
          e.currentTarget.blur()
        }
      }}
    />
  )
}
function RenderMedia(props) {
  const { node } = props

  switch (node.mediaType) {
    case "image":
      return (
        <img
          src={node.src}
          alt={node.caption}
          style={{
            "object-fit": node.fit
          }}
        />
      )

    case "video":
      return (
        <video
          src={node.src}
          controls={node.controls}
          autoplay={node.autoplay}
          loop={node.loop}
          muted={node.muted}
          style={{
            "object-fit": node.fit
          }}
        />
      )

    default:
      return null
  }
}

function RenderNode(props) {
  const { node, cardId, index } = props

  return (
    <div
      class="node"
      data-id={node.id}
      data-type={node.type}
      data-column={node.column}
      style={node.style}
      draggable
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()

        const nodeId = e.dataTransfer.getData("node")

        moveNode(
          cardId,
          nodeId,
          node.column,
          index
        )
      }}
      classList={{
        focused: editor.focus === node.id
      }}

      onMouseDown={e => {
        focusNode(node.id)
      }}
      onDragStart={e => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("node", node.id)
      }}

      onClick={e => {
        e.stopPropagation()
      }}
    >
      {(() => {
        switch (node.type) {
          case "text":
            return <RenderText node={node} />

          case "media":
            return <RenderMedia node={node} />

          default:
            return null
        }
      })()}
    </div>
  )
}

export default function PreviewPage() {

  onMount(() => {
    const handler = e => {
      if (e.key === "Escape") {
        blurNode()
      }
    }

    window.addEventListener("keydown", handler)

    onCleanup(() => {
      window.removeEventListener("keydown", handler)
    })
  })
  return (
    <Show when={getCurrentCard()}>
      {card => (
        <div
          class="card previewPage"
          onClick={() => blurNode()}
          style={{
            padding: `${card().layout.padding}px`,
            gap: `${card().layout.gap}px`
          }}
        >
          <div
            class={`text col ${card().textColumn === "left" ? "left" : "right"}`}
            style={{
              flex:
                card().textColumn === "left"
                  ? card().layout.ratio[0]
                  : card().layout.ratio[1]
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()

              const nodeId = e.dataTransfer.getData("node")
              const index = card().nodes.filter(n => n.column === "text").length

              moveNode(card().id, nodeId, "text", index)
            }}
          >
            <For each={card().nodes.filter(n => n.column === "text")}>
              {(node, index) => (
                <RenderNode
                  node={node}
                  cardId={card().id}
                  index={index()}
                />
              )}
            </For>
          </div>

          <div
            class="media col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()

              const nodeId = e.dataTransfer.getData("node")
              const index = card().nodes.filter(n => n.column === "media").length

              moveNode(card().id, nodeId, "media", index)
            }}
            style={{
              flex:
                card().textColumn === "left"
                  ? card().layout.ratio[1]
                  : card().layout.ratio[0]
            }}
          >
            <For each={card().nodes.filter(n => n.column === "media")}>
              {(node, index) => (
                <RenderNode
                  node={node}
                  cardId={card().id}
                  index={index()}
                />
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  )
}