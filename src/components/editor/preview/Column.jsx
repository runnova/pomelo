import { For, createMemo } from "solid-js";
import { dropIndicator } from "./dragStore";
import { handleColumnDragOver, handleColumnDrop } from "./quickInsertDrop";
import RenderNode from "./RenderNode";

export default function Column(props) {
  const nodes = createMemo(() => props.card().nodes.filter((n) => n.column === props.column));
  const showEnd = createMemo(() => {
    const di = dropIndicator();
    return !!(di && di.column === props.column && di.targetId === null);
  });

  return (
    <div
      class={`${props.column} col ${props.class ?? ""}`}
      style={{ flex: props.flex }}
      onDragOver={handleColumnDragOver}
      onDrop={handleColumnDrop}
    >
      <For each={nodes()}>
        {(node) => <RenderNode node={node} cardId={props.card().id} />}
      </For>
      <div class="drop-zone column-end" classList={{ active: showEnd() }} />
    </div>
  );
}
