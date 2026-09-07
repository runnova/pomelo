import { createSignal, Show } from "solid-js";
import Dropdown from "../../utility/Dropdown"
import SettingsDialog from "../settings/Settings";
import { exportProject, loadProject, editor, setPreviewMode, importProject } from "../State"
import "./style.css"
export default function Topbar() {
  let fileInput;
  const [settingsOpen, setSettingsOpen] = createSignal(false);
  return (
    <>
      <div className="topbar x">
        <div>
          <button className="btn alive">
            Pomelo
          </button>
          <Dropdown label="File">
            <input
              ref={input => (fileInput = input)}
              type="file"
              accept=".zip,application/json,application/zip"
              style={{ display: "none" }}
              onChange={async e => {
                const file = e.currentTarget.files?.[0]
                if (!file) return

                try {
                  if (file.name.toLowerCase().endsWith(".zip")) {
                    await importProject(file)
                  } else {
                    const text = await file.text()
                    loadProject(JSON.parse(text))
                  }
                } catch (err) {
                  console.error("Invalid project file", err)
                }

                e.currentTarget.value = ""
              }}
            />

            <button
              class="dropdown-item"
              onClick={() => fileInput.click()}
            >
              Open
            </button>
            <button class="dropdown-item">Save</button>
            <button class="dropdown-item">Save As</button>
          </Dropdown>
          <Dropdown label="View">
            <button class="dropdown-item">Open</button>
            <button class="dropdown-item">Save</button>
            <button class="dropdown-item">Save As</button>
          </Dropdown>
          <Dropdown label="Editor">
            <button class="dropdown-item">Undo</button>
            <button class="dropdown-item">Redo</button>
            <button class="dropdown-item"onClick={() => setSettingsOpen(true)}>Settings</button>
          </Dropdown>
        </div>
        <div>
          <div className="raw_toggle x">
            <div
              className={editor.previewMode === "json" ? "active" : ""}
              onClick={() => setPreviewMode("json")}
            >
              Raw
            </div>
            <div
              className={editor.previewMode === "json" ? "" : "active"}
              onClick={() => setPreviewMode("visual")}
            >
              Preview
            </div>
          </div>
        </div>
        <div>
          <button className="btn">
            Saving...
          </button>
          <button className="play_project_button alive btn">
            Play
          </button>
          <button className="export_project_button alive btn" onClick={exportProject}>
            Export
          </button>
        </div>
      </div>

      <Show when={settingsOpen()}>
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      </Show>
    </>
  )
}
