/**
 * Quest Journel — quest-manager.mjs
 * CRUD helpers for quest JournalEntry documents.
 */

import { MODULE_ID, FOLDER_NAME } from "./constants.mjs";

export class QuestManager {

  /** Ensure the qJrnl Quests folder exists (GM only). */
  static async ensureFolder() {
    if (!QuestManager.getFolder()) {
      await Folder.create({
        name: FOLDER_NAME,
        type: "JournalEntry",
        [`flags.${MODULE_ID}.questFolder`]: true,
      });
    }
  }

  /** Return the qJrnl quest folder, or null if it doesn't exist yet. */
  static getFolder() {
    return game.folders.find(
      f => f.type === "JournalEntry" && f.getFlag(MODULE_ID, "questFolder") === true
    ) ?? null;
  }

  /** Return all quest JournalEntry documents, ordered by their sort value. */
  static getAll() {
    return game.journal
      .filter(j => j.getFlag(MODULE_ID, "isQuest") === true)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }

  /**
   * Create a new quest.
   * @param {string} name
   * @returns {Promise<JournalEntry>}
   */
  static async create(name) {
    const folder   = QuestManager.getFolder();
    const existing = QuestManager.getAll();
    const maxSort  = existing.reduce((max, q) => Math.max(max, q.sort ?? 0), 0);
    return JournalEntry.create({
      name,
      folder: folder?.id ?? null,
      sort:   maxSort + 100000,
      [`flags.${MODULE_ID}.isQuest`]:  true,
      [`flags.${MODULE_ID}.status`]:   "active",
    });
  }

  /**
   * Update a quest's status.
   * @param {string} questId
   * @param {"active"|"complete"|"failed"} status
   */
  static async setStatus(questId, status) {
    const quest = game.journal.get(questId);
    if (!quest) return;
    await quest.setFlag(MODULE_ID, "status", status);
    const labels = { complete: "Quest Complete", failed: "Quest Failed" };
    if (labels[status]) {
      await QuestManager.#announce(
        QuestManager.#chatCard(labels[status], quest.name),
        "questUpdatedSound"
      );
    }
  }

  /**
   * Permanently delete a quest.
   * @param {string} questId
   */
  static async remove(questId) {
    await game.journal.get(questId)?.delete();
  }

  static #chatCard(type, detail) {
    return `<div class="qjrnl-chat-card">
      <span class="qjrnl-chat-emblem">!</span>
      <p class="qjrnl-chat-type">${type}</p>
      <p class="qjrnl-chat-detail">${detail}</p>
    </div>`;
  }

  static async #announce(content, settingKey) {
    const sound = game.settings.get(MODULE_ID, settingKey);
    const data  = { content };
    if (sound) data.sound = sound;
    await ChatMessage.create(data);
  }

  /**
   * Toggle a quest's default ownership between OBSERVER (revealed) and NONE (hidden).
   * @param {string} questId
   */
  static async toggleReveal(questId) {
    const quest = game.journal.get(questId);
    if (!quest) return;
    const current = quest.ownership?.default ?? 0;
    const next = current >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
      ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
      : CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    await quest.update({ "ownership.default": next });
    if (next === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
      await QuestManager.#announce(
        QuestManager.#chatCard("New Quest", quest.name),
        "questRevealedSound"
      );
  }

  /**
   * Toggle a page's default ownership between OBSERVER (revealed) and NONE (hidden).
   * @param {string} questId
   * @param {string} pageId
   */
  static async togglePageReveal(questId, pageId) {
    const page = game.journal.get(questId)?.pages?.get(pageId);
    if (!page) return;
    const current = page.ownership?.default ?? -1;
    const next = current >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
      ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
      : CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    await page.update({ "ownership.default": next });
    const quest = page.parent;
    const questRevealed = (quest?.ownership?.default ?? 0) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    if (next === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER && questRevealed) {
      await QuestManager.#announce(
        QuestManager.#chatCard("Quest Updated", `${quest.name} — ${page.name}`),
        "questUpdatedSound"
      );
    }
  }

  static async togglePageDone(questId, pageId) {
    const page = game.journal.get(questId)?.pages?.get(pageId);
    if (!page) return;
    await page.setFlag(MODULE_ID, "done", !(page.getFlag(MODULE_ID, "done") ?? false));
  }
}
