/** All geometry overrides are scoped to markers owned by this plugin. */
const brainGlyph = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-1.2-2.7-5-2.6-6.2.5C3 5.5 2 8.2 3.2 10.3c-2.2 2.6-1.2 6.2 1.6 7.1-.1 3.7 4.8 5.3 7.2 2.6 2.4 2.7 7.3 1.1 7.2-2.6 2.8-.9 3.8-4.5 1.6-7.1 1.2-2.1.2-4.8-2.6-4.8C17 2.4 13.2 2.3 12 5Z M12 5v15 M5.8 5.5c-.5 1.7.2 3.3 1.8 4 M18.2 5.5c.5 1.7-.2 3.3-1.8 4 M3.2 10.3c1.6-.8 3.2-.2 4.2 1.3 M20.8 10.3c-1.6-.8-3.2-.2-4.2 1.3 M4.8 17.4c1.9.4 3.5-.6 3.6-2.3 M19.2 17.4c-1.9.4-3.5-.6-3.6-2.3"/></svg>')
export const style = `
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
  animation: dsh-fv-appear 180ms ease-out;
  transition: border-radius 160ms ease;
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
[data-dsh-floating-chat] [data-input-scroll] { grid-column: 2; grid-row: 1; min-width: 0; margin: 0 !important; max-height: 144px; }
[data-dsh-floating-chat] [data-composer-input] { min-height: 24px !important; padding: 0 4px !important; font-size: 14px; line-height: 24px; }
[data-dsh-floating-chat] [data-composer-placeholder] { inset: 0 4px auto !important; line-height: 24px; font-size: 14px; }
[data-dsh-floating-chat] [data-dsh-full-view-input-row] {
  display: contents !important; --dsh-composer-model-text-display: none; --dsh-composer-model-icon-display: block;
}
[data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; grid-row: 1; gap: 4px !important; }
[data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 3; grid-row: 1; gap: 4px !important; margin: 0 !important; }
[data-dsh-full-view-model-icon] { display: none !important; }
[data-dsh-full-view-model]::before {
  content: ''; flex: none; width: 18px; height: 18px; background: currentColor;
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
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-toolbar] { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-resize]:not([data-dsh-resize-direction="e"]):not([data-dsh-resize-direction="w"]) { display: none !important; }
[data-dsh-floating-chat][data-dsh-chat-composer][data-dsh-chat-minimized] > [data-dsh-full-view-input-path] { display: flex !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path] { box-sizing: border-box; width: 100% !important; height: auto !important; min-height: 0 !important; flex: none !important; overflow: visible !important; background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-path]:not([data-composer-seat]) > :not([data-dsh-full-view-input-path]) { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-input-footer] { display: none !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-composer-seat] { background: transparent !important; }
[data-dsh-chat-composer][data-dsh-chat-minimized] [data-dsh-full-view-composer-card] { box-shadow: none !important; background: transparent; }
[data-dsh-floating-chat][data-dsh-chat-minimized][data-dsh-chat-chrome] { border-radius: 18px; }
[data-dsh-floating-chat][data-dsh-chat-minimized][data-dsh-chat-chrome] > [data-dsh-full-view-toolbar] { display: flex !important; border-radius: 18px 18px 0 0; }
[data-dsh-full-view-toolbar] [data-dsh-move-chat] { font-size: 20px; cursor: grab; touch-action: none; }
[data-dsh-full-view-toolbar] button:disabled { opacity: .35; cursor: default; }
[data-dsh-floating-chat][data-dsh-chat-hidden] { display: none !important; }
[data-dsh-restore-chat], [data-dsh-show-update] {
  position: absolute; z-index: 51; box-sizing: border-box; height: 36px; border: 1px solid var(--dsw-alias-border-l3, #ddd);
  border-radius: 18px; padding: 0 14px; color: var(--dsw-alias-label-primary, #202124); background: var(--dsw-alias-bg-base, #fff);
  box-shadow: 0 4px 18px #0002; font: 12px/1.4 system-ui, sans-serif; cursor: pointer; -webkit-app-region: no-drag;
}
[data-dsh-restore-chat] { touch-action: none; }
[data-dsh-show-update] { height: 28px; }
[data-dsh-restore-chat][hidden], [data-dsh-show-update][hidden] { display: none !important; }
[data-dsh-restore-chat]:focus-visible, [data-dsh-show-update]:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #5686fe); outline-offset: 2px; }
[data-dsh-floating-chat][data-dsh-chat-unread] { border-color: var(--dsw-focus-ring-color, #5686fe) !important; }
[data-dsh-fv-dragging] { user-select: none; cursor: grabbing; }
[data-dsh-fv-dragging] [data-dsh-floating-chat] { transition: none; }
[data-dsh-fv-dragging] iframe { pointer-events: none !important; }
@container dsh-floating-chat (max-width: 320px) {
  [data-dsh-floating-chat] [data-dsh-full-view-composer-card] { grid-template-columns: minmax(0, 1fr) auto !important; }
  [data-dsh-floating-chat] [data-input-scroll] { grid-column: 1 / -1; grid-row: 1; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-tools] { grid-column: 1; grid-row: 2; }
  [data-dsh-floating-chat] [data-dsh-full-view-input-trailing] { grid-column: 2; grid-row: 2; }
}
@keyframes dsh-fv-appear { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-dsh-floating-chat] { animation: none; transition: none; } }
`
