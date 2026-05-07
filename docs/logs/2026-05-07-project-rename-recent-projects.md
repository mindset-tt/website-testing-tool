# 2026-05-07 Project Rename And Recent Projects

## Summary

Added compact project rename plus a small recent-project quick-open list so local workspace management is more usable without introducing destructive project delete behavior.

## What Changed

- Added a metadata-only project rename path that updates `project.json` `name` and `updatedAt` while preserving `projectId`, `createdAt`, and the project folder path.
- Added a recent-projects cache stored in Electron `userData` as `recent-projects.json`.
- Limited the recent-project list to eight items, deduplicated by project path, and sorted it by `lastOpenedAt` descending.
- Wired create, open, and recent-open flows to refresh the recent-project list automatically.
- Added no-project startup rows for recent projects and a compact project rename strip in the open-project header.
- Pruned missing or invalid recent project folders during refresh and when a recent-open attempt fails.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Follow-Up

- Add a non-destructive "forget recent project" action so users can clean up valid but unwanted quick-open entries without deleting project folders.
