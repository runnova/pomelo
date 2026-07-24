import "./style.css"
import { createSignal } from "solid-js"
import Range from "../../utility/Range";
import {
  HiOutlineBackward,
  HiOutlineForward,
  HiOutlinePause,
  HiOutlinePlay,
} from "solid-icons/hi"
import { editor, getCardIndex } from "../State";
import PreviewPage from "./page/PreviewPage";

export default function PreviewContainer() {
  const [playing, setPlaying] = createSignal(true)
  const [zoom, setZoom] = createSignal(50);

  return (
    <div class="preview_player fill y">
      <div class="previewContainer fill">
        <PreviewPage zoom={zoom}/>
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