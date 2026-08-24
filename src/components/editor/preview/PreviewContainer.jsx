import "./style.css"
import { createSignal } from "solid-js"
import { Show } from "solid-js"
import Range from "../../utility/Range";
import {
  HiOutlineBackward,
  HiOutlineForward,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineCodeBracket,
  HiOutlineEye,
} from "solid-icons/hi"
import { editor, getCardIndex, setPreviewMode } from "../State";
import PreviewPage from "./page/PreviewPage";
import JsonEditor from "./page/JsonEditor";

export default function PreviewContainer() {
  const [playing, setPlaying] = createSignal(true)
  const [zoom, setZoom] = createSignal(50);

  return (
    <div class="preview_player fill y">
      <div class="previewContainer fill">
        <Show when={editor.previewMode === "json"} fallback={<PreviewPage zoom={zoom} />}>
          <JsonEditor />
        </Show>
      </div>
      <div class="player_buttons x">
        <div className="current_index_display">Page {getCardIndex(editor.card.current)} / {app.project.cards.length}</div>
        <div className="btngrp">
          <button aria-label="Previous">
            <HiOutlineBackward size={20} />
          </button>
          <button
            aria-label={playing() ? "Pause" : "Play"}
            onClick={() => setPlaying(!playing())}
          >
            {playing() ? (
              <HiOutlinePause size={20} />
            ) : (
              <HiOutlinePlay size={20} />
            )}
          </button>
          <button aria-label="Next">
            <HiOutlineForward size={20} />
          </button>
          <button
            aria-label={editor.previewMode === "json" ? "Visual editor" : "JSON editor"}
            onClick={() => setPreviewMode(editor.previewMode === "json" ? "visual" : "json")}
          >
            {editor.previewMode === "json" ? (
              <HiOutlineEye size={20} />
            ) : (
              <HiOutlineCodeBracket size={20} />
            )}
          </button>
        </div>
        <Range
          min={0}
          max={100}
          step={1}
          value={zoom()}
          onInput={setZoom}
        />
      </div>
    </div>
  )
}
