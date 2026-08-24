import { createEffect, onMount, onCleanup } from "solid-js"
import ace from "ace-builds/src-noconflict/ace"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-monokai"

export default function AceEditor(props) {
  let editorElement
  let editor
  let updating = false

  onMount(() => {
    editor = ace.edit(editorElement)

    editor.setTheme("ace/theme/monokai")
    editor.session.setMode("ace/mode/json")

    editor.session.on("change", () => {
      if (updating) return
      props.onChange?.(editor.getValue())
    })
  })

  createEffect(() => {
    const value = props.value ?? ""

    if (!editor) return
    if (editor.getValue() === value) return

    updating = true
    editor.setValue(value, -1)
    updating = false
  })

  onCleanup(() => {
    editor?.destroy()
  })

  return <div ref={editorElement} class="ace_editor_container" />
}
