export function escapeHtml(s){
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Minimal markdown (headings, lists, code fences, inline code, links)
export function mdToHtml(md){
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let inCode = false;
  let codeLang = "";
  let inUl = false;
  let inOl = false;

  function closeLists(){
    if(inUl){ html += "</ul>"; inUl = false; }
    if(inOl){ html += "</ol>"; inOl = false; }
  }

  for(let i=0;i<lines.length;i++){
    const line = lines[i];

    // Code fences
    const fence = line.match(/^```(.*)$/);
    if(fence){
      if(!inCode){
        closeLists();
        inCode = true;
        codeLang = fence[1].trim();
        html += `<pre><code>`;
      } else {
        inCode = false;
        html += `</code></pre>`;
      }
      continue;
    }

    if(inCode){
      html += escapeHtml(line) + "\n";
      continue;
    }

    // Horizontal rule
    if(/^---\s*$/.test(line)){
      closeLists();
      html += "<hr />";
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if(h){
      closeLists();
      const lvl = h[1].length;
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      continue;
    }

    // Ordered list
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if(ol){
      if(inUl){ html += "</ul>"; inUl = false; }
      if(!inOl){ html += "<ol>"; inOl = true; }
      html += `<li>${inline(ol[1])}</li>`;
      continue;
    }

    // Unordered list
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if(ul){
      if(inOl){ html += "</ol>"; inOl = false; }
      if(!inUl){ html += "<ul>"; inUl = true; }
      html += `<li>${inline(ul[1])}</li>`;
      continue;
    }

    // Empty
    if(/^\s*$/.test(line)){
      closeLists();
      html += "<br />";
      continue;
    }

    // Paragraph
    closeLists();
    html += `<p>${inline(line)}</p>`;
  }

  closeLists();
  return html;

  function inline(s){
    // inline code
    s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (_, t, u) => `<a href="${escapeHtml(u)}">${escapeHtml(t)}</a>`);
    return s;
  }
}
