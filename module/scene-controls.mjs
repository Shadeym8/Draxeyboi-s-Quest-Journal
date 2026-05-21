/**
 * Quest Journal — scene-controls.mjs
 * Adds a scroll button to the Notes layer scene controls.
 *
 * The hook receives the controls array; we push a tool into the "notes"
 * group (journal-related, so semantically appropriate).
 */

import { QuestLogApp } from "./quest-log-app.mjs";

export function registerSceneControls(controls) {
  const notesGroup = controls.notes;
  if (!notesGroup) return;

  notesGroup.tools["qjrnl-open"] = {
    name:     "qjrnl-open",
    title:    "Quest Journal",
    icon:     "fas fa-scroll",
    button:   true,
    onChange: () => QuestLogApp.open(),
  };
}
