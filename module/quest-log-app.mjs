/**
 * Quest Journal — quest-log-app.mjs
 * ApplicationV2 quest log dialog.
 */

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
import { QuestManager } from "./quest-manager.mjs";
import { MODULE_ID } from "./constants.mjs";

export class QuestLogApp extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id:       "qjrnl-app",
    classes:  ["quest-Journal"],
    tag:      "div",
    window:   { title: "", resizable: true },
    position: { width: 900, height: 650 },
    actions: {
      selectQuest:  QuestLogApp._onSelectQuest,
      setStatus:    QuestLogApp._onSetStatus,
      deleteQuest:  QuestLogApp._onDeleteQuest,
      editQuest:    QuestLogApp._onEditQuest,
      createQuest:  QuestLogApp._onCreateQuest,
      revealQuest:  QuestLogApp._onRevealQuest,
      revealPage:   QuestLogApp._onRevealPage,
      checkPage:    QuestLogApp._onCheckPage,
      switchTab:    QuestLogApp._onSwitchTab,
      openNote:     QuestLogApp._onOpenNote,
      editNote:     QuestLogApp._onOpenNote,
      selectNote:   QuestLogApp._onSelectNote_Note,
      createNote:   QuestLogApp._onCreateNote,
      deleteNote:   QuestLogApp._onDeleteNote,
    },
  };

  static PARTS = {
    log: {
      template:   "modules/qjrnl/templates/quest-log.hbs",
      scrollable: [".qjrnl-sidebar-body", ".qjrnl-detail"],
    },
  };

  /** Currently selected quest ID. */
  #selectedQuestId = null;

  /** Quest IDs whose subpage list is currently collapsed. */
  #collapsedQuests = new Set();

  /** Currently active tab: "quests" or "notes". */
  #activeTab = "quests";

  /** Currently selected note ID. */
  #selectedNoteId = null;

  /* ── Singleton ──────────────────────────────────────────────────────────── */

  static #instance = null;

  /** Open (or bring to front) the quest log. */
  static open() {
    if (!QuestLogApp.#instance) QuestLogApp.#instance = new QuestLogApp();
    QuestLogApp.#instance.render({ force: true });
  }

  /** Toggle the quest log open/closed. */
  static toggle() {
    if (QuestLogApp.#instance) QuestLogApp.#instance.close();
    else QuestLogApp.open();
  }

  /** Re-render if the log is already open. */
  static rerender() {
    QuestLogApp.#instance?.render();
  }

  /** Clear the singleton when the window is closed. */
  async close(options = {}) {
    await super.close(options);
    QuestLogApp.#instance = null;
  }

  /* ── Context ────────────────────────────────────────────────────────────── */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const all = QuestManager.getAll()
      .filter(q => q.testUserPermission(game.user, "LIMITED"));

    // Clear selection if the selected quest was deleted.
    if (this.#selectedQuestId && !game.journal.get(this.#selectedQuestId)) {
      this.#selectedQuestId = null;
    }

    // Auto-select the oldest active quest if nothing is selected.
    if (!this.#selectedQuestId) {
      const firstActive = all.find(q => q.getFlag(MODULE_ID, "status") === "active");
      if (firstActive) this.#selectedQuestId = firstActive.id;
    }

    const pageRevealed = (p) =>
      (p.ownership?.default ?? -1) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;

    const mapQuests = (arr, includePages = false) => arr.map(q => {
      const entry = {
        id:         q.id,
        name:       q.name,
        isSelected: q.id === this.#selectedQuestId,
        revealed:   (q.ownership?.default ?? 0) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
      };
      if (includePages) {
        entry.pages = q.pages?.contents
          .filter(p => game.user.isGM || pageRevealed(p))
          .map(p => p.name) ?? [];
      }
      return entry;
    });

    // Group into status buckets in a single pass.
    const grouped = all.reduce((acc, q) => {
      const status = q.getFlag(MODULE_ID, "status") ?? "active";
      (acc[status] ??= []).push(q);
      return acc;
    }, {});

    context.isGM     = game.user.isGM;
    context.active   = mapQuests(grouped.active   ?? [], true);
    context.complete = mapQuests(grouped.complete ?? []);
    context.failed   = mapQuests(grouped.failed   ?? []);

    context.isQuestsTab = this.#activeTab === "quests";
    context.isNotesTab  = this.#activeTab === "notes";

    // Clear selection if the note was deleted.
    if (this.#selectedNoteId && !game.journal.get(this.#selectedNoteId)) {
      this.#selectedNoteId = null;
    }

    context.notes = game.journal.contents
      .filter(j => j.isOwner && !j.getFlag(MODULE_ID, "status"))
      .map(j => ({ id: j.id, name: j.name, isSelected: j.id === this.#selectedNoteId }));

    // Detail panel — pages of the selected note.
    const selectedNote = this.#selectedNoteId ? game.journal.get(this.#selectedNoteId) : null;
    context.selectedNoteName  = selectedNote?.name ?? null;
    context.selectedNoteId    = selectedNote?.id ?? null;
    context.selectedNotePages = selectedNote?.pages?.contents
      .map(p => ({ id: p.id, name: p.name, content: p.text?.content ?? "" })) ?? [];

    // Detail panel — pages of the selected quest.
    const selected = this.#selectedQuestId ? game.journal.get(this.#selectedQuestId) : null;
    context.selectedQuestName = selected?.name ?? null;
    context.selectedQuestId   = selected?.id ?? null;
    context.selectedPages = selected?.pages?.contents
      .filter(p => game.user.isGM || pageRevealed(p))
      .map(p => ({
        id:       p.id,
        name:     p.name,
        content:  p.text?.content ?? "",
        revealed: pageRevealed(p),
        done:     p.getFlag(MODULE_ID, "done") ?? false,
      })) ?? [];

    return context;
  }

  /* ── Actions ────────────────────────────────────────────────────────────── */

  static _onSelectQuest(event, target) {
    const id = target.closest("[data-quest-id]")?.dataset.questId;
    this.#selectedQuestId = id ?? null;
    this.render();
  }

  static async _onSetStatus(event, target) {
    const id     = target.closest("[data-quest-id]")?.dataset.questId;
    const status = target.dataset.status;
    await QuestManager.setStatus(id, status);
  }

  static async _onDeleteQuest(event, target) {
    const id    = target.closest("[data-quest-id]")?.dataset.questId;
    const quest = game.journal.get(id);
    if (!quest) return;

    const confirmed = await DialogV2.confirm({
      window:  { title: "Delete Quest" },
      content: `<p>Delete <strong>${quest.name}</strong>? This cannot be undone.</p>`,
    });
    if (confirmed) await QuestManager.remove(id);
  }

  static _onEditQuest(event, target) {
    const id = target.closest("[data-quest-id]")?.dataset.questId;
    game.journal.get(id)?.sheet.render({ force: true });
  }

  static async _onRevealQuest(event, target) {
    const id = target.closest("[data-quest-id]")?.dataset.questId;
    await QuestManager.toggleReveal(id);
  }

  static async _onRevealPage(event, target) {
    const questId = target.closest("[data-quest-id]")?.dataset.questId;
    const pageId  = target.closest("[data-page-id]")?.dataset.pageId;
    await QuestManager.togglePageReveal(questId, pageId);
  }

  static async _onCheckPage(event, target) {
    const questId = target.closest("[data-quest-id]")?.dataset.questId;
    const pageId  = target.closest("[data-page-id]")?.dataset.pageId;
    await QuestManager.togglePageDone(questId, pageId);
  }

  static _onSwitchTab(event, target) {
    this.#activeTab = target.dataset.tab ?? "quests";
    this.render();
  }

  static _onSelectNote_Note(event, target) {
    const id = target.closest("[data-note-id]")?.dataset.noteId;
    this.#selectedNoteId = id ?? null;
    this.render();
  }

  static _onOpenNote(event, target) {
    const id = target.closest("[data-note-id]")?.dataset.noteId;
    game.journal.get(id)?.sheet.render({ force: true });
  }

  static async _onCreateNote(event, target) {
    const note = await JournalEntry.create({ name: "New Note" });
    note?.sheet.render({ force: true });
  }

  static async _onDeleteNote(event, target) {
    const id   = target.closest("[data-note-id]")?.dataset.noteId;
    const note = game.journal.get(id);
    if (!note) return;
    const confirmed = await DialogV2.confirm({
      window:  { title: "Delete Note" },
      content: `<p>Delete <strong>${note.name}</strong>? This cannot be undone.</p>`,
    });
    if (confirmed) await note.delete();
  }

  static async _onCreateQuest(event, target) {
    const name = await DialogV2.prompt({
      window:  { title: "New Quest" },
      content: `<label>Quest Name
                  <input type="text" name="questName" style="width:100%;margin-top:6px" autofocus>
                </label>`,
      ok: {
        label:    "Create",
        callback: (event, button) => button.form.elements.questName.value.trim(),
      },
    });
    if (!name) return;
    await QuestManager.create(name);
  }

  /* ── Lifecycle ──────────────────────────────────────────────────────────── */

  _onRender(context, options) {
    const closeMenus = () =>
      this.element.querySelectorAll(".qjrnl-quest-controls.open")
        .forEach(el => el.classList.remove("open"));

    this.element.querySelectorAll(".qjrnl-btn-more").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const controls = btn.closest(".qjrnl-quest-controls");
        const wasOpen  = controls.classList.contains("open");
        closeMenus();
        if (!wasOpen) controls.classList.add("open");
      });
    });

    this.element.addEventListener("click", closeMenus);

    // Re-apply subpage collapse state (survives re-renders)
    for (const questId of this.#collapsedQuests) {
      const li = this.element.querySelector(`.qjrnl-quest[data-quest-id="${questId}"]`);
      if (!li) { this.#collapsedQuests.delete(questId); continue; }
      li.classList.add("qjrnl-quest--collapsed");
      li.querySelector(".qjrnl-subpage-toggle i")?.classList.replace("fa-chevron-down", "fa-chevron-up");
    }

    this.element.querySelectorAll(".qjrnl-subpage-toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const li        = btn.closest(".qjrnl-quest");
        const questId   = li.dataset.questId;
        const collapsed = li.classList.toggle("qjrnl-quest--collapsed");
        btn.querySelector("i").classList.toggle("fa-chevron-down", !collapsed);
        btn.querySelector("i").classList.toggle("fa-chevron-up",    collapsed);
        if (collapsed) this.#collapsedQuests.add(questId);
        else           this.#collapsedQuests.delete(questId);
      });
    });
  }
}
