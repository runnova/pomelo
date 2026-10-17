import { Show, onMount, onCleanup, createEffect } from "solid-js";
import { getCurrentCard, blurNode } from "../../State";
import { stopMediaNotIn, stopAllMedia } from "../mediaRegistry";
import Column from "../Column";

export default function PreviewPage(props) {
  createEffect(() => {
    const card = getCurrentCard();
    if (card) stopMediaNotIn(card);
  });
  onCleanup(stopAllMedia);

  onMount(() => {
    const onKey = (e) => e.key === "Escape" && blurNode();
    window.addEventListener("keydown", onKey);
    onCleanup(() => window.removeEventListener("keydown", onKey));
  });

  return (
    <Show when={getCurrentCard()}>
      {(card) => {
        const left = () => card().textColumn === "left";
        const [a, b] = [() => card().layout.ratio[0], () => card().layout.ratio[1]];
        return (
          <div
            class="card previewPage"
            onClick={() => blurNode()}
            style={{
              padding: `${card().layout.padding}px`,
              gap: `${card().layout.gap}px`,
              transform: `scale(${(props.zoom() + 50) / 100})`,
              "transform-origin": "center center",
            }}
          >
            <Column card={card} column="text" class={left() ? "left" : "right"}
                    flex={left() ? a() : b()} />
            <Column card={card} column="media" flex={left() ? b() : a()} />
          </div>
        );
      }}
    </Show>
  );
}
