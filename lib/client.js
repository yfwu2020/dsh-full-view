window.__ModuleLoader__.load({id:"@yfwu2020/dsh-full-view",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  installFullView: () => installFullView
});
module.exports = __toCommonJS(index_exports);

// src/config.js
var defaults = Object.freeze({ chatWidth: 400, chatHeight: 540, edgeGap: 20, rememberGeometry: true });
function resolveConfig(input = {}) {
  const config = { ...defaults, ...input };
  for (const [key, min, max] of [["chatWidth", 280, 800], ["chatHeight", 240, 1e3], ["edgeGap", 0, 64]]) {
    if (!Number.isFinite(config[key]) || config[key] < min || config[key] > max) throw new Error(`dsh-full-view: ${key} must be between ${min} and ${max}`);
  }
  if (typeof config.rememberGeometry !== "boolean") throw new Error("dsh-full-view: rememberGeometry must be a boolean");
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, config[key]]));
}

// src/client/style.js
var brainGlyph = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-1.2-2.7-5-2.6-6.2.5C3 5.5 2 8.2 3.2 10.3c-2.2 2.6-1.2 6.2 1.6 7.1-.1 3.7 4.8 5.3 7.2 2.6 2.4 2.7 7.3 1.1 7.2-2.6 2.8-.9 3.8-4.5 1.6-7.1 1.2-2.1.2-4.8-2.6-4.8C17 2.4 13.2 2.3 12 5Z M12 5v15 M5.8 5.5c-.5 1.7.2 3.3 1.8 4 M18.2 5.5c.5 1.7-.2 3.3-1.8 4 M3.2 10.3c1.6-.8 3.2-.2 4.2 1.3 M20.8 10.3c-1.6-.8-3.2-.2-4.2 1.3 M4.8 17.4c1.9.4 3.5-.6 3.6-2.3 M19.2 17.4c-1.9.4-3.5-.6-3.6-2.3"/></svg>');
var style = `
[data-dsh-full-view] > [data-rightbar-col] { grid-column: 3; }
[data-dsh-full-view] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open] {
  width: var(--dsh-fv-content-width) !important;
  max-width: var(--dsh-fv-content-width) !important;
  --dsh-sidebar-width: var(--dsh-fv-content-width) !important;
}
[data-dsh-full-view] [data-sidebar-right-panel="fullscreen"] [data-dockkit-host="dock"][data-dockkit-column="0"] {
  --dsh-dockkit-strip-inline-start: 10px;
}
[data-dsh-floating-chat] {
  position: absolute !important; left: var(--dsh-fv-x) !important; top: var(--dsh-fv-y) !important;
  width: var(--dsh-fv-width) !important; height: var(--dsh-fv-height) !important;
  min-width: 0; min-height: 0; z-index: 50; container-type: inline-size; container-name: dsh-floating-chat; display: flex !important; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #202124);
  border: 1px solid var(--dsw-alias-border-l3, #ddd) !important; border-radius: 14px;
  box-shadow: 0 12px 40px #0002, 0 2px 8px #0001; overflow: hidden;
  --dsh-frame-leading-clearance: 0px;
  --dsh-fv-input-icon-size: 18px;
  animation: dsh-fv-appear 180ms ease-out;
  transition: top 280ms cubic-bezier(.22, 1, .36, 1), height 280ms cubic-bezier(.22, 1, .36, 1), border-radius 240ms ease, opacity 180ms ease, transform 240ms ease, visibility 240ms;
  transform-origin: bottom right;
}
[data-dsh-floating-chat] > :not([data-dsh-full-view-toolbar]):not([data-dsh-full-view-resize]):not([data-dsh-full-view-edge]) {
  flex: 1 1 0; min-height: 0; max-height: 100%; overflow: hidden;
}
[data-dsh-floating-chat] [data-slot="main"],
[data-dsh-floating-chat] [data-slot="main.conversation"] { height: 100%; min-height: 0; }
[data-dsh-floating-chat] [data-conversation-content] {
  --dsh-chat-content-width: calc(100% - 24px);
  --dsh-chat-user-width: calc(100% - 24px);
  --dsh-composer-card-max-width: calc(100% - 12px);
  --dsh-composer-side-clearance: 6px;
  --dsh-composer-text-max-height: 160px;
  min-height: 0;
}
[data-dsh-floating-header] { display: none !important; }
[data-dsh-full-view-toolbar] {
  box-sizing: border-box; min-height: 36px; height: 36px; flex: none; padding: 0 8px 0 12px;
  display: flex; align-items: center; gap: 6px; cursor: grab; touch-action: none;
  user-select: none; -webkit-app-region: no-drag; border-bottom: .5px solid var(--dsw-alias-border-l3, #ddd);
  background: var(--dsw-alias-bg-base, #fff); font: 12px/1.4 system-ui, sans-serif;
  transition: opacity 160ms ease, display 160ms allow-discrete;
}
[data-dsh-full-view-toolbar] [data-dsh-full-view-title] { width: auto; justify-content: flex-start; text-align: left; font: inherit; color: inherit; flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
[data-dsh-full-view-toolbar] button {
  flex: none; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; border-radius: 6px; cursor: pointer; color: var(--dsw-alias-label-secondary, #666);
}
[data-dsh-full-view-toolbar] button:hover { background: var(--dsw-alias-interactive-bg-hover, #0001); }
[data-dsh-full-view-toolbar] button:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: -2px; }
[data-dsh-full-view-toolbar] svg { width: 15px; height: 15px; }
[data-dsh-floating-chat][data-dsh-chat-minimized] { height: 36px !important; }
[data-dsh-floating-chat][data-dsh-chat-minimized]:not([data-dsh-chat-composer]) > :not([data-dsh-full-view-toolbar]):not([data-dsh-full-view-edge]) { display: none !important; }
[data-dsh-full-view-resize] { position: absolute; z-index: 4; touch-action: none; -webkit-app-region: no-drag; }
[data-dsh-resize-direction="se"], [data-dsh-resize-direction="nw"], [data-dsh-resize-direction="ne"], [data-dsh-resize-direction="sw"] { width: 14px; height: 14px; }
[data-dsh-resize-direction="se"] { right: 0; bottom: 0; cursor: nwse-resize; }
[data-dsh-resize-direction="nw"] { left: 0; top: 0; cursor: nwse-resize; }
[data-dsh-resize-direction="ne"] { right: 0; top: 0; cursor: nesw-resize; }
[data-dsh-resize-direction="sw"] { left: 0; bottom: 0; cursor: nesw-resize; }
[data-dsh-resize-direction="w"], [data-dsh-resize-direction="e"] { top: 14px; bottom: 14px; width: 6px; cursor: ew-resize; }
[data-dsh-resize-direction="w"] { left: 0; }
[data-dsh-resize-direction="e"] { right: 0; }
[data-dsh-resize-direction="n"], [data-dsh-resize-direction="s"] { left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
[data-dsh-resize-direction="n"] { top: 0; }
[data-dsh-resize-direction="s"] { bottom: 0; }
[data-dsh-full-view-resize]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: -2px; }
[data-dsh-full-view-edge] { position: absolute; inset: 0; z-index: 3; pointer-events: none; background: transparent; border: 0; border-radius: inherit; padding: 0; touch-action: none; }
[data-dsh-full-view-edge]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: 2px; }
[data-dsh-edge-side] { position: absolute; pointer-events: auto; cursor: pointer; }
[data-dsh-edge-side="top"] { top: 0; left: 14px; right: 14px; height: 6px; }
[data-dsh-edge-side="bottom"] { bottom: 0; left: 14px; right: 20px; height: 6px; }
[data-dsh-edge-side="left"] { left: 0; top: 14px; bottom: 14px; width: 6px; }
[data-dsh-edge-side="right"] { right: 0; top: 14px; bottom: 20px; width: 6px; }
[data-dsh-chat-minimized] [data-dsh-full-view-edge] { display: block !important; }
[data-dsh-floating-chat] [data-composer-seat] { padding: 3px; box-sizing: border-box; }
[data-dsh-floating-chat] [data-dsh-full-view-input-shell] { padding: 0 !important; gap: 0 !important; margin: 0 !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] {
  display: grid !important; grid-template-columns: auto minmax(40px, 1fr) auto; align-items: center;
  gap: 4px !important; padding: 4px !important; min-height: 40px; border-radius: 22px !important;
  max-width: 100% !important; background: var(--dsw-alias-bg-base, #fff);
}
[data-dsh-floating-chat] [data-input-scroll] { position: relative; grid-column: 2; grid-row: 1; min-width: 0; margin: 0 !important; max-height: 144px; }
[data-dsh-floating-chat] [data-composer-input] { min-height: 24px !important; padding: 0 4px !important; font-size: 14px; line-height: 24px; }
[data-dsh-floating-chat] [data-composer-placeholder] { inset: 0 4px auto !important; line-height: 24px; font-size: 14px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-row] {
  display: contents !important; --dsh-composer-model-text-display: none; --dsh-composer-model-icon-display: block;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; grid-row: 1; gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 3; grid-row: 1; gap: 4px !important; margin: 0 !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button > svg:first-of-type,
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button > span[aria-hidden="true"]:first-of-type > svg,
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] button > svg:first-of-type {
  width: var(--dsh-fv-input-icon-size) !important; height: var(--dsh-fv-input-icon-size) !important; flex: none;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button > span[aria-hidden="true"]:first-of-type {
  width: var(--dsh-fv-input-icon-size); height: var(--dsh-fv-input-icon-size); flex: none;
}
[data-dsh-full-view-model-icon] { display: none !important; }
[data-dsh-full-view-model]::before {
  content: ''; flex: none; width: var(--dsh-fv-input-icon-size); height: var(--dsh-fv-input-icon-size); background: currentColor;
  mask: url("data:image/svg+xml,${brainGlyph}") center / contain no-repeat;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button[aria-label]:has(> span[aria-hidden="true"] > svg) > span:not([aria-hidden="true"]) { display: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button[aria-label]:has(> span[aria-hidden="true"] > svg) { padding-inline: 4px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] > div,
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] > div { gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] button { max-height: 32px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] > button { transform: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] > :not([data-input-scroll]):not([data-dsh-full-view-input-row]) { grid-column: 1 / -1; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] { height: var(--dsh-fv-collapsed-height, 48px) !important; border-radius: 24px; overflow: visible; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-toolbar] { display: none !important; opacity: 0; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-resize]:not([data-dsh-resize-direction="e"]):not([data-dsh-resize-direction="w"]) { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-input-path] { display: flex !important; position: absolute !important; inset: auto 0 0; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path] { box-sizing: border-box; width: 100% !important; height: auto !important; min-height: 0 !important; flex: none !important; overflow: visible !important; background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path]:not([data-composer-seat]) > :not([data-dsh-full-view-input-path]) { display: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-footer] { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-composer-seat] { background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-composer-card] { box-shadow: none !important; background: transparent; }
[data-dsh-full-view-toolbar] [data-dsh-move-chat] { font-size: 20px; cursor: grab; touch-action: none; }
[data-dsh-full-view-toolbar] button:disabled { opacity: .35; cursor: default; }
[data-dsh-floating-chat][data-dsh-chat-hidden] { opacity: 0; transform: translateY(8px) scale(.96); visibility: hidden; pointer-events: none; }
[data-dsh-restore-chat] {
  position: absolute; z-index: 51; box-sizing: border-box; width: 40px; height: 40px;
  appearance: none; display: flex; align-items: center; justify-content: center; padding: 7px;
  border: 1px solid var(--dsw-alias-border-l3, #ddd); border-radius: 50% !important; corner-shape: round;
  color: var(--dsw-focus-ring-color, #5686fe); background: var(--dsw-alias-bg-base, #fff);
  box-shadow: 0 4px 18px #0002; cursor: pointer; touch-action: none; -webkit-app-region: no-drag;
  transition: opacity 180ms ease, transform 240ms cubic-bezier(.22, 1, .36, 1), visibility 240ms;
}
[data-dsh-whale-icon] {
  display: block; width: 24px; height: 24px; background: currentColor;
  mask: var(--dsh-fv-whale-still, linear-gradient(transparent, transparent)) center / contain no-repeat alpha;
}
@media (prefers-reduced-motion: no-preference) and (forced-colors: none) {
  [data-dsh-restore-chat][data-dsh-running] [data-dsh-whale-icon] {
    mask-image: var(--dsh-fv-whale-motion);
  }
}
[data-dsh-restore-chat][hidden] { display: flex !important; opacity: 0; transform: scale(.75); visibility: hidden; pointer-events: none; }
[data-dsh-processing-status][hidden] { display: none !important; }
[data-dsh-restore-chat]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: 2px; }
[data-dsh-processing] [data-composer-placeholder] { visibility: hidden !important; }
[data-dsh-processing-status] {
  position: absolute; inset: 0 4px auto; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  color: var(--dsw-alias-label-secondary, #666); font: 14px/24px system-ui, sans-serif;
  pointer-events: none;
}
[data-dsh-fv-dragging] { user-select: none; cursor: grabbing; }
[data-dsh-fv-dragging] [data-dsh-floating-chat], [data-dsh-fv-dragging] [data-dsh-restore-chat] { transition: none; }
[data-dsh-fv-dragging] iframe { pointer-events: none !important; }
@container dsh-floating-chat (max-width: 320px) {
  [data-dsh-floating-chat] [data-dsh-full-view-composer-card] { grid-template-columns: minmax(0, 1fr) auto !important; }
  [data-dsh-floating-chat] [data-input-scroll] { grid-column: 1 / -1; grid-row: 1; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; grid-row: 2; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 2; grid-row: 2; }
}
@starting-style {
  [data-dsh-full-view-toolbar] { opacity: 0; }
}
@keyframes dsh-fv-appear { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  [data-dsh-floating-chat], [data-dsh-restore-chat], [data-dsh-full-view-toolbar] { animation: none; transition: none; }
}
`;

