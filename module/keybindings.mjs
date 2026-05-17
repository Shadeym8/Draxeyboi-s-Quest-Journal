/**
 * Quest Journel — keybindings.mjs
 * Registers the "J" keybind to open the quest log.
 */

import { QuestLogApp } from "./quest-log-app.mjs";
import { MODULE_ID } from "./constants.mjs";

export function registerKeybindings() {
  game.keybindings.register(MODULE_ID, "openQuestLog", {
    name:     "Open Quest Log",
    hint:     "Opens the Quest Journel tracker.",
    editable: [{ key: "KeyJ" }],
    onDown:   () => { QuestLogApp.toggle(); return true; },
  });
}
