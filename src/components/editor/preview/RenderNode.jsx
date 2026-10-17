import { createMemo } from "solid-js";
import { editor } from "../State";
import { dropIndicator, draggedNodeId } from "./dragStore";
import { useNodeDrag } from "./useNodeDrag";
import RenderText from "./RenderText";
import RenderMedia from "./RenderMedia";

export default function RenderNode(props) {
  const { node, cardId } = props;
  let el;
  const { isDragging, handlers } = useNodeDrag({ node, cardId, getEl: () => el });

  const showIndicatorBefore = createMemo(() => {
    const di = dropIndicator();
    return !!(di && di.targetId === node.id && di.before && draggedNodeId() !== node.id);
  });

  return (
    <>
      <div class="drop-zone" classList={{ active: showIndicatorBefore() }} />
      <div
        ref={el}
        class="node"
        data-id={node.id}
        data-type={node.type}
        data-column={node.column}
        style={node.style}
        classList={{
          focused: editor.focus === node.id,
          dragging: isDragging(),
          "being-dragged": draggedNodeId() === node.id,
        }}
        {...handlers}
        onClick={(e) => e.stopPropagation()}
      >
        <div class="drag-handle"><span class="grip">
          <svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
          <circle cy="5.5" cx="2.5" r=".75"/>
          <circle cy="5.5" cx="8" r=".75"/>
          <circle cy="5.5" cx="13.5" r=".75"/>
          <circle cy="10.5" cx="2.5" r=".75"/>
          <circle cy="10.5" cx="8" r=".75"/>
          <circle cy="10.5" cx="13.5" r=".75"/>
          </svg>
        </span></div>
        {node.type === "text"
          ? <RenderText node={node} />
          : <RenderMedia node={node} cardId={cardId} />}
      </div>
    </>
  );
}
