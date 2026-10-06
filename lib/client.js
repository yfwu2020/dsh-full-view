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
var defaults = Object.freeze({ chatWidth: 400, chatHeight: 540, edgeGap: 20, rememberGeometry: true, compactIdleSeconds: 90 });
function resolveConfig(input = {}) {
  const config = { ...defaults, ...input };
  for (const [key, min, max] of [["chatWidth", 280, 800], ["chatHeight", 240, 1e3], ["edgeGap", 0, 64], ["compactIdleSeconds", 0, 3600]]) {
    if (!Number.isFinite(config[key]) || config[key] < min || config[key] > max) throw new Error(`dsh-full-view: ${key} must be between ${min} and ${max}`);
  }
  if (typeof config.rememberGeometry !== "boolean") throw new Error("dsh-full-view: rememberGeometry must be a boolean");
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, config[key]]));
}

// src/client/style.js
var brainGlyph = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-1.2-2.7-5-2.6-6.2.5C3 5.5 2 8.2 3.2 10.3c-2.2 2.6-1.2 6.2 1.6 7.1-.1 3.7 4.8 5.3 7.2 2.6 2.4 2.7 7.3 1.1 7.2-2.6 2.8-.9 3.8-4.5 1.6-7.1 1.2-2.1.2-4.8-2.6-4.8C17 2.4 13.2 2.3 12 5Z M12 5v15 M5.8 5.5c-.5 1.7.2 3.3 1.8 4 M18.2 5.5c.5 1.7-.2 3.3-1.8 4 M3.2 10.3c1.6-.8 3.2-.2 4.2 1.3 M20.8 10.3c-1.6-.8-3.2-.2-4.2 1.3 M4.8 17.4c1.9.4 3.5-.6 3.6-2.3 M19.2 17.4c-1.9.4-3.5-.6-3.6-2.3"/></svg>');
var style = `
[data-dsh-full-view] > [data-rightbar-col] { grid-column: 3; }
/* Keep official shell.overlay entries above fullscreen dock (40), chat (50), and DockKit floats (60).
   Raising a plugin's child z-index cannot escape the host overlay's original stacking context (20). */
[data-dsh-full-view] > [data-shell-overlay] { z-index: 70; }
/* Hide only the persistent explanation capsule (including its collapsed ball).
   Selection/quote buttons and the explanation dialog stay available. */
[data-dsh-full-view] > [data-shell-overlay] .dsh-sel-layer .dsh-sel-pill { display: none !important; }
[data-dsh-full-view] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open] {
  width: var(--dsh-fv-content-width) !important;
  max-width: var(--dsh-fv-content-width) !important;
  --dsh-sidebar-width: var(--dsh-fv-content-width) !important;
}
[data-dsh-full-view]:not([data-sidebar-collapsed]) [data-sidebar-right-panel="fullscreen"] [data-dockkit-host="dock"][data-dockkit-column="0"] {
  /* Only an expanded sidebar already clears the traffic lights. When collapsed,
     defer to the host's platform/native-fullscreen clearance instead. */
  --dsh-dockkit-strip-inline-start: 10px !important;
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
  transition: top 280ms cubic-bezier(.22, 1, .36, 1), height 280ms cubic-bezier(.22, 1, .36, 1), border-radius 240ms ease, box-shadow 160ms ease;
  transform-origin: bottom right;
}
[data-dsh-floating-chat] > :not([data-dsh-full-view-toolbar]):not([data-dsh-full-view-resize]):not([data-dsh-full-view-edge]):not([data-dsh-compact-recycle]) {
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
/* The native conversation scrollport also contains the composer. Release its
   stable gutter in both shapes so the input keeps the same available width. */
[data-dsh-floating-chat] [data-conversation-scroll],
[data-dsh-floating-chat] [data-input-scroll] { scrollbar-width: none !important; scrollbar-gutter: auto !important; }
[data-dsh-floating-chat] [data-conversation-scroll] { margin-right: 0 !important; }
[data-dsh-floating-chat] [data-conversation-scroll]::-webkit-scrollbar,
[data-dsh-floating-chat] [data-input-scroll]::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
[data-dsh-full-view-toolbar] {
  box-sizing: border-box; min-height: 36px; height: 36px; flex: none; padding: 0 8px 0 12px;
  display: flex; align-items: center; gap: 6px; cursor: grab; touch-action: none;
  user-select: none; -webkit-app-region: no-drag; border-bottom: .5px solid var(--dsw-alias-border-l3, #ddd);
  background: var(--dsw-alias-bg-base, #fff); box-shadow: none !important; font: 12px/1.4 system-ui, sans-serif;
  transition: opacity 160ms ease, display 160ms allow-discrete;
}
[data-dsh-full-view-toolbar] [data-dsh-full-view-title] {
  cursor: inherit; flex: 1; min-width: 0; padding: 0; border: 0; font: inherit; color: inherit;
  background: transparent !important; box-shadow: none !important;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
[data-dsh-full-view-toolbar] button {
  flex: none; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 0; border-radius: 6px; cursor: pointer; color: var(--dsw-alias-label-secondary, #666);
}
[data-dsh-full-view-toolbar] button:hover { background: var(--dsw-alias-interactive-bg-hover, #0001); }
[data-dsh-full-view-toolbar] [data-dsh-pin-chat][aria-pressed="true"] {
  color: var(--dsw-alias-brand-primary, #3970e8); background: color-mix(in srgb, currentColor 14%, transparent);
}
[data-dsh-full-view-toolbar] button:focus-visible,
[data-dsh-full-view-title]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: -2px; }
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
[data-dsh-chat-minimized] [data-dsh-full-view-edge],
[data-dsh-chat-minimized] [data-dsh-edge-side] { cursor: grab; }
/* Grow compact targets outward: retain just 6px inside the composer so native
   inputs and action buttons stay reachable. End caps belong to width resizing. */
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-edge-side="top"] { top: -6px; height: 12px; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-edge-side="bottom"] { bottom: -6px; height: 12px; }
[data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-resize-direction="w"],
[data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-resize-direction="e"] { top: 0; bottom: 0; width: 8px; }
[data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-resize-direction="w"] { left: -2px; }
[data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-resize-direction="e"] { right: -2px; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized]:has([data-dsh-edge-side]:hover) {
  box-shadow: 0 12px 40px #0003, 0 2px 8px #0002;
}
[data-dsh-compact-recycle] {
  position: absolute; z-index: 5; left: 50%; top: -9px; transform: translateX(-50%);
  box-sizing: border-box; width: 48px; height: 18px; flex: none; display: none; align-items: center; justify-content: center;
  padding: 0; border: 0; background: transparent; border-radius: 6px; cursor: pointer; touch-action: manipulation; -webkit-app-region: no-drag;
}
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-compact-recycle] { display: flex; }
[data-dsh-compact-recycle]::before {
  content: ''; width: 28px; height: 3px; border-radius: 2px; background: var(--dsw-alias-label-tertiary, #8b909a);
  transition: width 150ms ease, background 150ms ease;
}
[data-dsh-compact-recycle]:hover:not(:disabled)::before { width: 34px; background: var(--dsw-alias-label-primary, #202124); }
[data-dsh-compact-recycle]:disabled { cursor: default; opacity: .4; }
[data-dsh-compact-recycle]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: -2px; }
[data-dsh-floating-chat] [data-composer-seat] { padding: 3px; box-sizing: border-box; }
[data-dsh-floating-chat] [data-dsh-full-view-input-shell] { padding: 0 !important; gap: 0 !important; margin: 0 !important; }
[data-dsh-floating-chat] [data-dsh-full-view-composer-card] {
  display: grid !important; grid-template-columns: auto minmax(40px, 1fr) auto; grid-auto-flow: row dense; align-items: center;
  gap: 4px !important; padding: 4px !important; min-height: 40px; border-radius: 22px !important;
  max-width: 100% !important; background: var(--dsw-alias-bg-base, #fff);
}
[data-dsh-floating-chat] [data-input-scroll] { position: relative; grid-column: 2; min-width: 0; margin: 0 !important; max-height: 144px; }
[data-dsh-floating-chat] [data-composer-input] { min-height: 24px !important; padding: 0 4px !important; font-size: 14px; line-height: 24px; }
[data-dsh-floating-chat] [data-composer-placeholder] { inset: 0 4px auto !important; line-height: 24px; font-size: 14px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-row] {
  display: contents !important; --dsh-composer-model-text-display: none; --dsh-composer-model-icon-display: block;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 3; gap: 4px !important; margin: 0 !important; }
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
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] { height: var(--dsh-fv-collapsed-height, 48px) !important; border-radius: 24px; overflow: visible !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-toolbar] { display: none !important; opacity: 0; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-resize]:not([data-dsh-resize-direction="e"]):not([data-dsh-resize-direction="w"]) { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-input-path] { display: flex !important; position: absolute !important; inset: auto 0 0; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path] { box-sizing: border-box; width: 100% !important; height: auto !important; min-height: 0 !important; flex: none !important; overflow: visible !important; background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path]:not([data-composer-seat]) > :not([data-dsh-full-view-input-path]) { display: none !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-footer] { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-composer-seat] { background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-composer-card] { box-shadow: none !important; background: transparent; }
[data-dsh-full-view-toolbar] button:disabled { opacity: .35; cursor: default; }
[data-dsh-floating-chat][data-dsh-chat-hidden] { opacity: 0; visibility: hidden; pointer-events: none; transition: none; }
[data-dsh-restore-chat] {
  position: absolute; z-index: 51; box-sizing: border-box; width: 40px; height: 40px;
  appearance: none; display: flex; align-items: center; justify-content: center; padding: 7px;
  border: 1px solid var(--dsw-alias-border-l3, #ddd); border-radius: 50% !important; corner-shape: round;
  color: var(--dsw-focus-ring-color, #5686fe); background: var(--dsw-alias-bg-base, #fff);
  box-shadow: 0 4px 18px #0002; cursor: pointer; touch-action: none; -webkit-app-region: no-drag;
  transition: none;
}
/* The shell alone changes size; the host messages and editor never reflow. */
[data-dsh-whale-morph-shell] {
  position: absolute; z-index: 49; box-sizing: border-box; pointer-events: none;
  background: var(--dsw-alias-bg-base, #fff); border: 1px solid var(--dsw-alias-border-l3, #ddd);
  box-shadow: 0 12px 40px #0002, 0 2px 8px #0001; overflow: hidden;
  will-change: left, top, width, height, border-radius;
}
[data-dsh-floating-chat][data-dsh-whale-morphing] {
  background: transparent !important; border-color: transparent !important; box-shadow: none !important;
  opacity: var(--dsh-morph-content-opacity, 1) !important; visibility: visible !important;
  transform: translate(var(--dsh-morph-content-x, 0px), var(--dsh-morph-content-y, 0px)) !important;
  clip-path: inset(0 var(--dsh-morph-clip-right, 0px) var(--dsh-morph-clip-bottom, 0px) 0 round var(--dsh-morph-radius, 14px));
  transition: none !important; animation: none !important; pointer-events: none !important;
}
[data-dsh-restore-chat][data-dsh-whale-morphing] {
  opacity: var(--dsh-morph-whale-opacity, 0) !important; visibility: visible !important;
  transform: translate(var(--dsh-morph-whale-x, 0px), var(--dsh-morph-whale-y, 0px)) !important; transition: none !important;
}
[data-dsh-whale-icon] {
  display: block; width: 24px; height: 24px; background: currentColor;
  mask: var(--dsh-fv-whale-still, linear-gradient(transparent, transparent)) center / contain no-repeat alpha;
}
/* Same theme tokens as the native workspace StateDot; stay inside the ball. */
[data-dsh-whale-status] {
  position: absolute; top: 7px; right: 7px; width: 6px; height: 6px;
  border-radius: 50%; corner-shape: round; background: currentColor; pointer-events: none;
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-base, #fff);
}
[data-dsh-whale-status][hidden] { display: none !important; }
[data-dsh-whale-status][data-state="ongoing"] { color: var(--dsw-alias-label-tertiary); }
[data-dsh-whale-status][data-state="done"] { color: var(--dsw-alias-state-success-primary); }
[data-dsh-whale-status][data-state="warning"] { color: var(--dsw-alias-state-warn-primary); }
[data-dsh-whale-status][data-state="idle"] { color: var(--dsw-alias-state-idle-primary); }
@media (prefers-reduced-motion: no-preference) and (forced-colors: none) {
  [data-dsh-restore-chat][data-dsh-running] [data-dsh-whale-icon] {
    mask-image: var(--dsh-fv-whale-motion);
    /* Native APNG is 28px, intended for a 14px glyph on a 2x display. */
    mask-size: 14px 14px;
  }
}
[data-dsh-restore-chat][hidden] { display: flex !important; opacity: 0; visibility: hidden; pointer-events: none; }
[data-dsh-processing-status][hidden] { display: none !important; }
[data-dsh-restore-chat]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: 2px; }
[data-dsh-processing] [data-composer-placeholder] { visibility: hidden !important; }
[data-dsh-processing-status] {
  position: absolute; inset: 0 4px auto; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  color: var(--dsw-alias-label-secondary, #666); font: 14px/24px system-ui, sans-serif;
  pointer-events: none;
}
[data-dsh-fv-dragging] { user-select: none; cursor: grabbing; }
[data-dsh-fv-dragging] [data-dsh-full-view-toolbar] { cursor: grabbing; }
[data-dsh-fv-dragging] [data-dsh-full-view-edge],
[data-dsh-fv-dragging] [data-dsh-edge-side] { cursor: grabbing; }
[data-dsh-fv-dragging] [data-dsh-floating-chat], [data-dsh-fv-dragging] [data-dsh-restore-chat] { transition: none; }
[data-dsh-fv-dragging] iframe { pointer-events: none !important; }
@container dsh-floating-chat (max-width: 320px) {
  [data-dsh-floating-chat] [data-dsh-full-view-composer-card] { grid-template-columns: minmax(0, 1fr) auto !important; }
  [data-dsh-floating-chat] [data-input-scroll] { grid-column: 1 / -1; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 2; }
}
@starting-style {
  [data-dsh-full-view-toolbar] { opacity: 0; }
}
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
      const pendingKind = state?.pendingInteraction?.kind ?? null;
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
      return {
        running,
        pending,
        pendingKind,
        completed: !running && (state?.completionUnread === true || !!completed),
        completionId: completed ? JSON.stringify([end.data.turn, end.time]) : null,
        completionUnread: state?.completionUnread === true,
        startedAt
      };
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
var nativeStill = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M8.844 13.742C8.967 12.328 8.45 10.4 8.45 9.65C8.45 8.94 8.88 8.43 9.6 8.43C11.285 8.43 12.106 8.281 12.685 8.104C13.71 7.791 14.585 6.768 15.055 5.945C15.137 5.803 14.99 5.641 14.829 5.671C13.829 5.86 12.828 5.376 11.827 4.978C10.659 4.514 9.491 4.707 8.935 4.876C8.805 4.915 8.658 4.819 8.636 4.686C8.468 3.643 7.405 2.615 5.498 2.238C4.54 2.048 3.748 1.574 3.347 1.202C3.252 1.113 3.088 1.125 3.03 1.242C2.628 2.059 2.168 3.82 5.248 6.115C5.82 6.494 6.31 6.785 6.574 7.637C6.72 8.104 6.157 9.168 6.061 9.368C5.157 11.27 5.089 12.19 4.926 13.742" stroke="currentColor" stroke-width="1"/></svg>')}")`;
function syncNativeWhale(doc, badge) {
  if (badge.style.getPropertyValue("--dsh-fv-whale-still") !== nativeStill) badge.style.setProperty("--dsh-fv-whale-still", nativeStill);
  const motion = doc.querySelector(hostSheet)?.textContent.match(/mask:\s*url\((data:image\/png;base64,[A-Za-z0-9+/=]+)\)/)?.[1];
  if (motion && badge.style.getPropertyValue("--dsh-fv-whale-motion") !== `url("${motion}")`) badge.style.setProperty("--dsh-fv-whale-motion", `url("${motion}")`);
}

