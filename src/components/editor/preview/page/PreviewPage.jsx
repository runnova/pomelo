import { For, Show, onMount, onCleanup, createMemo } from "solid-js"
import { getCurrentCard, focusNode, blurNode, editor } from "../../State"

function RenderText(props) {
  return (
    <>
      {props.node.content}
    </>
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
  const { node } = props

  return (
    <div
      class="node"
      data-id={node.id}
      data-type={node.type}
      data-column={node.column}
      style={node.style}
      classList={{
        focused: editor.focus === node.id
      }}
      onClick={e => {
        e.stopPropagation()
        focusNode(node.id)
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
          >
            <For each={card().nodes.filter(n => n.column === "text")}>
              {node => <RenderNode node={node} />}
            </For>
          </div>

          <div
            class="media col"
            style={{
              flex:
                card().textColumn === "left"
                  ? card().layout.ratio[1]
                  : card().layout.ratio[0]
            }}
          >
            <For each={card().nodes.filter(n => n.column === "media")}>
              {node => <RenderNode node={node} />}
            </For>
          </div>
        </div>
      )}
    </Show>
  )
}