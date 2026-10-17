import { createEffect } from "solid-js";
import { editor, updateNodeById } from "../State";

export default function RenderText(props) {
  let el;

  createEffect(() => {
    if (document.activeElement !== el && el.textContent !== props.node.content) {
      el.textContent = props.node.content;
    }
  });

  createEffect(() => {
    if (editor.focus !== props.node.id && document.activeElement === el) el.blur();
  });

  return (
    <div
      ref={el}
      class="text-node"
      contentEditable={editor.focus === props.node.id}
      spellcheck={false}
      onInput={(e) =>
        updateNodeById(props.node.id, (n) => ({ ...n, content: e.currentTarget.textContent }))
      }
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
      }}
      onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
    />
  );
}
