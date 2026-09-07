import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  onMount,
  For,
  Show,
} from "solid-js";
import "./style.css"

export const WELCOMER_SCRIPT = [
  {
    kind: "primary",
    title: "Welcome aboard",
    text: "Let's take a quick look around your workspace. This will only take a minute.",
    cta: "Get started",
  },
  {
    kind: "tour",
    target: '.sidebar_content',
    title: "Insert tab",
    text: "This is where you insert elements into the current card.",
  },
  {
    kind: "tour",
    target: '.sidebar_sidebar> :nth-child(2)',
    title: "Layouts",
    text: "This is where you change the layout of the current card.",
  },
  {
    kind: "tour",
    target: '.sidebar_sidebar> :nth-child(3)',
    title: "Assets",
    text: "This is where you manage your assets in the current project.",
  },
  {
    kind: "tour",
    target: '.timeline_container',
    title: "Timeline",
    text: "You manage and switch to different cards here.",
  },
  {
    kind: "tour",
    target: '.headings_sidebar> :nth-child(1)',
    title: "Node manager",
    text: "You can copy, duplicate, or delete the selected node here.",
  },
  {
    kind: "tour",
    target: '.raw_toggle',
    title: "Raw toggle",
    text: "You can edit the current card as JSON by clicking Raw.",
  },
  {
    kind: "tour",
    target: '.play_project_button',
    title: "Play project",
    text: "Start project slideshow here.",
  },
  {
    kind: "tour",
    target: '.export_project_button',
    title: "Export",
    text: "Export the project here.",
  },
  {
    kind: "completed",
    title: "You're all set!",
    text: "That's everything you need to get started. You can replay this tour any time from Settings.",
    cta: "Continue",
  },
];

const CARD_MARGIN = 12;
const VIEWPORT_PADDING = 12;
const ARROW_SIZE = 8;

function computePlacement(targetRect, cardW, cardH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const space = {
    top: targetRect.top,
    bottom: vh - targetRect.bottom,
    left: targetRect.left,
    right: vw - targetRect.right,
  };

  const order = ["bottom", "top", "right", "left"];
  let side = order.find(
    (s) => space[s] >= (s === "top" || s === "bottom" ? cardH + CARD_MARGIN : cardW + CARD_MARGIN)
  );
  if (!side) {
    side = order.reduce((a, b) => (space[a] > space[b] ? a : b));
  }

  let top, left;

  if (side === "bottom" || side === "top") {
    left = targetRect.left + targetRect.width / 2 - cardW / 2;
    left = Math.min(Math.max(left, VIEWPORT_PADDING), vw - cardW - VIEWPORT_PADDING);
    top =
      side === "bottom"
        ? targetRect.bottom + CARD_MARGIN
        : targetRect.top - cardH - CARD_MARGIN;
    top = Math.min(Math.max(top, VIEWPORT_PADDING), vh - cardH - VIEWPORT_PADDING);
  } else {
    top = targetRect.top + targetRect.height / 2 - cardH / 2;
    top = Math.min(Math.max(top, VIEWPORT_PADDING), vh - cardH - VIEWPORT_PADDING);
    left =
      side === "right"
        ? targetRect.right + CARD_MARGIN
        : targetRect.left - cardW - CARD_MARGIN;
    left = Math.min(Math.max(left, VIEWPORT_PADDING), vw - cardW - VIEWPORT_PADDING);
  }

  let arrowLeft, arrowTop;
  if (side === "bottom" || side === "top") {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    arrowLeft = Math.min(
      Math.max(targetCenterX - left, ARROW_SIZE * 2),
      cardW - ARROW_SIZE * 2
    );
  } else {
    const targetCenterY = targetRect.top + targetRect.height / 2;
    arrowTop = Math.min(
      Math.max(targetCenterY - top, ARROW_SIZE * 2),
      cardH - ARROW_SIZE * 2
    );
  }

  return { top, left, side, arrowLeft, arrowTop };
}

function Arrow(props) {
  const style = createMemo(() => {
    const base = {
      position: "absolute",
      width: "0",
      height: "0",
      "border-style": "solid",
    };
    const s = ARROW_SIZE;
    switch (props.side) {
      case "bottom":
        return {
          ...base,
          top: `-${s}px`,
          left: `${props.arrowLeft}px`,
          "margin-left": `-${s}px`,
          "border-width": `0 ${s}px ${s}px ${s}px`,
          "border-color": `transparent transparent var(--welcomer-card-bg) transparent`,
        };
      case "top":
        return {
          ...base,
          bottom: `-${s}px`,
          left: `${props.arrowLeft}px`,
          "margin-left": `-${s}px`,
          "border-width": `${s}px ${s}px 0 ${s}px`,
          "border-color": `var(--welcomer-card-bg) transparent transparent transparent`,
        };
      case "right":
        return {
          ...base,
          left: `-${s}px`,
          top: `${props.arrowTop}px`,
          "margin-top": `-${s}px`,
          "border-width": `${s}px ${s}px ${s}px 0`,
          "border-color": `transparent var(--welcomer-card-bg) transparent transparent`,
        };
      case "left":
      default:
        return {
          ...base,
          right: `-${s}px`,
          top: `${props.arrowTop}px`,
          "margin-top": `-${s}px`,
          "border-width": `${s}px 0 ${s}px ${s}px`,
          "border-color": `transparent transparent transparent var(--welcomer-card-bg)`,
        };
    }
  });

  return <div style={style()} />;
}

