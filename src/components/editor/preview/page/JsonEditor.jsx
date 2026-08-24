import { createSignal, createEffect } from "solid-js"
import { getCurrentCard, setCardRaw } from "../../State"
import AceEditor from "../AceEditor"

export default function JsonEditor() {
  const [text, setText] = createSignal("")
  const [error, setError] = createSignal(null)
  let lastCardId = null

  createEffect(() => {
    const card = getCurrentCard()
    if (!card) return

    if (card.id !== lastCardId) {
      lastCardId = card.id
      setText(JSON.stringify(card, null, 2))
      setError(null)
      return
    }

    setText(JSON.stringify(card, null, 2))
    setError(null)
  })

  const applyChange = (value) => {
    setText(value)

    try {
      const parsed = JSON.parse(value)
      setError(null)

      const card = getCurrentCard()

      if (card) {
        setCardRaw(card.id, parsed)
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div class="json_editor fill y">
      <AceEditor
        value={text()}
        onChange={applyChange}
        language="json"
      />

      {error() && (
        <div class="json_editor_error">
          {error()}
        </div>
      )}
    </div>
  )
}
