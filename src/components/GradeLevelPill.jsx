const PILL_COLORS = {
  math: { bg: "#E6F1FB", color: "#185FA5" },
  reading: { bg: "#EAF3DE", color: "#3B6D11" },
  writing: { bg: "#FAEEDA", color: "#854F0B" },
};

const SUBJECT_INITIAL = { math: "M", reading: "R", writing: "W" };
const SUBJECT_LABEL = { math: "Math", reading: "Reading", writing: "Writing" };

export default function GradeLevelPill({ subject, level, size = "sm" }) {
  const { bg, color } = PILL_COLORS[subject] ?? {
    bg: "#f1f5f9",
    color: "#475569",
  };
  const initial = SUBJECT_INITIAL[subject] ?? subject.charAt(0).toUpperCase();
  const label = SUBJECT_LABEL[subject] ?? subject;
  const fontSize = size === "lg" ? 13 : 11;
  const padding = size === "lg" ? "4px 12px" : "2px 8px";

  return (
    <span
      title={`${label}: ${level}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: bg,
        color,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: "default",
      }}
    >
      {initial} · {level}
    </span>
  );
}
