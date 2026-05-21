<img width="951" height="688" alt="image" src="https://github.com/user-attachments/assets/2fb24a5a-f447-4692-8945-e6a2f65f2936" /># Draxeyboi's Quest Journal

A Simple Lightweight module system that helps to track Foundry's Journals through a quest ui which can be opened and closed with the default keybind (J).

---

## Features

- **Quest tracking** — Create quests with Active, Complete, and Failed states
- **User Notes** - Create personal Notes from within the notes tab.
- **Page objectives** — Each quest supports multiple journal pages as objectives
- **GM visibility control** — Reveal or hide quests and individual pages from players at any time
- **Audio cues** — Configurable sounds for quest reveal and quest update events
- **Keybind** — Press `J` to open or close the quest log (configurable in Controls)

**Note:** Players must have permission to create new journal entries in order create their own notes within the notes tab.

---

<img width="951" height="688" alt="Screenshot 2026-05-21 132008" src="https://github.com/user-attachments/assets/8c9e61cc-0071-4aec-a016-7acceed80a9f" />


## How to Use

### GM

1. Open the quest log via the `J` keybind or the scroll icon in the Notes toolbar
2. Click **+ New Quest** to create a quest
3. Use the **⋮ menu** on any quest to:
   - **Edit** — Open the journal entry to add or edit pages
   - **Reveal / Hide** — Toggle visibility for players
   - **Complete / Fail / Reopen** — Set the quest status
   - **Delete** — Permanently remove the quest
4. In the right panel, use the **eye icon** next to a page to reveal or hide it individually
5. Use the **checkbox icon** next to a page to mark it as completed

> Quests and pages hidden from players will appear faded in the GM view so you always know what's visible.

### Players

- Press `J` or use the scene control button to open the quest log
- Only quests and pages the GM has revealed will be visible
- Completed pages appear with a strikethrough

---

## Settings

Found under **Configure Settings → Draxeyboi's Quest Journal**:

There you can setup audio cues which plays when a quest is revealed or if it is updated by revealing the pagesto players.

The keybind to open and close the quest journal can be set up in foundry's **Controls Configuration**.

---

## Compatibility

| Foundry Version | Status |
|---|---|
| V13 | Minimum supported |
| V14 | Verified |

---

## License

All Rights Reserved. Personal use only. Redistribution and modification require explicit written consent from the author. See [LICENSE](LICENSE) for full terms.