// src/client/activity.js
function createActivitySource(ctx) {
  const sessions = ctx.get("sessions");
  const status = ctx.get("uiSession").sessionStatus;
  let id = null;
  let binding = null;
  let offBinding = [];
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const bind = () => {
    const next = id ? sessions.binding(id) : void 0;
    if (next === binding) return;
    for (const off of offBinding) off();
    binding = next;
    offBinding = [binding?.session.subscribe(notify), binding?.eventSource.subscribe(notify)].filter(Boolean);
  };
  const offRoot = [sessions.list.subscribe(() => {
    bind();
    notify();
  }), status.subscribe(notify)];
  return {
    setSession(next) {
      id = next;
      bind();
    },
    getSnapshot() {
      const state = status.getSnapshot().get(id);
      const running = state?.running ?? binding?.session.getSnapshot().running ?? false;
      const pending = !!state?.pendingInteraction;
      let end = null;
      let start = null;
      const entries = binding?.eventSource.getSnapshot().entries ?? [];
      for (let i = entries.length - 1; i >= 0; i--) {
        const event = entries[i].event;
        if (event.type === "turn/end" && !end) end = event;
        if (event.type === "turn/start") {
          start = event;
          break;
        }
      }
      const completed = start && end && end.data.turn === start.data.turn;
      const startedAt = running && !completed && Number.isFinite(start?.time) ? start.time : null;
      return { running, pending, startedAt };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      for (const off of [...offRoot, ...offBinding]) off();
      offBinding = [];
      listeners.clear();
      binding = null;
    }
  };
}
function processingLabel(startedAt, now) {
  if (!Number.isFinite(startedAt)) return "\u5904\u7406\u4E2D\u2026";
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1e3));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const rest = seconds % 60;
  return `\u5DF2\u5904\u7406 ${hours ? `${hours} \u5C0F\u65F6 ` : ""}${minutes ? `${minutes} \u5206 ` : ""}${rest} \u79D2`;
}

