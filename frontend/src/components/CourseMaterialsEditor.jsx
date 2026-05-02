import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const TYPE_OPTIONS = [
  { value: "link", label: "Link" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "presentation", label: "Presentation" },
];

function newRowId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function emptyMaterialRow() {
  return { rowId: newRowId(), title: "", type: "link", url: "" };
}

/** Strip UI keys and incomplete rows for API */
export function materialsForApi(rows) {
  return rows
    .map(({ title, type, url }) => ({
      title: String(title || "").trim(),
      type,
      url: String(url || "").trim(),
    }))
    .filter((m) => m.title.length > 0 && m.url.length > 0);
}

/** Load server materials into editable rows */
export function rowsFromApi(materials) {
  return (materials || []).map((m) => ({
    rowId: newRowId(),
    title: m.title ?? "",
    type: TYPE_OPTIONS.some((o) => o.value === m.type) ? m.type : "link",
    url: m.url ?? "",
  }));
}

export function CourseMaterialsEditor({ materials, onChange }) {
  function update(index, patch) {
    onChange(materials.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function remove(index) {
    onChange(materials.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...materials, emptyMaterialRow()]);
  }

  return (
    <fieldset className="faculty-fieldset materials-editor">
      <legend>Materials</legend>
      <p className="meta-line">
        Add readings, videos, or links. Incomplete rows (missing title or URL) are ignored when you save.
      </p>
      <div className="materials-list">
        {materials.map((m, idx) => (
          <div key={m.rowId} className="material-row">
            <div className="material-row-fields">
              <Input
                value={m.title}
                onChange={(e) => update(idx, { title: e.target.value })}
                placeholder="Resource title"
                aria-label={`Material ${idx + 1} title`}
              />
              <select
                className="input"
                value={m.type}
                onChange={(e) => update(idx, { type: e.target.value })}
                aria-label={`Material ${idx + 1} type`}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Input
                value={m.url}
                onChange={(e) => update(idx, { url: e.target.value })}
                placeholder="https://…"
                aria-label={`Material ${idx + 1} URL`}
              />
            </div>
            <Button type="button" variant="danger" onClick={() => remove(idx)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={add}>
        Add material
      </Button>
    </fieldset>
  );
}
