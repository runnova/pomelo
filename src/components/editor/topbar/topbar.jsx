import Dropdown from "../../utility/Dropdown"
import "./style.css"

export default function Topbar() {
  return (
    <>
      <div className="topbar x">
        <div>
          <button className="btn alive">
            Pomelo
          </button>
          <Dropdown label="File">
            <button class="dropdown-item">Open</button>
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
            Export
          </button>
        </div>

      </div>
    </>
  )
}