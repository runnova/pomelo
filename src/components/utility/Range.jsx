import "./range.css";

export default function Range(props) {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;

  const percent = () =>
    ((props.value - min()) / (max() - min())) * 100;

  return (
    <div class="range">
      <input
        type="range"
        min={min()}
        max={max()}
        step={props.step ?? 1}
        value={props.value}
        style={{ "--progress": `${percent()}%` }}
        onInput={(e) => props.onInput?.(+e.currentTarget.value)}
      />
      <span class="range-value">{props.value}</span>
    </div>
  );
}