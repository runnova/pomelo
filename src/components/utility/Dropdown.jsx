import { createSignal, onCleanup } from "solid-js";
import { HiSolidChevronDown } from "solid-icons/hi";
import "./dropdown.css"

export default function Dropdown(props) {
  const [open, setOpen] = createSignal(false);
  let root;

  const handleClickOutside = (e) => {
    if (!root.contains(e.target)) {
      setOpen(false);
    }
  };

  document.addEventListener("click", handleClickOutside);

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  return (
    <div class="dropdown" ref={root}>
      <button
        class={`dropdown-trigger ${open() ? "open" : ""}`}
        onClick={() => setOpen(!open())}
      >
        <span>{props.label}</span>
        <HiSolidChevronDown class="dropdown-icon" />
      </button>

      <div class={`dropdown-menu ${open() ? "show" : ""}`}>
        {props.children}
      </div>
    </div>
  );
}