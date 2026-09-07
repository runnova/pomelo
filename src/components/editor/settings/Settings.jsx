import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCodeBracketSquare,
  HiOutlineCommandLine,
  HiOutlinePuzzlePiece,
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
} from "solid-icons/hi";
import "./style.css";

const iconProps = { size: 18, style: { flex: "0 0 auto" } };

const IconSliders = () => <HiOutlineAdjustmentsHorizontal {...iconProps} />;
const IconEditor = () => <HiOutlineCodeBracketSquare {...iconProps} />;
const IconTerminal = () => <HiOutlineCommandLine {...iconProps} />;
const IconPuzzle = () => <HiOutlinePuzzlePiece {...iconProps} />;
const IconShield = () => <HiOutlineShieldCheck {...iconProps} />;
const IconX = () => <HiOutlineXMark {...iconProps} />;
const IconSearch = () => <HiOutlineMagnifyingGlass {...iconProps} />;
const IconChevronRight = () => <HiOutlineChevronRight size={13} />;


const TABS = [
  { id: "general", label: "General", icon: IconSliders },
  { id: "editor", label: "Text Editor", icon: IconEditor },
  { id: "terminal", label: "Terminal", icon: IconTerminal },
  { id: "extensions", label: "Extensions", icon: IconPuzzle },
  { id: "privacy", label: "Privacy", icon: IconShield },
];

const SECTIONS = {
  general: {
    label: "General",
    bricks: [
      {
        title: "Auto Save",
        description: "Automatically save edited files after a delay.",
        control: "toggle",
        key: "autoSave",
      },
      {
        title: "Confirm Before Exit",
        description: "Ask for confirmation before closing the window with unsaved work.",
        control: "toggle",
        key: "confirmExit",
      },
      {
        title: "Startup Editor",
        description: "Choose what's shown when no folder is open.",
        control: "select",
        key: "startupEditor",
        options: ["None", "Welcome Page", "Last Session"],
      },
    ],
  },
  editor: {
    label: "Text Editor",
    bricks: [
      {
        title: "Font Ligatures",
        description: "Render combined glyphs for operators like =>  and !=.",
        control: "toggle",
        key: "ligatures",
      },
      {
        title: "Word Wrap",
        description: "Wrap long lines to fit the width of the editor pane.",
        control: "toggle",
        key: "wordWrap",
      },
      {
        title: "Cursor Blinking",
        description: "Set the animation style of the text cursor.",
        control: "select",
        key: "cursorBlink",
        options: ["Blink", "Smooth", "Solid", "Phase"],
      },
      {
        title: "Tab Size",
        description: "The number of spaces a tab is equal to.",
        control: "select",
        key: "tabSize",
        options: ["2", "4", "8"],
      },
    ],
  },
  terminal: {
    label: "Terminal",
    bricks: [
      {
        title: "Cursor Style",
        description: "Controls the style of the terminal cursor.",
        control: "select",
        key: "termCursor",
        options: ["Block", "Line", "Underline"],
      },
      {
        title: "Bell Sound",
        description: "Play a sound when the terminal bell is triggered.",
        control: "toggle",
        key: "termBell",
      },
    ],
  },
  extensions: {
    label: "Extensions",
    bricks: [
      {
        title: "Auto Update",
        description: "Automatically update extensions when a new version is available.",
        control: "toggle",
        key: "extAutoUpdate",
      },
      {
        title: "Ignore Recommendations",
        description: "Stop showing extension recommendations for this workspace.",
        control: "toggle",
        key: "extIgnoreRec",
      },
    ],
  },
  privacy: {
    label: "Privacy",
    bricks: [
      {
        title: "Telemetry",
        description: "Send anonymous usage data to help improve the product.",
        control: "toggle",
        key: "telemetry",
      },
      {
        title: "Crash Reporting",
        description: "Automatically send crash reports when the app closes unexpectedly.",
        control: "toggle",
        key: "crashReports",
      },
    ],
  },
};

