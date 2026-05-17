/**
 * Quest Journel — quest-journel.mjs
 * Module entry point.
 */

import { QuestLogApp }           from "./module/quest-log-app.mjs";
import { QuestManager }          from "./module/quest-manager.mjs";
import { registerKeybindings }   from "./module/keybindings.mjs";
import { registerSceneControls } from "./module/scene-controls.mjs";
import { registerSettings }      from "./module/settings.mjs";

Hooks.once("init", () => {
  console.log("qJrnl | Quest Journel initialising...");
  registerSettings();
  registerKeybindings();
});

Hooks.once("ready", async () => {
  console.log("qJrnl | Quest Journel ready.");
  if (game.user.isGM) await QuestManager.ensureFolder();
});

// Re-render open quest log whenever journals change.
for (const hook of [
  "createJournalEntry",     "updateJournalEntry",     "deleteJournalEntry",
  "createJournalEntryPage", "updateJournalEntryPage", "deleteJournalEntryPage",
]) Hooks.on(hook, () => QuestLogApp.rerender());

// Scene controls button.
Hooks.on("getSceneControlButtons", registerSceneControls);