// src/client/whale.js
var hostSheet = 'style[data-plugin-css="@deepseek-ai/dsh-client-ui-chat/ChatView.module.css"]';
function stillFrame(bytes) {
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) return null;
  const chunks = [bytes.slice(0, 8)];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 8; offset + 12 <= bytes.length; ) {
    const size = view.getUint32(offset);
    if (size > bytes.length - offset - 12) return null;
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (!["acTL", "fcTL", "fdAT"].includes(type)) chunks.push(bytes.slice(offset, offset + size + 12));
    offset += size + 12;
    if (type === "IEND") return chunks.reduce((all, chunk) => [...all, ...chunk], []);
  }
  return null;
}
function syncNativeWhale(doc, badge) {
  const motion = doc.querySelector(hostSheet)?.textContent.match(/mask:\s*url\((data:image\/png;base64,[A-Za-z0-9+/=]+)\)/)?.[1];
  if (!motion || badge.style.getPropertyValue("--dsh-fv-whale-motion") === `url("${motion}")`) return;
  const win = doc.defaultView;
  const bytes = Uint8Array.from(win.atob(motion.split(",")[1]), (char) => char.charCodeAt(0));
  const still = stillFrame(bytes);
  if (!still) return;
  const image = `data:image/png;base64,${win.btoa(String.fromCharCode(...still))}`;
  badge.style.setProperty("--dsh-fv-whale-motion", `url("${motion}")`);
  badge.style.setProperty("--dsh-fv-whale-still", `url("${image}")`);
}

