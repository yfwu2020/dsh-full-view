/** All geometry overrides are scoped to markers owned by this plugin. */
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
  min-width: 0; min-height: 0; z-index: 50; display: flex !important; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #202124);
  border: 1px solid var(--dsw-alias-border-l3, #ddd) !important; border-radius: 14px;
  box-shadow: 0 12px 40px #0002, 0 2px 8px #0001; overflow: hidden;
  --dsh-frame-leading-clearance: 0px;
  animation: dsh-fv-appear 180ms ease-out;
}
[data-dsh-floating-chat] > :not([data-dsh-full-view-toolbar]):not([data-dsh-full-view-resize]) {
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
[data-dsh-floating-chat][data-dsh-chat-minimized] > :not([data-dsh-full-view-toolbar]) { display: none !important; }
[data-dsh-full-view-resize] { position: absolute; width: 16px; height: 16px; bottom: 1px; right: 1px; z-index: 2; cursor: nwse-resize; touch-action: none; }
[data-dsh-full-view-resize]::after { content: ''; position: absolute; right: 4px; bottom: 4px; width: 5px; height: 5px; border-right: 1px solid var(--dsw-alias-label-tertiary, #999); border-bottom: 1px solid var(--dsw-alias-label-tertiary, #999); }
[data-dsh-fv-dragging] { user-select: none; cursor: grabbing; }
[data-dsh-fv-dragging] iframe { pointer-events: none !important; }
@keyframes dsh-fv-appear { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { [data-dsh-floating-chat] { animation: none; } }
`