function CardBody(props) {
  return (
    <>
      <p class="welcomer-text">{props.text}</p>
    </>
  );
}

export default function Welcomer(props) {
  const script = () => props.script ?? WELCOMER_SCRIPT;

  const [stepIndex, setStepIndex] = createSignal(0);
  const [visible, setVisible] = createSignal(true);
  const [placement, setPlacement] = createSignal(null);
  const [highlightRect, setHighlightRect] = createSignal(null);

  let cardRef;

  const step = createMemo(() => script()[stepIndex()]);
  const isAnchored = createMemo(() => step()?.kind === "tour");

  const tourSteps = createMemo(() => script().filter((s) => s.kind === "tour"));
  const tourPosition = createMemo(() => {
    if (!isAnchored()) return null;
    const idx = tourSteps().indexOf(step());
    return { current: idx + 1, total: tourSteps().length };
  });

  function finish() {
    setVisible(false);
    props.onFinish?.();
  }

  function goNext() {
    if (stepIndex() >= script().length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goPrev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function skip() {
    finish();
  }

  function updatePlacement() {
    const s = step();
    if (!s) return;

    if (s.kind !== "tour") {
      setPlacement(null);
      setHighlightRect(null);
      return;
    }

    const target = document.querySelector(s.target);
    if (!target) {
      setHighlightRect(null);
      setPlacement(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setHighlightRect(rect);

    const cardW = cardRef?.offsetWidth || 300;
    const cardH = cardRef?.offsetHeight || 140;

    setPlacement(computePlacement(rect, cardW, cardH));

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const offscreen =
      rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw;
    if (offscreen) {
      target.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    }
  }

  createEffect(() => {
    step();
    queueMicrotask(updatePlacement);
    requestAnimationFrame(updatePlacement);
  });

  onMount(() => {
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
  });

  onCleanup(() => {
    window.removeEventListener("resize", updatePlacement);
    window.removeEventListener("scroll", updatePlacement, true);
  });

  return (
    <Show when={visible() && step()}>
      <div class="welcomer-root">
        <style>{CSS}</style>

        <div class="welcomer-overlay" />

        <Show when={isAnchored() && highlightRect()}>
          <div
            class="welcomer-highlight"
            style={{
              top: `${highlightRect().top - 4}px`,
              left: `${highlightRect().left - 4}px`,
              width: `${highlightRect().width + 8}px`,
              height: `${highlightRect().height + 8}px`,
            }}
          />
        </Show>

        <Show when={isAnchored()}>
          <div
            ref={cardRef}
            class="welcomer-card welcomer-card--anchored"
            style={
              placement()
                ? { top: `${placement().top}px`, left: `${placement().left}px` }
                : { visibility: "hidden", top: "-9999px", left: "-9999px" }
            }
          >
            <Show when={placement()}>
              <Arrow
                side={placement().side}
                arrowLeft={placement().arrowLeft}
                arrowTop={placement().arrowTop}
              />
            </Show>

            <div class="welcomer-pager">
              {tourPosition().current} / {tourPosition().total} · {step().title.toLowerCase()}
            </div>

            <CardBody title={step().title} text={step().text} />

            <div class="welcomer-actions welcomer-actions--tour">
              <button
                class="welcomer-btn welcomer-btn--ghost"
                onClick={goPrev}
                disabled={stepIndex() === 0}
              >
                Previous
              </button>
              <button class="welcomer-btn welcomer-btn--primary" onClick={goNext}>
                Next
              </button>
              <button class="welcomer-btn welcomer-btn--text" onClick={skip}>
                Skip
              </button>
            </div>
          </div>
        </Show>

        <Show when={!isAnchored()}>
          <div class="welcomer-card welcomer-card--centered">
            <CardBody title={step().title} text={step().text} />
            <div class="welcomer-actions welcomer-actions--centered">
              <button class="welcomer-btn welcomer-btn--primary" onClick={goNext}>
                {step().cta || "Continue"}
              </button>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
}
