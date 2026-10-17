import { onMount, onCleanup, Switch, Match } from "solid-js";
import { getCurrentCard } from "../State";
import { previewMedia, stopMediaElement } from "./mediaRegistry";

export default function RenderMedia(props) {
  const { node } = props;
  let media;

  onMount(() => {
    if (!media) return;
    previewMedia.set(node.id, { el: media, cardId: props.cardId });
    if (node.autoplay && getCurrentCard()?.id === props.cardId) {
      media.play().catch(() => {});
    }
  });

  onCleanup(() => {
    if (!media) return;
    previewMedia.delete(node.id);
    stopMediaElement(media);
    media = null;
  });

  const common = () => ({
    src: node.src,
    controls: node.controls,
    loop: node.loop,
    muted: node.muted,
    draggable: false,
    style: { "object-fit": node.fit },
  });

  return (
    <Switch>
      <Match when={node.mediaType === "image"}>
        <img src={node.src} alt={node.caption} draggable={false}
             style={{ "object-fit": node.fit }} />
      </Match>
      <Match when={node.mediaType === "video"}>
        <video ref={media} {...common()} />
      </Match>
      <Match when={node.mediaType === "audio"}>
        <audio ref={media} {...common()} />
      </Match>
    </Switch>
  );
}
