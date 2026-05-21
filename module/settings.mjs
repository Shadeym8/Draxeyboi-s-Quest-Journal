/**
 * Quest Journal — settings.mjs
 * Module settings registration.
 */

import { MODULE_ID } from "./constants.mjs";

export function registerSettings() {
  game.settings.register(MODULE_ID, "questRevealedSound", {
    name: "Quest Revealed Sound",
    hint: "Played globally for all players when a quest is revealed.",
    scope:  "world",
    config: true,
    type:    new foundry.data.fields.FilePathField({ categories: ["AUDIO"] }),
    default: "",
  });

  game.settings.register(MODULE_ID, "questUpdatedSound", {
    name: "Quest Updated Sound",
    hint: "Played globally for all players when a quest page is revealed.",
    scope:  "world",
    config: true,
    type:    new foundry.data.fields.FilePathField({ categories: ["AUDIO"] }),
    default: "",
  });
}
