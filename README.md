# Faceboard

A small, dependency-free browser app for manually sorting photos into connected groups, chains, and nested junctions.

**AI-generated:** This app, its interface, documentation, and illustrated sample portraits were generated with OpenAI Codex from Jack's concept and direction. See [AI-GENERATED.md](AI-GENERATED.md).

Free to download, run locally, modify, and redistribute under the [MIT license](LICENSE).

**[Download Faceboard.html](https://github.com/Captainseajack/faceboard/releases/latest/download/Faceboard.html)** · **[Download the complete ZIP](https://github.com/Captainseajack/faceboard/archive/refs/heads/main.zip)**

## Open it

1. On GitHub, choose **Code → Download ZIP** (or download **Faceboard.html** from Releases).
2. Extract the ZIP into a folder on your computer.
3. Double-click **Faceboard.html** to open it in a current desktop browser.

The included standalone copy works offline. No installation, sign-in, package download, or server is required. Each person gets their own local board; this is not a shared cloud workspace.

The app opens with an illustrated example. Choose **Workspace options → Start an empty workspace** to start your own board.

## Work on the canvas

- **New group** adds a tick to the horizontal bar. Select a group to edit its title, description, color, or left-to-right order.
- **Add photos** in the header adds images to the photo tray. The same button beneath a chain adds images directly to that chain.
- Drag photos onto groups, junctions, chain labels, other photos, or the gaps between photos. Drop on a group or junction to use its first chain. Drop on the top or bottom half of a photo to insert before or after it. For a keyboard-friendly alternative, select a photo and choose **Move to a chain**.
- Select a photo and choose **Branch after this photo**. Everything below it continues in the first branch; a second branch starts empty. Nested junctions are preserved.
- Select any group or junction and choose **Add another chain**. Select a chain to append a junction, or any photo to split further down.
- Scroll in both directions, hold **Space + drag** to pan, and use the zoom controls or **Ctrl/Command + scroll**. **Fit all** shows the entire board. Select an entry and choose **Focus** for a close view.
- **Photo size** in the canvas toolbar resizes every photo and sets the size for future imports. To make one photo larger or smaller, select it and use the **Photo size** slider in Details. The layout and connector lines adjust automatically. These sizes are saved and included in backups; the underlying image files are unchanged.
- Titles and notes save as you edit. **Ctrl/Command + Z** and **Ctrl/Command + Shift + Z** undo/redo changes. The most recent 25 actions are recoverable in the current session.

## Saving and photos

Boards save to IndexedDB in the current browser on the current device (with a localStorage fallback). There is no cloud sync or photo upload. Browser profiles, the hosted address, and the offline file have separate storage. Clearing browser storage removes the saved board.

**Export** downloads a JSON backup containing the structure, text, colors, and embedded images. Restore it with **Workspace options → Import a Faceboard backup**. Import replaces the current board and is undoable for the current session. Export before switching workspaces if you need separate copies.

Imported images are converted locally to JPEG at a maximum of 1,600 pixels on the longest edge. The originals on disk are never changed; exported backups contain the resized images. Animated images become a still frame. Supported formats depend on the browser; JPEG, PNG, and WebP are recommended. Each input file can be up to 50 MB. HEIC may require conversion first.

This app provides manual organization and makes no automatic face matches or identity inferences. The included portraits are original SVG illustrations.

## Optional tips

If Faceboard is useful to you, you can [tip Jack on Cash App](https://cash.app/$Seajack1). The Cash App handle is **$Seajack1**. The app's **Tips** button opens the same link in a new tab.

Tips are entirely optional. Every feature is available for free. Faceboard does not process payments, track visitors, or send your board or photos to Cash App; the link opens the external Cash App website.

## Source and verification

The `dist` folder contains the app and can be served with any static server, for example:

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory dist
```

There is no package installation. After changing the source in `dist`, regenerate the standalone download with Node.js:

```powershell
node scripts/build.cjs
```

To verify the data model:

```powershell
node --check dist/app.js
node --test tests/core.test.cjs
```

The tests cover nested splitting, moving and reordering, preservation of photo records, backup round trips, malformed backups, and 500 successive structural edits. The UI was also checked in a browser for editing, adding later branches, dragging, local image import, moving, undo/redo, and persistence after reload.
