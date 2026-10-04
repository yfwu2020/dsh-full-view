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
  min-width: 0; min-height: 0; z-index: 50; display: flex !important; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #202124);
  border: 1px solid var(--dsw-alias-border-l3, #ddd) !important; border-radius: 14px;
  box-shadow: 0 12px 40px #0002, 0 2px 8px #0001; overflow: hidden;
  --dsh-frame-leading-clearance: 0px;
  animation: dsh-fv-appear 180ms ease-out;
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
}
[data-dsh-full-view-title] { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
[data-dsh-full-view-toolbar] button {
  flex: none; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; border-radius: 6px; cursor: pointer; color: var(--dsw-alias-label-secondary, #666);
}
[data-dsh-full-view-toolbar] button:hover { background: var(--dsw-alias-interactive-bg-hover, #0001); }
[data-dsh-full-view-toolbar] button:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: -2px; }
[data-dsh-full-view-toolbar] svg { width: 15px; height: 15px; }
[data-dsh-floating-chat][data-dsh-chat-minimized] { height: 36px !important; }
[data-dsh-floating-chat][data-dsh-chat-minimized]:not([data-dsh-chat-composer]) > :not([data-dsh-full-view-toolbar]):not([data-dsh-full-view-edge]) { display: none !important; }
[data-dsh-full-view-resize] { position: absolute; width: 16px; height: 16px; bottom: 1px; right: 1px; z-index: 2; cursor: nwse-resize; touch-action: none; }
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
[data-dsh-floating-chat] [data-input-scroll] { grid-column: 2; grid-row: 1; min-width: 0; margin: 0 !important; max-height: 144px; }
[data-dsh-floating-chat] [data-composer-input] { min-height: 24px !important; padding: 0 4px !important; font-size: 14px; line-height: 24px; }
[data-dsh-floating-chat] [data-composer-placeholder] { inset: 0 4px auto !important; line-height: 24px; font-size: 14px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-row] {
  display: contents !important; --dsh-composer-model-text-display: none; --dsh-composer-model-icon-display: block;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; grid-row: 1; gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 3; grid-row: 1; gap: 4px !important; margin: 0 !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button[aria-label]:has(> span[aria-hidden="true"] > svg) > span:not([aria-hidden="true"]) { display: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] button[aria-label]:has(> span[aria-hidden="true"] > svg) { padding-inline: 4px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] > div,
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] > div { gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] button { max-height: 32px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] > button { transform: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] > :not([data-input-scroll]):not([data-dsh-full-view-input-row]) { grid-column: 1 / -1; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] { height: var(--dsh-fv-collapsed-height, 48px) !important; border-radius: 24px; overflow: visible; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-toolbar] { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-resize] { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-input-path] { display: flex !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path] { box-sizing: border-box; width: 100% !important; height: auto !important; min-height: 0 !important; flex: none !important; overflow: visible !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path]:not([data-composer-seat]) > :not([data-dsh-full-view-input-path]) { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-footer] { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-composer-seat] { background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-composer-card] { box-shadow: none !important; background: transparent; }
[data-dsh-fv-dragging] { user-select: none; cursor: grabbing; }
[data-dsh-fv-dragging] iframe { pointer-events: none !important; }
@keyframes dsh-fv-appear { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { [data-dsh-floating-chat] { animation: none; } }
`;

// src/client/index.js
var geometryKey = "dsh.full-view.geometry.v1";
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
function installFullView(doc, input = {}) {
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
  let edge = null;
  let composer = null;
  let composerMarks = [];
  let collapsedHeight = 48;
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
    const left = Math.min(box.width, Math.max(0, (sidebar?.right ?? box.left) - box.left));
    const chromeTop = Number.parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue("--dsh-frame-chrome-top")) || 0;
    return { left, top: chromeTop, width: box.width - left, height: box.height - chromeTop };
  };
  const geometry = () => {
    const b = bounds();
    const gap = Math.min(config.edgeGap, Math.max(0, Math.min(b.width, b.height) / 8));
    const width = Math.max(0, Math.min(Math.max(280, preferred.width), b.width - 2 * gap));
    const height = Math.max(0, Math.min(Math.max(240, preferred.height), b.height - 2 * gap));
    const visibleHeight = minimized ? composer ? collapsedHeight : 36 : height;
    const offset = minimized && composer ? height - visibleHeight : 0;
    return {
      width,
      height,
      x: Math.min(Math.max(preferred.x ?? b.left + b.width - width - gap, b.left + gap), b.left + b.width - width - gap),
      y: Math.min(Math.max(preferred.y === void 0 ? b.top + b.height - visibleHeight - gap : preferred.y + offset, b.top + gap), b.top + b.height - visibleHeight - gap)
    };
  };
  const persist = () => {
    if (!config.rememberGeometry) return;
    try {
      win.localStorage.setItem(geometryKey, JSON.stringify(preferred));
    } catch {
    }
  };
  const updateGeometry = () => {
    if (!surface) return;
    if (composer) {
      collapsedHeight = Math.max(48, composer.seat.getBoundingClientRect().height + 2);
      setStyle(surface.chat, "--dsh-fv-collapsed-height", `${collapsedHeight}px`);
    }
    const b = bounds();
    const g = geometry();
    setStyle(surface.frame, "--dsh-fv-content-width", `${b.width}px`);
    for (const [key, value] of Object.entries(g)) setStyle(surface.chat, `--dsh-fv-${key}`, `${value}px`);
  };
  const returnSplit = () => {
    const button2 = surface?.panel.querySelector('[data-sidebar-right-mode="push"]') ?? surface?.panel.querySelector("[data-sidebar-right-mode]");
    button2?.click();
  };
  const toggleMinimize = () => {
    minimized = !minimized;
    surface?.chat.toggleAttribute("data-dsh-chat-minimized", minimized);
    minimize.setAttribute("aria-label", minimized ? "\u5C55\u5F00\u804A\u5929" : "\u6536\u8D77\u804A\u5929");
    minimize.setAttribute("title", minimized ? "\u5C55\u5F00\u804A\u5929" : "\u6536\u8D77\u804A\u5929");
    minimize.setAttribute("aria-expanded", String(!minimized));
    edge.setAttribute("aria-label", minimized ? "\u5C55\u5F00\u804A\u5929" : "\u6536\u8D77\u804A\u5929");
    edge.title = minimized ? "\u70B9\u51FB\u5916\u7F18\u5C55\u5F00\u804A\u5929\uFF0C\u62D6\u52A8\u79FB\u52A8" : "\u70B9\u51FB\u5916\u7F18\u6536\u8D77\u804A\u5929\uFF0C\u62D6\u52A8\u79FB\u52A8";
    edge.setAttribute("aria-expanded", String(!minimized));
    updateGeometry();
  };
  const pointerDown = (event) => {
    if (event.button !== 0 || event.currentTarget !== edge && event.target.closest("button")) return;
    event.preventDefault();
    const target = event.currentTarget;
    const g = geometry();
    drag = { target, pointerId: event.pointerId, resize: target === resize, startX: event.clientX, startY: event.clientY, geometry: g };
    if (target === edge) suppressEdgeClick = false;
    target.setPointerCapture(event.pointerId);
    surface.frame.setAttribute("data-dsh-fv-dragging", "");
  };
  const pointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.target === edge && Math.hypot(dx, dy) > 4) suppressEdgeClick = true;
    const offset = minimized && composer ? drag.geometry.height - collapsedHeight : 0;
    preferred = drag.resize ? { ...drag.geometry, width: drag.geometry.width + dx, height: drag.geometry.height + dy } : { ...drag.geometry, x: drag.geometry.x + dx, y: drag.geometry.y + dy - offset };
    const constrained = geometry();
    preferred = { ...constrained, y: constrained.y - offset };
    updateGeometry();
  };
  const pointerEnd = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const held = drag;
    drag = null;
    surface?.frame.removeAttribute("data-dsh-fv-dragging");
    if (held.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId);
    persist();
  };
  const button = (label, marker, path, handler) => {
    const element = doc.createElement("button");
    element.type = "button";
    element.setAttribute("aria-label", label);
    element.title = label;
    element.setAttribute(marker, "");
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${path}"/></svg>`;
    element.addEventListener("click", handler);
    return element;
  };
  const buildChrome = () => {
    toolbar = doc.createElement("div");
    toolbar.setAttribute("data-dsh-full-view-toolbar", "");
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "\u804A\u5929\u5C0F\u7A97");
    title = doc.createElement("span");
    title.setAttribute("data-dsh-full-view-title", "");
    title.textContent = "\u804A\u5929";
    minimize = button("\u6536\u8D77\u804A\u5929", "data-dsh-minimize-chat", "M5 12h14", toggleMinimize);
    minimize.setAttribute("aria-expanded", "true");
    toolbar.append(title, minimize, button("\u8FD4\u56DE\u5206\u680F\u89C6\u56FE", "data-dsh-return-split", "M4 5h16v14H4z M10 5v14", returnSplit));
    edge = doc.createElement("button");
    edge.type = "button";
    edge.setAttribute("data-dsh-full-view-edge", "");
    edge.setAttribute("aria-label", "\u6536\u8D77\u804A\u5929");
    edge.setAttribute("aria-expanded", "true");
    edge.title = "\u70B9\u51FB\u5916\u7F18\u6536\u8D77\u804A\u5929\uFF0C\u62D6\u52A8\u79FB\u52A8";
    for (const side of ["top", "right", "bottom", "left"]) {
      const segment = doc.createElement("span");
      segment.setAttribute("data-dsh-edge-side", side);
      segment.setAttribute("aria-hidden", "true");
      edge.append(segment);
    }
    edge.addEventListener("click", () => {
      if (suppressEdgeClick) {
        suppressEdgeClick = false;
        return;
      }
      toggleMinimize();
    });
    resize = doc.createElement("div");
    resize.setAttribute("data-dsh-full-view-resize", "");
    resize.setAttribute("role", "separator");
    resize.setAttribute("aria-label", "\u8C03\u6574\u804A\u5929\u5C0F\u7A97\u5927\u5C0F\uFF0C\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5C3A\u5BF8");
    resize.title = "\u62D6\u52A8\u8C03\u6574\u5927\u5C0F\uFF0C\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5C3A\u5BF8";
    resize.tabIndex = 0;
    resize.addEventListener("dblclick", () => {
      preferred = { ...geometry(), width: config.chatWidth, height: config.chatHeight };
      updateGeometry();
      persist();
    });
    resize.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const g = geometry();
      const step = event.shiftKey ? 48 : 16;
      preferred = { ...g, width: g.width + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0), height: g.height + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0) };
      updateGeometry();
      persist();
    });
    for (const element of [toolbar, resize, edge]) {
      element.addEventListener("pointerdown", pointerDown);
      element.addEventListener("pointermove", pointerMove);
      element.addEventListener("pointerup", pointerEnd);
      element.addEventListener("pointercancel", pointerEnd);
      element.addEventListener("lostpointercapture", pointerEnd);
    }
    toolbar.addEventListener("dblclick", (event) => {
      if (event.target.closest("button")) return;
      preferred = { width: config.chatWidth, height: config.chatHeight };
      updateGeometry();
      persist();
    });
  };
  const clearComposer = () => {
    if (composer) resizeObserver?.unobserve?.(composer.seat);
    for (const [element, marker] of composerMarks) element.removeAttribute(marker);
    composerMarks = [];
    composer = null;
    surface?.chat.removeAttribute("data-dsh-chat-composer");
  };
  const syncComposer = () => {
    const seat = surface.chat.querySelector("[data-composer-seat]");
    const card = seat?.querySelector("[data-composer-card]");
    const scroll = card?.querySelector("[data-input-scroll]");
    const row = scroll?.nextElementSibling;
    const footer = card?.nextElementSibling;
    if (composer?.seat === seat && composer?.card === card && composer?.row === row && composer?.footer === footer && composer?.tools === row?.firstElementChild && composer?.trailing === row?.lastElementChild) return;
    clearComposer();
    if (!seat || !card || !scroll || !row) return;
    composer = { seat, card, row, footer, tools: row.firstElementChild, trailing: row.lastElementChild };
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
    resizeObserver?.observe(seat);
  };
  const resizeObserver = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(() => schedule()) : null;
  const restore = () => {
    if (!surface) return;
    if (drag) pointerEnd({ pointerId: drag.pointerId });
    clearComposer();
    resizeObserver?.disconnect();
    surface.frame.removeAttribute("data-dsh-full-view");
    surface.frame.style.removeProperty("--dsh-fv-content-width");
    surface.chat.removeAttribute("data-dsh-floating-chat");
    surface.chat.removeAttribute("data-dsh-chat-minimized");
    surface.chat.style.removeProperty("--dsh-fv-collapsed-height");
    for (const key of ["x", "y", "width", "height"]) surface.chat.style.removeProperty(`--dsh-fv-${key}`);
    header?.removeAttribute("data-dsh-floating-header");
    toolbar?.remove();
    resize?.remove();
    edge?.remove();
    toolbar = resize = edge = title = minimize = header = null;
    surface = null;
    minimized = false;
  };
  const sync = () => {
    raf = null;
    if (disposed) return;
    const next = findSurface(doc);
    if (!next || next.chat !== surface?.chat || next.panel !== surface?.panel) {
      restore();
      if (!next) return;
      surface = next;
      buildChrome();
      surface.frame.setAttribute("data-dsh-full-view", "");
      surface.chat.setAttribute("data-dsh-floating-chat", "");
      syncComposer();
      if (composer) toggleMinimize();
      resizeObserver?.observe(surface.frame);
      if (surface.sidebar) resizeObserver?.observe(surface.sidebar);
    }
    if (!surface) return;
    if (toolbar.parentElement !== surface.chat) surface.chat.prepend(toolbar);
    if (resize.parentElement !== surface.chat) surface.chat.append(resize);
    if (edge.parentElement !== surface.chat) surface.chat.append(edge);
    syncComposer();
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
  const observer = new win.MutationObserver((records) => {
    if (records.some((record) => record.type === "childList" || !record.attributeName.startsWith("data-dsh-"))) schedule();
  });
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-rightbar-fullscreen", "data-sidebar-right-panel", "data-sidebar-right-open", "data-conversation-session", "hidden", "data-sidebar-collapsed"] });
  win.addEventListener("resize", schedule);
  sync();
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    win.removeEventListener("resize", schedule);
    if (raf !== null) win.cancelAnimationFrame(raf);
    restore();
    sheet.remove();
    if (win[cleanupKey] === dispose) delete win[cleanupKey];
  };
  win[cleanupKey] = dispose;
  return dispose;
}
var inject = ["sidebarRight", "layout"];
function apply(ctx) {
  ctx.effect(() => {
    const lifetime = new AbortController();
    let cleanup = () => {
    };
    void fetch("/dsh-full-view/api/config", { signal: lifetime.signal }).then((response) => {
      if (!response.ok) throw new Error(`dsh-full-view config: HTTP ${response.status}`);
      return response.json();
    }).then((config) => {
      if (!lifetime.signal.aborted) cleanup = installFullView(document, config);
    }).catch((error) => {
      if (!lifetime.signal.aborted) console.error("[dsh-full-view] \u65E0\u6CD5\u52A0\u8F7D\u5B8C\u6574\u89C6\u56FE\u914D\u7F6E", error);
    });
    return () => {
      lifetime.abort();
      cleanup();
    };
  }, "dsh-full-view: resident chat presentation");
}

return {apply:module.exports.apply,inject:module.exports.inject};}});
