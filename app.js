// Static C++ Code Notes
// - content/: raw source files
// - notes/manifest.json: which files to show
// - notes/annotations.json: manual link overlays
// - notes/notes.md: free-form notes

import { mdToHtml, escapeHtml } from "./md.js";

const els = {
  tree: document.getElementById("fileTree"),
  code: document.getElementById("code"),
  note: document.getElementById("note"),
  currentPath: document.getElementById("currentPath"),
  jumpLine: document.getElementById("jumpLine"),
  jumpBtn: document.getElementById("jumpBtn"),
};

let manifest = null;
let annotations = null;
let notesMd = "";

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

async function loadText(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.text();
}

function getRoute(){
  // #file=Client/main.cpp&line=12
  const h = location.hash.startsWith("#") ? location.hash.slice(1) : "";
  const params = new URLSearchParams(h);
  return {
    file: params.get("file") || (manifest?.files?.[0]?.path ?? ""),
    line: parseInt(params.get("line") || "1", 10),
  };
}

function setRoute(file, line=1){
  const params = new URLSearchParams();
  params.set("file", file);
  if(line && line > 1) params.set("line", String(line));
  location.hash = params.toString();
}

function renderTree(activePath){
  els.tree.innerHTML = "";
  for(const f of manifest.files){
    const div = document.createElement("div");
    div.className = "fileItem" + (f.path === activePath ? " active" : "");
    div.innerHTML = `<span class="badge">${escapeHtml(f.kind || "file")}</span>
                     <span>${escapeHtml(f.path)}</span>`;
    div.addEventListener("click", () => setRoute(f.path, 1));
    els.tree.appendChild(div);
  }
}

function annoForFile(path){
  return (annotations?.[path] ?? []);
}

function noteForFile(path){
  const block = (manifest?.notes?.[path] ?? "");
  return block || `### ${path}\n\n- 이 파일에 대한 요약을 \`notes/manifest.json\`의 \`notes\` 섹션에 적을 수 있습니다.\n- 자유 형식 정리는 \`notes/notes.md\`에 작성하세요.`;
}

function buildLinkOverlays(path, lines){
  // annotations.json format:
  // {
  //   "Client/main.cpp": [
  //     { "line": 8, "from": "CEngine::GetInst()", "to": "Engine/Engine.h", "toLine": 33, "label": "CEngine::GetInst" }
  //   ]
  // }
  const items = annoForFile(path);
  const byLine = new Map();
  for(const it of items){
    if(!byLine.has(it.line)) byLine.set(it.line, []);
    byLine.get(it.line).push(it);
  }

  return lines.map((raw, idx) => {
    const lineNo = idx + 1;
    const rowAnnos = byLine.get(lineNo) || [];
    if(rowAnnos.length === 0) return raw;

    let s = raw;
    // Apply replacements left-to-right (simple, manual use).
    // If multiple, recommend distinct "from" substrings.
    for(const a of rowAnnos){
      const from = a.from;
      const toFile = a.to;
      const toLine = a.toLine || 1;
      const label = a.label || from;
      const href = `#file=${encodeURIComponent(toFile)}&line=${encodeURIComponent(String(toLine))}`;
      const link = `<a class="sym" href="${href}" title="${escapeHtml(label)}">${escapeHtml(from)}</a>`;
      // Replace first occurrence only.
      s = s.replace(from, link);
    }
    return s;
  });
}

function renderCode(path, text, jumpLine){
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const linked = buildLinkOverlays(path, lines);

  els.code.innerHTML = "";
  linked.forEach((line, i) => {
    const lineNo = i + 1;
    const row = document.createElement("div");
    row.className = "line";
    row.id = `L${lineNo}`;
    row.innerHTML = `<div class="ln">${lineNo}</div><div class="src">${line === "" ? "&nbsp;" : line}</div>`;
    els.code.appendChild(row);
  });

  // Scroll to line
  const target = els.code.querySelector(`#L${jumpLine}`);
  if(target) target.scrollIntoView({ block: "center" });
}

async function render(){
  if(!manifest){
    manifest = await loadJson("./notes/manifest.json");
    annotations = await loadJson("./notes/annotations.json");
    notesMd = await loadText("./notes/notes.md");
  }

  const { file, line } = getRoute();
  renderTree(file);

  els.currentPath.textContent = file;
  els.jumpLine.value = String(Math.max(1, line || 1));

  const text = await loadText(`./content/${file}`);
  renderCode(file, escapeHtml(text), Math.max(1, line || 1));

  const noteMd = noteForFile(file) + "\n\n---\n\n" + notesMd;
  els.note.innerHTML = mdToHtml(noteMd);
}

window.addEventListener("hashchange", () => render().catch(err => {
  els.note.innerHTML = `<pre>${escapeHtml(String(err))}</pre>`;
}));

els.jumpBtn.addEventListener("click", () => {
  const { file } = getRoute();
  const ln = parseInt(els.jumpLine.value || "1", 10);
  setRoute(file, isFinite(ln) && ln > 0 ? ln : 1);
});

render().catch(err => {
  els.note.innerHTML = `<pre>${escapeHtml(String(err))}</pre>`;
});
