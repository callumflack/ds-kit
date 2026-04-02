/**
 * Shared interaction visuals: keyboard focus, validation (`aria-invalid`), and
 * trigger/toggle chrome (`data-state`, `aria-*`). Import from this module when
 * the control is not field-specific.
 *
 * Ownership model:
 * - This file owns shared control-state treatment across the whole DS.
 * - `field.tsx` owns field geometry/chrome and re-exports these helpers for field call sites.
 * - `button-base.tsx` composes these helpers for action controls and adds button-only surfaces.
 * - Call sites should not rebuild focus/invalid/selected rings ad hoc.
 *
 * Dark mode: rely on semantic tokens / global theme, not `dark:` on these primitives.
 */

/** Keyboard focus ring (`focus-visible:`). Use on fields, buttons, and other focusable controls. */
export const stateFocus = [
  "outline-none",
  "focus-visible:outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
] as const;

/** Invalid state when `aria-invalid` is true: border + ring. Single source for fields and buttons. */
export const stateInvalid = [
  "aria-invalid:border-destructive",
  "aria-invalid:ring-3 aria-invalid:ring-destructive/20",
] as const;

/** State prefixes for trigger/toggle ring chrome (menus, popovers, toggles). */
export const TRIGGER_RING_STATE_PREFIXES = [
  "data-[state=open]",
  "aria-pressed",
  "aria-selected",
  "aria-expanded",
] as const;

/** Border token per trigger state prefix (e.g. `border-ring`). Compose with `triggerStateRingsFor`. */
export function triggerStateBordersFor(border: string): string[] {
  return TRIGGER_RING_STATE_PREFIXES.map((state) => `${state}:${border}`);
}

/** `ring-3` + ring color per trigger state prefix (e.g. `ring-ring/50`). Compose with `triggerStateBordersFor`. */
export function triggerStateRingsFor(ring: string): string[] {
  return TRIGGER_RING_STATE_PREFIXES.map((state) => `${state}:ring-3 ${state}:${ring}`);
}
