import { For, Show } from "solid-js"
import { getCurrentCard } from "../../State"

function RenderText(props) {
  const { node } = props

  const style = {
    color: node.meta.color,
    "font-size": node.meta.fontSize,
    "font-family": node.meta.fontFamily,
    "font-weight": node.meta.fontWeight,
    "font-style": node.meta.fontStyle,
    "text-align": node.meta.textAlign,
    "line-height": node.meta.lineHeight,
    "letter-spacing": node.meta.letterSpacing,
    "text-decoration": node.meta.textDecoration
  }

  switch (node.level) {
    case 1:
      return <h1 style={style}>{node.content}</h1>

    case 2:
      return <h2 style={style}>{node.content}</h2>

    case 3:
      return <h3 style={style}>{node.content}</h3>

    default:
      return <p style={style}>{node.content}</p>
  }
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
            "object-fit": node.meta.fit
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
            "object-fit": node.meta.fit
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
  return (
    <Show when={getCurrentCard()}>
      {card => (
        <div
          class="card previewPage"
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