// src/client/morph.js
var clamp = (value) => Math.max(0, Math.min(1, value));
var ease = (value) => 1 - (1 - clamp(value)) ** 3;
var mix = (from, to, progress) => from + (to - from) * progress;
function createWhaleMorph(win) {
  let active = null;
  let raf = null;
  const clearFrame = () => {
    if (raf !== null) win.cancelAnimationFrame(raf);
    raf = null;
  };
  const cancel = () => {
    clearFrame();
    if (!active) return;
    active.shell.remove();
    for (const node of [active.chat, active.badge]) node.removeAttribute("data-dsh-whale-morphing");
    for (const key of ["content-opacity", "content-x", "content-y", "clip-right", "clip-bottom", "radius"]) active.chat.style.removeProperty(`--dsh-morph-${key}`);
    for (const key of ["whale-opacity", "whale-x", "whale-y"]) active.badge.style.removeProperty(`--dsh-morph-${key}`);
    active = null;
  };
  const finish = () => {
    const onFinish = active?.onFinish;
    cancel();
    onFinish?.();
  };
  const start = ({ frame, chat, badge, full, ball, hide, onFinish }) => {
    if (!win.matchMedia || win.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancel();
      return false;
    }
    clearFrame();
    const previous = active;
    const shell = previous?.shell ?? win.document.createElement("div");
    shell.setAttribute("data-dsh-whale-morph-shell", "");
    shell.setAttribute("aria-hidden", "true");
    if (!previous) frame.append(shell);
    badge.style.setProperty("--dsh-morph-whale-x", `${ball.x - parseFloat(badge.style.left)}px`);
    badge.style.setProperty("--dsh-morph-whale-y", `${ball.y - parseFloat(badge.style.top)}px`);
    const from = previous?.box ?? (hide ? full : ball);
    const to = hide ? ball : full;
    const initialContent = previous?.contentOpacity ?? (hide ? 1 : 0);
    const initialWhale = previous?.whaleOpacity ?? (hide ? 0 : 1);
    active = { shell, chat, badge, box: from, contentOpacity: initialContent, whaleOpacity: initialWhale, onFinish };
    chat.setAttribute("data-dsh-whale-morphing", "");
    badge.setAttribute("data-dsh-whale-morphing", "");
    const render = (progress) => {
      const geometry = ease(hide ? (progress - 0.07) / 0.93 : progress);
      const box = Object.fromEntries(["x", "y", "width", "height", "radius"].map((key) => [key, mix(from[key], to[key], geometry)]));
      const contentOpacity = mix(initialContent, hide ? 0 : 1, ease(hide ? progress / 0.24 : (progress - 0.76) / 0.24));
      const whaleOpacity = mix(initialWhale, hide ? 1 : 0, ease(hide ? (progress - 0.65) / 0.35 : progress / 0.35));
      Object.assign(shell.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px`, borderRadius: `${box.radius}px` });
      chat.style.setProperty("--dsh-morph-content-opacity", String(contentOpacity));
      chat.style.setProperty("--dsh-morph-content-x", `${box.x - full.x}px`);
      chat.style.setProperty("--dsh-morph-content-y", `${box.y - full.y}px`);
      chat.style.setProperty("--dsh-morph-clip-right", `${Math.max(0, full.width - box.width)}px`);
      chat.style.setProperty("--dsh-morph-clip-bottom", `${Math.max(0, full.height - box.height)}px`);
      chat.style.setProperty("--dsh-morph-radius", `${box.radius}px`);
      badge.style.setProperty("--dsh-morph-whale-opacity", String(whaleOpacity));
      Object.assign(active, { box, contentOpacity, whaleOpacity });
    };
    render(0);
    let startedAt = null;
    const tick = (now) => {
      if (!active) return;
      if (startedAt === null) startedAt = now;
      const progress = clamp((now - startedAt) / 440);
      render(progress);
      if (progress === 1) {
        finish();
        return;
      }
      raf = win.requestAnimationFrame(tick);
    };
    raf = win.requestAnimationFrame(tick);
    return true;
  };
  return { start, cancel, finish, get running() {
    return !!active;
  } };
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
  const morph = createWhaleMorph(win);
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
  let morphViewport = "";
  let sessionId = null;
  const completionReminders = /* @__PURE__ */ new Map();
  let suppressChromeClick = false;
  let edgeClickTimer = null;
  let idleTimer = null;
  let composing = false;
  let mode = "expanded";
  let edge = null;
  let compactRecycle = null;
  let composer = null;
  let composerMarks = [];
  let modelTrigger = null;
  let modelIcon = null;
  let collapsedHeight = 48;
  let returningFocus = false;
  let suppressEdgeClick = false;
  let title = null;
  let minimize = null;
  let pin = null;
  let pinned = false;
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
    const visibleHeight = Math.min(height, !minimized ? height : composer ? collapsedHeight : 36);
    const offset = minimized && composer ? height - visibleHeight : 0;
    const clamp2 = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));
    return {
      width,
      height,
      visibleHeight,
      offset,
      x: clamp2(preferred.x ?? b.left + b.width - width - gap, b.left + gap - (mode === "hidden" ? Math.max(0, width - 40) : 0), b.left + b.width - width - gap),
      y: clamp2(preferred.y === void 0 ? b.top + b.height - visibleHeight - gap : preferred.y + offset, b.top + gap - (mode === "hidden" ? Math.max(0, visibleHeight - 40) : 0), b.top + b.height - visibleHeight - gap)
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
      const pending = [...surface?.chat.querySelectorAll(pendingSelector) ?? []].find(belongsToConversation);
      const target = pending?.querySelector('textarea, input:not([type="hidden"]):not(:disabled), [contenteditable="true"]') ?? pending?.querySelector('button:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? editor();
      target?.focus({ preventScroll: true });
    } finally {
      returningFocus = false;
    }
  };
  const withinChat = (node) => node instanceof win.Node && surface?.chat.contains(node);
  const eventWithinChat = (event) => withinChat(event.target) || !!surface?.chat && event.composedPath?.().includes(surface.chat);
  const withinExplanation = (node) => node instanceof win.Element && Boolean(node.closest(".dsh-sel-layer .dsh-sel-btn, .dsh-sel-layer .dsh-sel-panel"));
  const popupSelector = '[role="dialog"], [role="menu"], [role="listbox"], [data-trigger-menu], [data-overlay-owner], [data-content-search-bar], [data-approval-key], [data-question-key], [data-plan-review-key]';
  const popupOpen = ({ ignoreExplanation = false } = {}) => [...doc.querySelectorAll(popupSelector)].some((node) => {
    if (ignoreExplanation && node.closest(".dsh-sel-layer .dsh-sel-panel, .dsh-sel-layer .dsh-sel-history")) return false;
    if (node.matches(pendingSelector) && surface?.chat.contains(node) && !belongsToConversation(node)) return false;
    if (node.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    const css = win.getComputedStyle(node);
    if (css.visibility === "hidden" || css.visibility === "collapse") return false;
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      if (win.getComputedStyle(ancestor).display === "none") return false;
    }
    return true;
  });
  const clearIdle = () => {
    if (idleTimer !== null) win.clearTimeout(idleTimer);
    idleTimer = null;
  };
  const canRecycle = () => surface && mode === "compact" && composer && config.compactIdleSeconds > 0 && !approvalState && !activity?.getSnapshot().pending && !drag && !composing && !popupOpen();
  const syncIdle = () => {
    if (!canRecycle()) {
      clearIdle();
      return;
    }
    if (idleTimer !== null) return;
    idleTimer = win.setTimeout(() => {
      idleTimer = null;
      if (canRecycle()) setMode("hidden", { focusRecovery: false });
    }, config.compactIdleSeconds * 1e3);
  };
  const userActivity = (event) => {
    if (mode !== "compact" || !withinChat(event.target)) return;
    clearIdle();
    syncIdle();
  };
  const inputChanged = (event) => {
    userActivity(event);
    schedule();
  };
  const compositionChanged = (event) => {
    if (!withinChat(event.target)) return;
    composing = event.type === "compositionstart";
    clearIdle();
    syncIdle();
    schedule();
  };
  const updateGeometry = () => {
    if (!surface) return;
    const chrome = !minimized || !composer;
    surface.chat.toggleAttribute("data-dsh-chat-chrome", chrome);
    if (composer) collapsedHeight = Math.max(48, composer.seat.getBoundingClientRect().height + 2);
    const b = bounds();
    const viewport = [b.left, b.top, b.width, b.height].join(":");
    if (morph.running && viewport !== morphViewport) morph.finish();
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
    pin.setAttribute("aria-pressed", String(pinned));
    pin.setAttribute("aria-label", pinned ? "\u53D6\u6D88\u56FA\u5B9A\u804A\u5929\u5C0F\u7A97" : "\u56FA\u5B9A\u804A\u5929\u5C0F\u7A97");
    compactRecycle.disabled = !!approvalState || !!activity?.getSnapshot().pending || composing;
    minimize.title = approvalState ? "\u8BF7\u5148\u5904\u7406\u4F1A\u8BDD\u4E2D\u7684\u5F85\u529E\u63D0\u793A" : "\u9690\u85CF\u804A\u5929\uFF0C\u4FDD\u7559\u6062\u590D\u5165\u53E3";
    const label = minimized ? "\u5C55\u5F00\u804A\u5929" : "\u6536\u8D77\u804A\u5929";
    if (edge.getAttribute("aria-expanded") !== String(!minimized)) edge.setAttribute("aria-expanded", String(!minimized));
    edge.setAttribute("aria-label", label);
    title.setAttribute("aria-label", `\u79FB\u52A8\u804A\u5929\u5C0F\u7A97\uFF1A${title.textContent}\uFF0C\u65B9\u5411\u952E\u79FB\u52A8`);
    title.removeAttribute("title");
    edge.title = approvalState ? "\u8BF7\u5148\u5904\u7406\u4F1A\u8BDD\u4E2D\u7684\u5F85\u529E\u63D0\u793A" : `\u70B9\u51FB\u5916\u7F18${minimized ? "\u5C55\u5F00" : "\u6536\u8D77"}\u804A\u5929\uFF0C\u62D6\u52A8\u79FB\u52A8`;
  };
  const setMode = (next, { focus = false, force = false, focusRecovery = true, animate = true } = {}) => {
    if (!surface || approvalState && next !== "expanded" && !force) return;
    const active = doc.activeElement;
    const previous = mode;
    const previousGeometry = geometry();
    const previousBall = { x: parseFloat(badge.style.left), y: parseFloat(badge.style.top), width: 40, height: 40, radius: 20 };
    const crossing = animate && previous === "hidden" !== (next === "hidden");
    if (!crossing) morph.cancel();
    clearIdle();
    mode = next;
    if (mode !== "hidden") minimized = mode === "compact";
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
    const wantsFocus = focus || mode === "compact" && withinChat(active) && !composer?.seat.contains(active);
    const restoreAccessibility = () => {
      for (const key of ["inert", "aria-hidden"]) {
        const value = savedAccessibility?.[key];
        if (value === null || value === void 0) surface.chat.removeAttribute(key);
        else surface.chat.setAttribute(key, value);
      }
    };
    const g = mode === "hidden" ? previousGeometry : geometry();
    const chat = surface.chat;
    const b = bounds();
    morphViewport = [b.left, b.top, b.width, b.height].join(":");
    const animated = crossing && morph.start({
      frame: surface.frame,
      chat,
      badge,
      full: { x: g.x, y: g.y, width: g.width, height: g.visibleHeight, radius: minimized ? 24 : 14 },
      ball: mode === "hidden" ? { x: parseFloat(badge.style.left), y: parseFloat(badge.style.top), width: 40, height: 40, radius: 20 } : previousBall,
      hide: mode === "hidden",
      onFinish: () => {
        if (disposed || surface?.chat !== chat) return;
        if (mode !== "hidden") {
          restoreAccessibility();
          if (wantsFocus) focusEditor();
        }
      }
    });
    if (animated && mode !== "hidden") {
      chat.setAttribute("inert", "");
      chat.setAttribute("aria-hidden", "true");
    }
    if (mode === "hidden" && focusRecovery) badge.focus({ preventScroll: true });
    else if (!animated && wantsFocus) focusEditor();
    syncActivity();
    syncIdle();
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
    syncIdle();
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
    if (!drag.moved) morph.finish();
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
      const left = b.left + gap - (mode === "hidden" ? Math.max(0, g.width - 40) : 0);
      const top = b.top + gap - (mode === "hidden" ? Math.max(0, g.visibleHeight - 40) : 0);
      if (Math.abs(x - left) <= threshold) x = left;
      if (Math.abs(x - right) <= threshold) x = right;
      if (Math.abs(y - top) <= threshold) y = top;
      if (Math.abs(y - bottom) <= threshold) y = bottom;
      preferred = { width: g.width, height: g.height, x, y: y - g.offset };
    }
    if (held.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId);
    updateGeometry();
    if (!cancel && held.moved) persist();
    clearIdle();
    syncIdle();
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
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    morph.finish();
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
    title = doc.createElement("div");
    title.setAttribute("data-dsh-full-view-title", "");
    title.setAttribute("role", "group");
    title.tabIndex = 0;
    title.addEventListener("keydown", moveWithKeyboard);
    title.textContent = "\u804A\u5929";
    minimize = button("\u9690\u85CF\u804A\u5929\uFF0C\u4FDD\u7559\u6062\u590D\u5165\u53E3", "data-dsh-minimize-chat", "M5 12h14", () => setMode("hidden"));
    pin = button("\u56FA\u5B9A\u804A\u5929\u5C0F\u7A97", "data-dsh-pin-chat", "M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6Z M12 14v7", () => {
      pinned = !pinned;
      updateGeometry();
    });
    pin.removeAttribute("title");
    toolbar.append(minimize, title, pin, button("\u8FD4\u56DE\u5206\u680F\u89C6\u56FE", "data-dsh-return-split", "M4 5h16v14H4z M10 5v14", returnSplit));
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
    compactRecycle = button("\u6536\u8D77\u4E3A\u9CB8\u9C7C\u7403", "data-dsh-compact-recycle", null, (event) => {
      event.stopPropagation();
      if (mode !== "compact" || approvalState || activity?.getSnapshot().pending || composing) return;
      clearEdgeClick();
      setMode("hidden");
    });
    compactRecycle.removeAttribute("title");
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
    const statusDot = doc.createElement("span");
    statusDot.setAttribute("data-dsh-whale-status", "");
    statusDot.setAttribute("aria-hidden", "true");
    badge.append(statusDot);
    syncNativeWhale(doc, badge);
    processing = doc.createElement("div");
    processing.setAttribute("data-dsh-processing-status", "");
    processing.setAttribute("role", "status");
    processing.setAttribute("aria-live", "off");
    processing.hidden = true;
    for (const element of [toolbar, edge, ...handles, badge]) {
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
    const status = state.pending || approvalState ? "warning" : running ? "ongoing" : state.completed ? "done" : "idle";
    const completionId = state.completed ? state.completionId ?? "completed" : null;
    let reminder = completionReminders.get(sessionId);
    if (!reminder) {
      reminder = { id: completionId, unread: state.completionUnread === true };
      completionReminders.set(sessionId, reminder);
    } else if (completionId && completionId !== reminder.id) {
      reminder.id = completionId;
      reminder.unread = true;
    }
    if (mode === "expanded" && state.completed) reminder.unread = false;
    const dot = badge.querySelector("[data-dsh-whale-status]");
    dot.setAttribute("data-state", status);
    const hideDot = status === "ongoing" || status === "done" && !reminder.unread;
    if (dot.hidden !== hideDot) dot.hidden = hideDot;
    const pendingKind = state.pendingKind ?? approvalState?.kind;
    const statusLabel = status === "warning" ? pendingKind === "question" ? "\u7B49\u5F85\u56DE\u7B54" : pendingKind === "plan-review" ? "\u7B49\u5F85\u8BA1\u5212\u786E\u8BA4" : "\u7B49\u5F85\u786E\u8BA4" : status === "ongoing" ? "\u6B63\u5728\u5904\u7406" : status === "done" ? "\u5DF2\u5B8C\u6210" : "\u7A7A\u95F2";
    badge.setAttribute("aria-label", `\u6062\u590D\u804A\u5929\uFF0C${statusLabel}`);
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
    morph.cancel();
    if (!surface) return;
    if (drag) finishPointer(null, true);
    clearEdgeClick();
    clearIdle();
    composing = false;
    stopClock();
    completionReminders.delete(sessionId);
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
    const focusWasChrome = [badge, toolbar, compactRecycle, ...handles].some((node) => node?.contains(doc.activeElement));
    toolbar?.remove();
    edge?.remove();
    compactRecycle?.remove();
    badge?.remove();
    processing?.remove();
    for (const handle of handles) handle.remove();
    if (focusWasChrome) focusEditor();
    toolbar = resize = edge = compactRecycle = title = minimize = pin = header = badge = processing = null;
    handles = [];
    surface = null;
    mode = "expanded";
    minimized = false;
    pinned = false;
    approvalState = savedAccessibility = sessionId = null;
  };
  const syncApproval = () => {
    const seat = composerSeat();
    const pending = [...surface.chat.querySelectorAll(pendingSelector)].find(belongsToConversation);
    const blocked = !!pending || !!(seat?.childElementCount && !composer);
    const kind = pending?.hasAttribute("data-question-key") ? "question" : pending?.hasAttribute("data-plan-review-key") ? "plan-review" : "approval";
    if (blocked && !approvalState) {
      const previous = mode;
      approvalState = { previous, kind };
      if (previous !== "hidden") setMode("expanded", { force: true });
    } else if (blocked && approvalState) {
      approvalState.kind = kind;
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
    if (compactRecycle.parentElement !== surface.chat) surface.chat.append(compactRecycle);
    syncComposer();
    const nextSession = surface.chat.querySelector("[data-conversation-session]")?.getAttribute("data-conversation-session");
    if (nextSession !== sessionId) {
      composing = false;
      pinned = false;
      sessionId = nextSession;
      approvalState = null;
      activity?.setSession(sessionId);
      const state = activity?.getSnapshot();
      completionReminders.set(sessionId, { id: state?.completed ? state.completionId ?? "completed" : null, unread: false });
      setMode(composer ? "compact" : "expanded", { force: true, animate: false });
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
    syncIdle();
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
    if (mode !== "expanded" || pinned || approvalState || withinChat(event.target) || withinExplanation(event.target) || popupOpen()) return;
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
    const chatFocused = eventWithinChat(event);
    if (mode !== "expanded" || approvalState || popupOpen({ ignoreExplanation: chatFocused })) return;
    event.preventDefault();
    event.stopPropagation();
    setMode("compact", { focus: true });
  };
  const windowBlur = () => {
    if (drag) finishPointer(null, true);
    if (surface && mode === "expanded" && !pinned && doc.activeElement?.tagName === "IFRAME" && !withinChat(doc.activeElement) && !withinExplanation(doc.activeElement) && !popupOpen()) setMode("compact");
  };
  const observer = new win.MutationObserver((records) => {
    if (records.some((record) => {
      if (record.target.hasAttribute?.("data-dsh-whale-morph-shell")) return false;
      if (morph.running && record.attributeName === "style" && (record.target === surface?.chat || record.target === badge)) return false;
      return record.type === "childList" || record.type === "characterData" || !record.attributeName.startsWith("data-dsh-");
    })) schedule();
  });
  observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-rightbar-fullscreen", "data-sidebar-right-panel", "data-sidebar-right-open", "data-conversation-session", "data-approval-key", "data-question-key", "data-plan-review-key", "hidden", "data-sidebar-collapsed", "aria-hidden", "aria-expanded", "inert", "style", "class"] });
  observer.observe(doc.head, { childList: true, subtree: true, characterData: true });
  win.addEventListener("resize", schedule);
  win.addEventListener("blur", windowBlur);
  win.visualViewport?.addEventListener("resize", schedule);
  win.visualViewport?.addEventListener("scroll", schedule);
  doc.addEventListener("pointerdown", outsidePointer, true);
  doc.addEventListener("focusin", focusChanged);
  doc.addEventListener("focusout", schedule);
  doc.addEventListener("input", inputChanged);
  for (const type of ["pointerdown", "pointermove", "keydown", "wheel"]) doc.addEventListener(type, userActivity, { capture: true, passive: true });
  for (const type of ["compositionstart", "compositionend"]) doc.addEventListener(type, compositionChanged);
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
    doc.removeEventListener("input", inputChanged);
    for (const type of ["pointerdown", "pointermove", "keydown", "wheel"]) doc.removeEventListener(type, userActivity, true);
    for (const type of ["compositionstart", "compositionend"]) doc.removeEventListener(type, compositionChanged);
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
/*! Original static whale path: DeepSeek Harness RunningWhaleTail, ui-chat 0.2.0-rc.2.
MIT License

Copyright (c) 2026 DeepSeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

return {apply:module.exports.apply,inject:module.exports.inject};}});
