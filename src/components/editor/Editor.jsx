import Topbar from "./topbar/topbar"
import Sidebar from "./sidebar/sidebar"
import PreviewContainer from "./preview/PreviewContainer"
import Headings from "./headings/Headings"
import Timeline from "./timeline/timeline"

export default function Editor() {
  return (
    <>
      <div className="fill y">
        <Topbar />
        <div class="x fill">
          <Sidebar />
          <div className="fill y">
            <div class="x fill">
              <PreviewContainer />
              <Headings />
            </div>
            <Timeline />
          </div>
        </div>
      </div>
    </>
  )
}