// src/client/index.js
var geometryKey = "dsh.full-view.geometry.v1";
var pendingSelector = "[data-approval-key], [data-question-key], [data-plan-review-key]";
var cleanupKey = Symbol.for("@yfwu2020/dsh-full-view.cleanup");
function findSurface(doc) {
  for (const right of doc.querySelectorAll("[data-rightbar-col]")) {
    const frame = right.parentElement;
    const chat = right.previousElementSibling;
    const panel = right.querySelector('[data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]');
    const content = chat?.querySelector("[data-conversation-session], [data-conversation-root]");
    if (frame?.hasAttribute("data-rightbar-fullscreen") && panel && !panel.closest("[hidden]") && content) {
      const panelSession = panel.closest("[data-sidebar-right-session]")?.getAttribute("data-sidebar-right-session");
      const chatSession = content.getAttribute("data-conversation-session");
      if (chatSession && panelSession && chatSession !== panelSession) continue;
      return { frame, chat, panel, sidebar: chat.previousElementSibling };
    }
  }
  return null;
}
function installFullView(doc, input = {}, activity = null) {
  const config = resolveConfig(input);
  const win = doc.defaultView;
  if (!win) throw new Error("dsh-full-view: no browser document");
  win[cleanupKey]?.();
  const sheet = doc.createElement("style");
  sheet.setAttribute("data-dsh-full-view-style", "");
  sheet.textContent = style;
  doc.head.append(sheet);
  let surface = null;
  let toolbar = null;
  let resize = null;
  let handles = [];
  let badge = null;
  let processing = null;
  let clock = null;
  let approvalState = null;
  let savedAccessibility = null;
  let sessionId = null;
  let suppressChromeClick = false;
  let edgeClickTimer = null;
  let mode = "expanded";
  let edge = null;
  let composer = null;
  let composerMarks = [];
  let modelTrigger = null;
  let modelIcon = null;
  let collapsedHeight = 48;
  let returningFocus = false;
  let suppressEdgeClick = false;
  let title = null;
  let minimize = null;
  let header = null;
  let raf = null;
  let disposed = false;
  let minimized = false;
  let drag = null;
  let preferred = { width: config.chatWidth, height: config.chatHeight };
  if (config.rememberGeometry) {
    try {
      const stored = JSON.parse(win.localStorage.getItem(geometryKey) ?? "null");
      if (stored && ["width", "height"].every((key) => Number.isFinite(stored[key]) && stored[key] > 0) && ["x", "y"].every((key) => stored[key] === void 0 || Number.isFinite(stored[key]))) preferred = stored;
    } catch {
    }
  }
  const setStyle = (element, key, value) => {
    if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value);
  };
  const bounds = () => {
    const box = surface.frame.getBoundingClientRect();
    const sidebar = surface.sidebar?.getBoundingClientRect();
    const viewport = win.visualViewport;
    const chromeTop = Number.parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue("--dsh-frame-chrome-top")) || 0;
    const left = Math.max(0, (sidebar?.right ?? box.left) - box.left, (viewport?.offsetLeft ?? 0) - box.left);
    const top = Math.max(chromeTop, (viewport?.offsetTop ?? 0) - box.top);
    const right = Math.min(box.width, viewport ? viewport.offsetLeft + viewport.width - box.left : box.width);
    const bottom = Math.min(box.height, viewport ? viewport.offsetTop + viewport.height - box.top : box.height);
    return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
  };
  const geometry = () => {
    const b = bounds();
    const gap = Math.min(config.edgeGap, Math.max(0, Math.min(b.width, b.height) / 8));
    const width = Math.max(0, Math.min(Math.max(280, preferred.width), b.width - 2 * gap));
    const height = Math.max(0, Math.min(Math.max(240, preferred.height), b.height - 2 * gap));
    const visibleHeight = Math.min(height, mode === "expanded" ? height : composer ? collapsedHeight : 36);
    const offset = mode !== "expanded" && composer ? height - visibleHeight : 0;
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));
    return {
      width,
      height,
      visibleHeight,
      offset,
      x: clamp(preferred.x ?? b.left + b.width - width - gap, b.left + gap, b.left + b.width - width - gap),
      y: clamp(preferred.y === void 0 ? b.top + b.height - visibleHeight - gap : preferred.y + offset, b.top + gap, b.top + b.height - visibleHeight - gap)
    };
  };
  const persist = () => {
    if (!config.rememberGeometry) return;
    try {
      win.localStorage.setItem(geometryKey, JSON.stringify(preferred));
    } catch {
    }
  };
  const conversation = () => surface?.chat.querySelector("[data-conversation-session], [data-conversation-root]");
  const belongsToConversation = (node) => node.closest("[data-conversation-session], [data-conversation-root]") === conversation();
  const composerSeat = () => [...surface?.chat.querySelectorAll("[data-composer-seat]") ?? []].find(belongsToConversation);
  const editor = () => composer?.card.querySelector("[data-composer-input], textarea") ?? (!composerSeat() ? conversation()?.querySelector("textarea") : null);
  const focusEditor = () => {
    returningFocus = true;
    try {
      editor()?.focus({ preventScroll: true });
    } finally {
      returningFocus = false;
    }
  };
  const withinChat = (node) => node instanceof win.Node && surface?.chat.contains(node);
  const popupSelector = '[role="dialog"], [role="menu"], [role="listbox"], [data-trigger-menu], [data-overlay-owner], [data-content-search-bar], [data-approval-key], [data-question-key], [data-plan-review-key]';
  const popupOpen = () => [...doc.querySelectorAll(popupSelector)].some((node) => {
    if (node.matches(pendingSelector) && surface?.chat.contains(node) && !belongsToConversation(node)) return false;
    if (node.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    const css = win.getComputedStyle(node);
    if (css.visibility === "hidden" || css.visibility === "collapse") return false;
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      if (win.getComputedStyle(ancestor).display === "none") return false;
    }
    return true;
  });
  const updateGeometry = () => {
    if (!surface) return;
    const chrome = mode === "expanded" || mode === "compact" && !composer;
    surface.chat.toggleAttribute("data-dsh-chat-chrome", chrome);
    if (composer) collapsedHeight = Math.max(48, composer.seat.getBoundingClientRect().height + 2);
    const b = bounds();
    const g = geometry();
    setStyle(surface.chat, "--dsh-fv-collapsed-height", `${g.visibleHeight}px`);
    setStyle(surface.frame, "--dsh-fv-content-width", `${b.width}px`);
    for (const key of ["x", "y", "width", "height"]) setStyle(surface.chat, `--dsh-fv-${key}`, `${g[key]}px`);
    if (badge.hidden !== (mode !== "hidden")) badge.hidden = mode !== "hidden";
    setStyle(badge, "left", `${g.x + Math.max(0, g.width - 40)}px`);
    setStyle(badge, "top", `${g.y + Math.max(0, g.visibleHeight - 40)}px`);
    for (const handle of handles) {
      const vertical = ["n", "s"].includes(handle.getAttribute("data-dsh-resize-direction"));
      handle.setAttribute("aria-valuemin", "0");
      handle.setAttribute("aria-valuemax", String(Math.round(vertical ? b.height : b.width)));
      handle.setAttribute("aria-valuenow", String(Math.round(vertical ? g.height : g.width)));
      handle.setAttribute("aria-valuetext", `${Math.round(g.width)} \xD7 ${Math.round(g.height)} \u50CF\u7D20`);
    }
    minimize.disabled = !!approvalState;
    minimize.title = approvalState ? "\u8BF7\u5148\u5904\u7406\u4F1A\u8BDD\u4E2D\u7684\u5F85\u529E\u63D0\u793A" : "\u9690\u85CF\u804A\u5929\uFF0C\u4FDD\u7559\u6062\u590D\u5165\u53E3";
    const label = minimized ? "\u5C55\u5F00\u804A\u5929" : "\u6536\u8D77\u804A\u5929";
    for (const control of [title, edge]) {
      control.setAttribute("aria-expanded", String(!minimized));
      control.setAttribute("aria-label", control === title ? `${label}\uFF1A${title.textContent}` : label);
    }
    title.title = title.textContent;
    edge.title = approvalState ? "\u8BF7\u5148\u5904\u7406\u4F1A\u8BDD\u4E2D\u7684\u5F85\u529E\u63D0\u793A" : `\u70B9\u51FB\u5916\u7F18${minimized ? "\u5C55\u5F00" : "\u6536\u8D77"}\u804A\u5929\uFF0C\u62D6\u52A8\u79FB\u52A8`;
  };
  const setMode = (next, { focus = false, force = false } = {}) => {
    if (!surface || approvalState && next !== "expanded" && !force) return;
    const active = doc.activeElement;
    mode = next;
    minimized = mode !== "expanded";
    surface.chat.toggleAttribute("data-dsh-chat-minimized", minimized);
    surface.chat.toggleAttribute("data-dsh-chat-hidden", mode === "hidden");
    if (mode === "hidden") {
      if (withinChat(active)) active.blur();
      surface.chat.setAttribute("inert", "");
      surface.chat.setAttribute("aria-hidden", "true");
    } else {
      for (const key of ["inert", "aria-hidden"]) {
        const value = savedAccessibility?.[key];
        if (value === null || value === void 0) surface.chat.removeAttribute(key);
        else surface.chat.setAttribute(key, value);
      }
    }
    updateGeometry();
    if (mode === "hidden") badge.focus({ preventScroll: true });
    else if (focus || mode === "compact" && withinChat(active) && !composer?.seat.contains(active)) focusEditor();
  };
  const returnSplit = () => {
    const button2 = surface?.panel.querySelector('[data-sidebar-right-mode="push"]') ?? surface?.panel.querySelector("[data-sidebar-right-mode]");
    button2?.click();
  };
  const toggleMinimize = () => setMode(mode === "expanded" ? "compact" : "expanded", { focus: mode !== "expanded" });
  const resetSize = (position = false) => {
    const g = geometry();
    const b = bounds(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8);
    const restoredHeight = Math.max(0, Math.min(config.chatHeight, b.height - 2 * gap));
    const y = mode === "expanded" ? g.y : g.y + g.visibleHeight - restoredHeight;
    preferred = position ? { width: config.chatWidth, height: config.chatHeight } : { x: g.x, y, width: config.chatWidth, height: config.chatHeight };
    updateGeometry();
    persist();
  };
  const clearEdgeClick = () => {
    if (edgeClickTimer !== null) win.clearTimeout(edgeClickTimer);
    edgeClickTimer = null;
  };
  const delayedToggle = (event) => {
    clearEdgeClick();
    if (event.detail === 0) {
      toggleMinimize();
      return;
    }
    edgeClickTimer = win.setTimeout(() => {
      edgeClickTimer = null;
      toggleMinimize();
    }, 260);
  };
  const pointerDown = (event) => {
    if (event.button !== 0 || drag || event.currentTarget === toolbar && event.target.closest("button")) return;
    event.preventDefault();
    clearEdgeClick();
    const target = event.currentTarget;
    drag = { target, pointerId: event.pointerId, direction: target.getAttribute("data-dsh-resize-direction"), startX: event.clientX, startY: event.clientY, geometry: geometry(), preferred: { ...preferred }, moved: false };
    suppressEdgeClick = suppressChromeClick = false;
    target.setPointerCapture(event.pointerId);
    surface.frame.setAttribute("data-dsh-fv-dragging", "");
  };
  const resizedGeometry = (g, direction, dx, dy) => {
    const b = bounds(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8);
    const west = direction.includes("w"), north = direction.includes("n");
    const maxWidth = west ? g.x + g.width - b.left - gap : b.left + b.width - gap - g.x;
    const maxHeight = north ? g.y + g.height - b.top - gap : b.top + b.height - gap - g.y;
    const width = direction.includes("e") || west ? Math.min(maxWidth, Math.max(280, g.width + (west ? -dx : dx))) : g.width;
    const height = direction.includes("s") || north ? Math.min(maxHeight, Math.max(240, g.height + (north ? -dy : dy))) : g.height;
    return { width, height, x: g.x + (west ? g.width - width : 0), y: g.y - g.offset + (north ? g.height - height : 0) };
  };
  const pointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) <= 4) return;
    drag.moved = true;
    suppressEdgeClick = suppressChromeClick = true;
    const g = drag.geometry;
    preferred = drag.direction ? resizedGeometry(g, drag.direction, dx, dy) : { width: g.width, height: g.height, x: g.x + dx, y: g.y + dy - g.offset };
    const constrained = geometry();
    preferred = { width: constrained.width, height: constrained.height, x: constrained.x, y: constrained.y - constrained.offset };
    updateGeometry();
  };
  const finishPointer = (event, cancel = false) => {
    if (!drag || event?.pointerId !== void 0 && event.pointerId !== drag.pointerId) return;
    const held = drag;
    drag = null;
    surface?.frame.removeAttribute("data-dsh-fv-dragging");
    if (cancel) preferred = held.preferred;
    else if (held.moved && !held.direction) {
      const b = bounds(), g = geometry(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8);
      const threshold = 24;
      let x = g.x, y = g.y;
      const right = b.left + b.width - g.width - gap, bottom = b.top + b.height - g.visibleHeight - gap;
      if (Math.abs(x - b.left - gap) <= threshold) x = b.left + gap;
      if (Math.abs(x - right) <= threshold) x = right;
      if (Math.abs(y - b.top - gap) <= threshold) y = b.top + gap;
      if (Math.abs(y - bottom) <= threshold) y = bottom;
      preferred = { width: g.width, height: g.height, x, y: y - g.offset };
    }
    if (held.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId);
    updateGeometry();
    if (!cancel && held.moved) persist();
  };
  const pointerEnd = (event) => finishPointer(event);
  const button = (label, marker, path, handler) => {
    const element = doc.createElement("button");
    element.type = "button";
    element.setAttribute("aria-label", label);
    element.title = label;
    element.setAttribute(marker, "");
    if (path) element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${path}"/></svg>`;
    element.addEventListener("click", handler);
    return element;
  };
  const moveWithKeyboard = (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) || approvalState && mode === "hidden") return;
    event.preventDefault();
    event.stopPropagation();
    const g = geometry(), step = event.shiftKey ? 48 : 16;
    preferred = { width: g.width, height: g.height, x: g.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0), y: g.y - g.offset + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0) };
    const result = geometry();
    preferred.x = result.x;
    preferred.y = result.y - result.offset;
    updateGeometry();
    persist();
  };
  const buildChrome = () => {
    toolbar = doc.createElement("div");
    toolbar.setAttribute("data-dsh-full-view-toolbar", "");
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "\u804A\u5929\u5C0F\u7A97");
    title = button("\u5C55\u5F00\u804A\u5929", "data-dsh-full-view-title", null, delayedToggle);
    title.textContent = "\u804A\u5929";
    minimize = button("\u9690\u85CF\u804A\u5929\uFF0C\u4FDD\u7559\u6062\u590D\u5165\u53E3", "data-dsh-minimize-chat", "M5 12h14", () => setMode("hidden"));
    const grip = button("\u79FB\u52A8\u804A\u5929\u5C0F\u7A97\uFF1A\u65B9\u5411\u952E\u79FB\u52A8\uFF0CShift \u52A0\u5927\u6B65\u957F", "data-dsh-move-chat", null, () => {
    });
    grip.textContent = "\u283F";
    grip.addEventListener("keydown", moveWithKeyboard);
    toolbar.append(minimize, title, button("\u8FD4\u56DE\u5206\u680F\u89C6\u56FE", "data-dsh-return-split", "M4 5h16v14H4z M10 5v14", returnSplit), grip);
    toolbar.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      if (suppressChromeClick && event.detail !== 0) {
        suppressChromeClick = false;
        return;
      }
      delayedToggle(event);
    });
    edge = button("\u5C55\u5F00\u804A\u5929", "data-dsh-full-view-edge", null, (event) => {
      if (suppressEdgeClick && event.detail !== 0) {
        suppressEdgeClick = false;
        return;
      }
      toggleMinimize();
    });
    for (const side of ["top", "right", "bottom", "left"]) {
      const segment = doc.createElement("span");
      segment.setAttribute("data-dsh-edge-side", side);
      segment.setAttribute("aria-hidden", "true");
      edge.append(segment);
    }
    handles = ["se", "w", "e", "n", "s", "nw", "ne", "sw"].map((direction) => {
      const handle = doc.createElement("div");
      handle.setAttribute("data-dsh-full-view-resize", "");
      handle.setAttribute("data-dsh-resize-direction", direction);
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", direction === "n" || direction === "s" ? "horizontal" : "vertical");
      handle.setAttribute("aria-label", `\u8C03\u6574\u804A\u5929${direction === "w" || direction === "e" ? "\u5BBD\u5EA6" : "\u5927\u5C0F"}\uFF0C\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5C3A\u5BF8`);
      handle.title = "\u62D6\u52A8\u8C03\u6574\u5927\u5C0F\uFF0C\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5C3A\u5BF8";
      handle.tabIndex = 0;
      handle.addEventListener("dblclick", () => {
        clearEdgeClick();
        resetSize();
      });
      handle.addEventListener("click", (event) => {
        if (suppressEdgeClick && event.detail !== 0) {
          suppressEdgeClick = false;
          return;
        }
        if (direction.length !== 1) return;
        delayedToggle(event);
      });
      handle.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        const g = geometry(), step = event.shiftKey ? 48 : 16;
        const dw = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
        const dh = mode !== "expanded" ? 0 : event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0;
        preferred = resizedGeometry(g, direction, direction.includes("w") ? -dw : dw, direction.includes("n") ? -dh : dh);
        updateGeometry();
        persist();
      });
      return handle;
    });
    resize = handles[0];
    badge = button("\u6062\u590D\u804A\u5929", "data-dsh-restore-chat", null, (event) => {
      if (suppressChromeClick && event.detail !== 0) {
        suppressChromeClick = false;
        return;
      }
      setMode("expanded", { focus: true });
    });
    badge.hidden = true;
    badge.addEventListener("keydown", moveWithKeyboard);
    badge.removeAttribute("title");
    const whale = doc.createElement("span");
    whale.setAttribute("data-dsh-whale-icon", "");
    whale.setAttribute("aria-hidden", "true");
    badge.append(whale);
    syncNativeWhale(doc, badge);
    processing = doc.createElement("div");
    processing.setAttribute("data-dsh-processing-status", "");
    processing.setAttribute("role", "status");
    processing.setAttribute("aria-live", "off");
    processing.hidden = true;
    for (const element of [toolbar, edge, ...handles, badge, grip]) {
      element.addEventListener("pointerdown", pointerDown);
      element.addEventListener("pointermove", pointerMove);
      element.addEventListener("pointerup", pointerEnd);
      element.addEventListener("pointercancel", (event) => finishPointer(event, true));
      element.addEventListener("lostpointercapture", (event) => finishPointer(event, true));
    }
    const resetOnDoubleClick = (event) => {
      if (event.target.closest("button") && event.target !== title) return;
      clearEdgeClick();
      resetSize(true);
    };
    toolbar.addEventListener("dblclick", resetOnDoubleClick);
  };
  const clearModel = () => {
    modelTrigger?.removeAttribute("data-dsh-full-view-model");
    modelIcon?.removeAttribute("data-dsh-full-view-model-icon");
    modelTrigger = modelIcon = null;
  };
  const syncModel = () => {
    const next = composer?.trailing?.querySelector('button[aria-haspopup="menu"]') ?? null;
    const icon = next?.querySelector(":scope > svg:first-of-type") ?? null;
    if (next === modelTrigger && icon === modelIcon) return;
    clearModel();
    if (!next || !icon) return;
    modelTrigger = next;
    modelIcon = icon;
    modelTrigger.setAttribute("data-dsh-full-view-model", "");
    modelIcon.setAttribute("data-dsh-full-view-model-icon", "");
  };
  const clearComposer = () => {
    clearModel();
    processing?.remove();
    composer?.card.removeAttribute("data-dsh-processing");
    if (composer) resizeObserver?.unobserve?.(composer.seat);
    for (const [element, marker] of composerMarks) element.removeAttribute(marker);
    composerMarks = [];
    composer = null;
    surface?.chat.removeAttribute("data-dsh-chat-composer");
  };
  const syncComposer = () => {
    const seat = composerSeat();
    const card = seat?.querySelector("[data-composer-card]");
    const scroll = card?.querySelector("[data-input-scroll]");
    const row = scroll?.nextElementSibling;
    const footer = card?.nextElementSibling;
    if (composer?.seat === seat && composer?.card === card && composer?.scroll === scroll && composer?.row === row && composer?.footer === footer && composer?.tools === row?.firstElementChild && composer?.trailing === row?.lastElementChild) {
      syncModel();
      return;
    }
    clearComposer();
    if (!seat || !card || !scroll || !row) return;
    composer = { seat, card, scroll, row, footer, tools: row.firstElementChild, trailing: row.lastElementChild };
    const mark = (element, marker) => {
      if (!element) return;
      element.setAttribute(marker, "");
      composerMarks.push([element, marker]);
    };
    for (let node = seat; node && node !== surface.chat; node = node.parentElement) mark(node, "data-dsh-full-view-input-path");
    for (let node = card.parentElement; node && node !== seat; node = node.parentElement) mark(node, "data-dsh-full-view-input-shell");
    mark(card, "data-dsh-full-view-composer-card");
    mark(row, "data-dsh-full-view-input-row");
    mark(footer, "data-dsh-full-view-input-footer");
    mark(composer.tools, "data-dsh-full-view-input-tools");
    mark(composer.trailing, "data-dsh-full-view-input-trailing");
    surface.chat.setAttribute("data-dsh-chat-composer", "");
    syncModel();
    resizeObserver?.observe(seat);
  };
  const stopClock = () => {
    if (clock !== null) win.clearInterval(clock);
    clock = null;
  };
  const syncActivity = () => {
    if (!surface) return;
    activity?.setSession(sessionId);
    syncNativeWhale(doc, badge);
    const state = activity?.getSnapshot() ?? { running: false };
    const running = state.running && !state.pending && !approvalState;
    badge.toggleAttribute("data-dsh-running", running);
    badge.setAttribute("aria-label", running ? "\u6062\u590D\u804A\u5929\uFF0C\u6B63\u5728\u5904\u7406" : "\u6062\u590D\u804A\u5929");
    const input2 = editor();
    const hasDraft = !!(input2?.matches("textarea") ? input2.value : input2?.textContent)?.trim();
    const hidden = !running || !composer || hasDraft;
    composer?.card.toggleAttribute("data-dsh-processing", !hidden);
    if (processing.hidden !== hidden) processing.hidden = hidden;
    const label = processingLabel(state.startedAt, Date.now());
    if (processing.textContent !== label) processing.textContent = label;
    if (composer && processing.parentElement !== composer.scroll) composer.scroll.append(processing);
    if (running && Number.isFinite(state.startedAt)) {
      if (clock === null) clock = win.setInterval(syncActivity, 1e3);
    } else stopClock();
  };
  const resizeObserver = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(() => schedule()) : null;
  const restore = () => {
    if (!surface) return;
    if (drag) finishPointer(null, true);
    clearEdgeClick();
    stopClock();
    activity?.setSession(null);
    clearComposer();
    resizeObserver?.disconnect();
    surface.frame.removeAttribute("data-dsh-full-view");
    surface.frame.style.removeProperty("--dsh-fv-content-width");
    for (const marker of ["floating-chat", "chat-minimized", "chat-hidden", "chat-chrome", "chat-unread"]) surface.chat.removeAttribute(`data-dsh-${marker}`);
    for (const key of ["inert", "aria-hidden"]) {
      const value = savedAccessibility?.[key];
      if (value === null || value === void 0) surface.chat.removeAttribute(key);
      else surface.chat.setAttribute(key, value);
    }
    for (const key of ["x", "y", "width", "height", "collapsed-height"]) surface.chat.style.removeProperty(`--dsh-fv-${key}`);
    header?.removeAttribute("data-dsh-floating-header");
    const focusWasChrome = [badge, toolbar, ...handles].some((node) => node?.contains(doc.activeElement));
    toolbar?.remove();
    edge?.remove();
    badge?.remove();
    processing?.remove();
    for (const handle of handles) handle.remove();
    if (focusWasChrome) focusEditor();
    toolbar = resize = edge = title = minimize = header = badge = processing = null;
    handles = [];
    surface = null;
    mode = "expanded";
    minimized = false;
    approvalState = savedAccessibility = sessionId = null;
  };
  const syncApproval = () => {
    const seat = composerSeat();
    const blocked = [...surface.chat.querySelectorAll(pendingSelector)].some(belongsToConversation) || !!(seat?.childElementCount && !composer);
    if (blocked && !approvalState) {
      const previous = mode;
      approvalState = { previous };
      setMode("expanded", { force: true });
    } else if (!blocked && approvalState) {
      const previous = approvalState.previous;
      approvalState = null;
      setMode(previous, { force: true });
    }
  };
  const sync = () => {
    raf = null;
    if (disposed) return;
    const next = findSurface(doc);
    if (!next || next.chat !== surface?.chat || next.panel !== surface?.panel) {
      restore();
      if (!next) return;
      surface = next;
      savedAccessibility = Object.fromEntries(["inert", "aria-hidden"].map((key) => [key, surface.chat.getAttribute(key)]));
      sessionId = surface.chat.querySelector("[data-conversation-session]")?.getAttribute("data-conversation-session");
      buildChrome();
      surface.frame.append(badge);
      surface.frame.setAttribute("data-dsh-full-view", "");
      surface.chat.setAttribute("data-dsh-floating-chat", "");
      syncComposer();
      setMode(composerSeat() ? "compact" : "expanded");
      resizeObserver?.observe(surface.frame);
      if (surface.sidebar) resizeObserver?.observe(surface.sidebar);
    }
    if (!surface) return;
    if (toolbar.parentElement !== surface.chat) surface.chat.prepend(toolbar);
    for (const handle of handles) if (handle.parentElement !== surface.chat) surface.chat.append(handle);
    if (edge.parentElement !== surface.chat) surface.chat.append(edge);
    syncComposer();
    const nextSession = surface.chat.querySelector("[data-conversation-session]")?.getAttribute("data-conversation-session");
    if (nextSession !== sessionId) {
      sessionId = nextSession;
      approvalState = null;
      setMode(composer ? "compact" : "expanded", { force: true });
    }
    syncApproval();
    syncActivity();
    const nextHeader = surface.chat.querySelector("[data-conversation-header-leading]")?.closest("header");
    if (nextHeader !== header) {
      header?.removeAttribute("data-dsh-floating-header");
      header = nextHeader;
      header?.setAttribute("data-dsh-floating-header", "");
    }
    const currentTitle = doc.title.replace(/\s*[—–-]\s*DeepSeek Harness\s*$/, "") || "\u804A\u5929";
    if (title.textContent !== currentTitle) title.textContent = currentTitle;
    updateGeometry();
  };
  function schedule() {
    if (!disposed && raf === null) raf = win.requestAnimationFrame(sync);
  }
  const outsidePointer = (event) => {
    if (!surface || drag) return;
    if (mode === "compact" && editor()?.contains(event.target)) {
      setMode("expanded");
      return;
    }
    if (mode !== "expanded" || approvalState || withinChat(event.target) || popupOpen()) return;
    setMode("compact");
  };
  const focusChanged = (event) => {
    if (!surface) return;
    if (mode === "compact" && !returningFocus && editor()?.contains(event.target)) setMode("expanded");
    else updateGeometry();
  };
  const keydown = (event) => {
    if (!surface || event.key !== "Escape" || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return;
    if (drag) {
      event.preventDefault();
      event.stopPropagation();
      finishPointer(null, true);
      return;
    }
    if (mode !== "expanded" || approvalState || popupOpen() || !withinChat(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    setMode("compact", { focus: true });
  };
  const windowBlur = () => {
    if (drag) finishPointer(null, true);
    if (surface && mode === "expanded" && doc.activeElement?.tagName === "IFRAME" && !withinChat(doc.activeElement) && !popupOpen()) setMode("compact");
  };
  const observer = new win.MutationObserver((records) => {
    if (records.some((record) => record.type === "childList" || record.type === "characterData" || !record.attributeName.startsWith("data-dsh-"))) schedule();
  });
  observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-rightbar-fullscreen", "data-sidebar-right-panel", "data-sidebar-right-open", "data-conversation-session", "data-approval-key", "data-question-key", "data-plan-review-key", "hidden", "data-sidebar-collapsed"] });
  observer.observe(doc.head, { childList: true, subtree: true, characterData: true });
  win.addEventListener("resize", schedule);
  win.addEventListener("blur", windowBlur);
  win.visualViewport?.addEventListener("resize", schedule);
  win.visualViewport?.addEventListener("scroll", schedule);
  doc.addEventListener("pointerdown", outsidePointer, true);
  doc.addEventListener("focusin", focusChanged);
  doc.addEventListener("focusout", schedule);
  doc.addEventListener("input", schedule);
  doc.addEventListener("keydown", keydown);
  const offActivity = activity?.subscribe(schedule);
  sync();
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    offActivity?.();
    win.removeEventListener("resize", schedule);
    win.removeEventListener("blur", windowBlur);
    win.visualViewport?.removeEventListener("resize", schedule);
    win.visualViewport?.removeEventListener("scroll", schedule);
    doc.removeEventListener("pointerdown", outsidePointer, true);
    doc.removeEventListener("focusin", focusChanged);
    doc.removeEventListener("focusout", schedule);
    doc.removeEventListener("input", schedule);
    doc.removeEventListener("keydown", keydown);
    if (raf !== null) win.cancelAnimationFrame(raf);
    restore();
    sheet.remove();
    if (win[cleanupKey] === dispose) delete win[cleanupKey];
  };
  win[cleanupKey] = dispose;
  return dispose;
}
var inject = ["sidebarRight", "layout", "sessions", "uiSession"];
function apply(ctx) {
  ctx.effect(() => {
    const lifetime = new AbortController();
    let cleanup = () => {
    };
    const activity = createActivitySource(ctx);
    void fetch("/dsh-full-view/api/config", { signal: lifetime.signal }).then((response) => {
      if (!response.ok) throw new Error(`dsh-full-view config: HTTP ${response.status}`);
      return response.json();
    }).then((config) => {
      if (!lifetime.signal.aborted) cleanup = installFullView(document, config, activity);
    }).catch((error) => {
      if (!lifetime.signal.aborted) console.error("[dsh-full-view] \u65E0\u6CD5\u52A0\u8F7D\u5B8C\u6574\u89C6\u56FE\u914D\u7F6E", error);
    });
    return () => {
      lifetime.abort();
      cleanup();
      activity.dispose();
    };
  }, "dsh-full-view: resident chat presentation");
}

return {apply:module.exports.apply,inject:module.exports.inject};}});
