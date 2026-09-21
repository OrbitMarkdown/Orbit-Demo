// Captures marketing screenshots of Orbit MD editing THIS demo site.
//
// Drives the running Orbit app (wails dev) in headless Chrome over the DevTools
// Protocol and saves crisp 2x PNGs. Requires only Node 22+ (global fetch +
// WebSocket) and Google Chrome — no npm dependencies.
//
// Usage:
//   1. In the Orbit app repo:   wails dev        (serves the bridge at :34115)
//   2. Here:                     node scripts/capture-screenshots.mjs
//
// Env overrides:
//   OUT=/path/to/dir     where PNGs are written
//                        (default: ../orbit-marketing/public/screenshots)
//   APP=http://host:port the Orbit dev bridge (default: http://localhost:34115)
//   CHROME=/path/to/chrome
//
// Notes:
//   - Each shot is reached from a clean state and overlays (menus/modals) are
//     explicitly closed by clicking their backdrop, so nothing leaks between
//     shots. The two shots that SHOULD show an overlay (snippet picker, component
//     inserter) open it, capture, then close it.
//   - mode-developer / mode-editor are captured by toggling the UX role in
//     state.json (macOS path) and reloading; the role is restored afterwards.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, ".."); // the demo site = the workspace to open
const APP = process.env.APP || "http://localhost:34115";
const OUT = process.env.OUT || path.resolve(REPO, "../orbit-marketing/public/screenshots");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The Editor/Developer UX role has no SetRole binding — it lives in state.json and
// is read on boot. So set it there and reload to capture each surface.
const STATE = path.join(os.homedir(), "Library/Application Support/OrbitMD/state.json");
const readRole = () => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")).role ?? ""; } catch { return ""; } };
const setRole = (role) => { const s = JSON.parse(fs.readFileSync(STATE, "utf8")); s.role = role; fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); };
const originalRole = readRole();

// bail early if the app bridge isn't up
try {
  await fetch(APP, { signal: AbortSignal.timeout(2000) });
} catch {
  console.error(`Orbit dev bridge not reachable at ${APP}.\nStart it first with 'wails dev' in the app repo, then re-run.`);
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

// 1. launch headless Chrome
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/orbit-capture-chrome", "--no-first-run",
  "--no-default-browser-check", "--hide-scrollbars", APP,
], { stdio: "ignore" });
process.on("exit", () => chrome.kill());

// 2. find the page target
let wsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
    const page = list.find((t) => t.type === "page" && t.url.includes(new URL(APP).port));
    if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
  } catch {}
  await sleep(250);
}
if (!wsUrl) { console.error("could not attach to a Chrome page target"); process.exit(1); }

// 3. tiny CDP client
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

const evalJS = async (expression, awaitPromise = false) =>
  (await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true })).result?.result?.value;
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.result.data, "base64"));
  console.log("saved", name);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1360, height: 860, deviceScaleFactor: 2, mobile: false });

// helpers injected into the page
const HELPERS = `
window.__t = (e) => (e.textContent||'').trim();
window.__clickText = (text, exact) => { const els=[...document.querySelectorAll('button,a,div,span,li,[role=button]')].filter(e=>e.children.length===0||e.tagName==='BUTTON'||e.tagName==='A'); const el = exact ? els.find(e=>window.__t(e)===text) : els.find(e=>window.__t(e).startsWith(text)); if(el){el.click(); return true;} return false; };
window.__clickName = (name) => { const el=[...document.querySelectorAll('button,a,[role=button]')].find(e=>window.__t(e)===name || ((e.getAttribute('title')||'')+(e.getAttribute('aria-label')||'')).includes(name)); if(el){el.click(); return true;} return false; };
// close any open popover/modal by clicking its backdrop (fires the app's onClose)
window.__closeOverlays = () => { document.querySelectorAll('.popover-backdrop,.modal-backdrop').forEach(b=>b.click()); };
window.__overlays = () => [...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e); return s.position==='fixed'&&+s.zIndex>1&&e.offsetWidth>200&&e.offsetHeight>60;}).length;
window.__scrollBody = () => { const ta=document.querySelector('textarea.body'); let n=ta&&ta.parentElement; while(n){const s=getComputedStyle(n); if((s.overflowY==='auto'||s.overflowY==='scroll')&&n.scrollHeight>n.clientHeight+40){n.scrollTop=n.scrollHeight; return;} n=n.parentElement;} };
`;
const reinject = () => evalJS(HELPERS);

// 4. open THIS demo site as home, reload, wait for boot
if ((await evalJS("typeof window.go")) !== "object") { console.error("window.go missing — is this the Orbit dev bridge?"); process.exit(1); }
await evalJS(`window.go.main.App.SetHome(${JSON.stringify(REPO)})`, true);
await send("Page.reload");
await sleep(5000);
await reinject();

// verify a shot has no stray overlay (for the ones that must be clean)
const expectClean = async (label) => {
  const n = await evalJS("window.__overlays()");
  if (n > 0) console.warn(`  ! ${label}: ${n} unexpected overlay(s) still open`);
};

// dashboard
await shot("dashboard");

// open the rich .mdx post → editor form
await evalJS(`window.__clickText("posts", true)`); await sleep(600); await reinject();
await evalJS(`window.__clickText("A better pour-over")`); await sleep(1200);
await shot("editor-form");

// snippet picker (menu intentionally open) → then close
await evalJS(`window.__clickName("Insert a snippet")`); await sleep(600);
await shot("snippet-picker");
await evalJS(`window.__closeOverlays()`); await sleep(300); await reinject();

// component inserter (modal intentionally open) → then close
await evalJS(`window.__clickName("Insert a component")`); await sleep(600);
await shot("component-inserter");
await evalJS(`window.__closeOverlays()`); await sleep(400); await reinject();

// live preview split
await evalJS(`window.__clickName("Markdown preview")`); await sleep(700);
await evalJS(`window.__scrollBody()`); await sleep(400);
await expectClean("preview");
await shot("preview");
await evalJS(`window.__clickName("Exit preview")`); await sleep(300); await reinject();

// images grid (must be clean)
await evalJS(`window.__clickName("Images")`); await sleep(900);
await expectClean("images");
await shot("images");

// settings → components
await evalJS(`window.__clickName("Site settings")`); await sleep(700);
await evalJS(`window.__clickText("Components", true)`); await sleep(700);
await shot("settings-components");

// Editor vs Developer surfaces — set the role in state.json, reload, capture.
if (fs.existsSync(STATE)) {
  setRole("dev");
  await send("Page.reload"); await sleep(5000);
  await shot("mode-developer");
  setRole("editor");
  await send("Page.reload"); await sleep(5000);
  await shot("mode-editor");
  setRole(originalRole); // leave the role as we found it
  console.log(`  (restored role to ${originalRole || "default"})`);
} else {
  console.warn("  ! state.json not found — skipped mode-developer / mode-editor");
}

console.log(`\nDone. ${OUT}`);
ws.close();
chrome.kill();
process.exit(0);
