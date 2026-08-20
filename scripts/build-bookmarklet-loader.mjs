import { writeFile } from "node:fs/promises";

const repository = "sakots/bullneo";
const branch = "main";
const commitApiUrl = `https://api.github.com/repos/${repository}/commits/${branch}`;
const publishedScriptBase = `https://cdn.jsdelivr.net/gh/${repository}`;

const loader = `javascript:(async()=>{const i='bullneo-loader';if(window.BullNeo&&typeof window.BullNeo.install==='function'){window.BullNeo.install();return}if(document.getElementById(i))return;let v='${branch}';try{const r=await fetch('${commitApiUrl}',{cache:'no-store',credentials:'omit',headers:{Accept:'application/vnd.github+json'},referrerPolicy:'no-referrer'});if(r.ok){const j=await r.json();if(typeof j.sha==='string'&&/^[0-9a-f]{40}$/.test(j.sha))v=j.sha}}catch{}const s=document.createElement('script');s.id=i;s.charset='UTF-8';s.src='${publishedScriptBase}@'+v+'/bullneo.js'+(v==='${branch}'?'?bullneo_debug=1&v='+Date.now():'?bullneo_debug=1');s.onerror=()=>{s.remove();alert('BULLNEOの読み込みに失敗しました。')};(document.head||document.documentElement).appendChild(s)})()`;

await writeFile(
  new URL("../bookmarklet-loader.txt", import.meta.url),
  `${loader}\n`,
);