const DEFAULT_STATE = {
  autoSave: true,
  confirmExit: true,
  startupEditor: "Welcome Page",
  ligatures: false,
  wordWrap: true,
  cursorBlink: "Smooth",
  tabSize: "2",
  termCursor: "Block",
  termBell: false,
  extAutoUpdate: true,
  extIgnoreRec: false,
  telemetry: false,
  crashReports: true,
};

function Toggle(props) {
  return (
    <button
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      class="settings-toggle"
    >
      <div
        class={`settings-toggle-knob ${props.checked ? "checked" : "unchecked"}`}
      />
    </button>
  );
}

function SettingSelect(props) {
  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      class="settings-select"
    >
      <For each={props.options}>{(opt) => <option value={opt}>{opt}</option>}</For>
    </select>
  );
}

function SettingBrick(props) {
  return (
    <div
      class="y settings-brick"
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--diff-one)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div class="x settings-brick-row">
        <div class="y settings-brick-info">
          <div class="settings-brick-title">{props.brick.title}</div>
          <div class="settings-brick-description">
            {props.brick.description}
          </div>
        </div>
        <div class="settings-brick-control">
          <Show when={props.brick.control === "toggle"}>
            <Toggle checked={props.value} onChange={props.onChange} />
          </Show>
          <Show when={props.brick.control === "select"}>
            <SettingSelect
              value={props.value}
              options={props.brick.options}
              onChange={props.onChange}
            />
          </Show>
        </div>
      </div>
    </div>
  );
}

export default function SettingsDialog(props) {
  const [open, setOpen] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal("general");
  const [query, setQuery] = createSignal("");
  const [state, setState] = createSignal({ ...DEFAULT_STATE });

  const close = () => {
    setOpen(false);
    props.onClose?.();
  };

  const handleKey = (e) => {
    if (e.key === "Escape") close();
  };

  createEffect(() => {
    if (open()) {
      window.addEventListener("keydown", handleKey);
    }
  });
  onCleanup(() => window.removeEventListener("keydown", handleKey));

  const updateSetting = (key, value) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const filteredBricks = () => {
    const section = SECTIONS[activeTab()];
    const q = query().trim().toLowerCase();
    if (!q) return section.bricks;
    return section.bricks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  };

  return (
    <Show when={open()}>
      <div
        class="fill settings-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div class="y settings-dialog">
          <div class="x settings-header">
            <div class="x gg settings-header-title">
              <span class="settings-title-text">Settings</span>
            </div>
            <div class="x gg settings-header-actions">
              <div class="x settings-search">
                <IconSearch />
                <input
                  value={query()}
                  onInput={(e) => setQuery(e.currentTarget.value)}
                  placeholder="Search settings"
                  class="settings-search-input"
                />
              </div>
              <button
                onClick={close}
                class="settings-close-btn"
                aria-label="Close settings"
              >
                <IconX />
              </button>
            </div>
          </div>

          <div class="x fill settings-body">
            <div class="y settings-sidebar">
              <For each={TABS}>
                {(tab) => {
                  const isActive = () => activeTab() === tab.id;
                  return (
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      class={`x settings-tab-btn ${isActive() ? "active" : ""}`}
                    >
                      <tab.icon />
                      <span class="fill">{tab.label}</span>
                      <Show when={isActive()}>
                        <IconChevronRight />
                      </Show>
                    </button>
                  );
                }}
              </For>
            </div>

            <div class="y fill settings-content">
              <div class="label settings-section-label">
                {SECTIONS[activeTab()].label}
              </div>
              <div class="y settings-bricks-list">
                <For each={filteredBricks()} fallback={
                  <div class="settings-empty">
                    No matching settings.
                  </div>
                }>
                  {(brick) => (
                    <SettingBrick
                      brick={brick}
                      value={state()[brick.key]}
                      onChange={(v) => updateSetting(brick.key, v)}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
