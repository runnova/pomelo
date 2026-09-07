import { createSignal, Show } from "solid-js";
import Topbar from "./topbar/topbar"
import Sidebar from "./sidebar/sidebar"
import PreviewContainer from "./preview/PreviewContainer"
import Headings from "./headings/Headings"
import Timeline from "./timeline/timeline"
import Welcomer from "./onboarding/welcome"

export default function Editor() {
  const data = JSON.parse(localStorage.getItem("pomelo-data") || "{}");

  const [showWelcomer, setShowWelcomer] = createSignal(!data.welcomerShown);

  window.pomeloWelcomer = {
    showWelcomer,
    open: () => setShowWelcomer(true),
    close: () => setShowWelcomer(false),
  };

  function finishWelcomer() {
    const data = JSON.parse(localStorage.getItem("pomelo-data") || "{}");

    localStorage.setItem("pomelo-data", JSON.stringify({
      ...data,
      welcomerShown: true
    }));

    setShowWelcomer(false);
  }

  return (
    <>
      <div class="fill y">
        <Topbar />
        <div class="x fill">
          <Sidebar />
          <div class="fill y">
            <div class="x fill">
              <PreviewContainer />
              <Headings />
            </div>
            <Timeline />
          </div>
        </div>
      </div>

      <Show when={showWelcomer()}>
        <Welcomer onFinish={finishWelcomer} />
      </Show>
    </>
  )
}
