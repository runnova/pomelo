import Dropdown from "../../utility/Dropdown"
import { exportProject, loadProject } from "../State"
import "./style.css"

export default function Topbar() {
  let fileInput;
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
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={async e => {
                const file = e.currentTarget.files?.[0]
                if (!file) return

                try {
                  const text = await file.text()
                  loadProject(JSON.parse(text))
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
        </div>
        <div>
          <div className="raw_toggle x">
            <div>Raw</div>
            <div className="active">Preview</div>
          </div>
        </div>
        <div>
          <button className="btn">
            Saving...
          </button>
          <button className="alive btn">
            Play
          </button>
          <button className="alive btn" onClick={exportProject}>
            Export
          </button>
        </div>

      </div>

    </>
  )
}