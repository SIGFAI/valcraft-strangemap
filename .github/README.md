# ValCraft (strangemap)

Real Minecraft drawn inside Valheim: build blocks the trolls bump into and fight with Minecraft swords, bows and TNT.

**ValCraft (strangemap) is made by [strangemap](https://github.com/strangemap).** All credit for the mod goes to them. It is built on [rehan-remade/universal-modder](https://github.com/rehan-remade/universal-modder) by Rehan and universal-modder contributors.

- Original project: https://github.com/strangemap/valcraft
- Report bugs and ask questions there: https://github.com/strangemap/valcraft/issues
- Upstream release packaged here: [v0.1.0](https://github.com/strangemap/valcraft/releases/tag/v0.1.0) (commit [`0dc1cd2`](https://github.com/strangemap/valcraft/tree/0dc1cd2484b1036b213a7e37bef1297f6b16ae74))

> **Beta.** Nobody at SIGF has played this build yet. Back up your saves.
> Bugs in the mod itself go to the author's issue tracker above; problems with the one-click install go to this repository's issues.

## What you need

- **Valheim** ([Steam](https://store.steampowered.com/app/892970/)): Unity 6000.0.75 build of the author (2026-10-05); no version check; DirectX 11 only (-force-d3d11).
- **Minecraft**: Java Edition 26.3.
- reshade 6.8.0: the add-on build of ReShade composites Minecraft into Valheim; installed into the game folder by the app (https://reshade.me/).
- Windows and the [SIGF app](https://sigf.ai). The app installs bepinexpack-valheim 5.4.2350, fabric-loader 0.19.5, fabric-api 0.161.0+26.3 for you.

## Install

In the SIGF app, open **ValCraft (strangemap)** in the catalog, press **Install**, then **Play**. **Restore** puts your game folders back exactly as they were.
The app follows `mashup.json` in this repository: every download is pinned by sha256. The files come from the release [`v0.1.0`](../../releases/tag/v0.1.0).

### How to play

- Explore Valheim's world as a Minecraft player: place and break blocks that creatures collide with, and fight with Minecraft weapons, TNT and ender pearls.
- Press Play: Minecraft starts hidden first, then Valheim. Load a world; Steve appears once Minecraft has linked up.
- R switches between Minecraft mode and Valheim's own weapons and body. Left click attacks or breaks, right click uses or places, E opens the inventory.
- 1-9 or the wheel pick from the hotbar, Ctrl sprints, Shift sneaks, Space twice flies in creative, F3+F4 changes the game mode.
- F6 hands, F7 ValCraft on or off, F8 re-levels the grid to where you stand, F9 creative or survival. In survival, dying in Minecraft kills the Viking.

### Good to know

- You need Valheim on Steam and Minecraft: Java Edition (Windows), a GPU that runs Valheim on DirectX 11, and a few GB of free RAM: both games run at once. The app starts Valheim with -force-d3d11.
- Experimental, single player (or your own Minecraft server). Not the same mod as LoAlCo's ValCraft: install only one of the two, restore the other first.
- BepInExPack_Valheim, ReShade 6.8.0 (as dxgi.dll) and ValCraft are installed into the Valheim folder for you; Restore removes them. Settings: BepInEx\config\valcraft.passthrough.cfg.
- No Minecraft at all: check Valheim\ReShade.log for "Registered add-on ValCraft" and BepInEx\LogOutput.log for "connected to Minecraft". Beta: report bugs to the author on the upstream issue tracker.

## Not together with ValCraft (LoAlCo)

This ValCraft (strangemap, a universal-modder passthrough) and LoAlCo's ValCraft (SIGFAI/valcraft, a SkyCraft port) are different mods for the same game. Install only one of them: restore the other first.

## What this repository holds

1. The upstream source tree at tag `v0.1.0`, commit [`0dc1cd2484b1036b213a7e37bef1297f6b16ae74`](https://github.com/strangemap/valcraft/tree/0dc1cd2484b1036b213a7e37bef1297f6b16ae74), every file unchanged (same git blobs). Upstream's own `README.md` is there, unchanged; GitHub shows this file (`.github/README.md`) first.
2. Added by SIGF in the same commit: this file, `THIRD-PARTY.md` (licenses and sources of the third-party files in the release), and `sigf/` (the scripts that built the release assets, for reference: they run inside the SIGF repository).
3. `mashup.json`, the SIGF app recipe (the next commit).
4. The release `v0.1.0` (its tag is the first commit):

| Asset | Size | sha256 | What it is |
|---|---|---|---|
| `denikson-BepInExPack_Valheim-5.4.2350.zip` | 706129 B | `37a91c000b4e88f2ed7a4bd7d812239852d2e36cbf0ff0a9f5faacfba46b105f` | BepInExPack_Valheim 5.4.2350 (BepInEx 5.4.23.5 configured for Valheim), the Thunderstore file, unchanged (see THIRD-PARTY.md); its `BepInExPack_Valheim/` folder goes into the Valheim folder. |
| `valcraft-strangemap-valheim.zip` | 2594056 B | `96de380cb7369fffa6a64d294d8ccb996aab43d1ba2c875637985e7a9005bdf1` | upstream's `ValCraft.dll` (into `BepInEx/plugins`), `ValCraft.addon64` and `MCPassthrough.fx` from release `v0.1.0`, unchanged; ReShade 6.8.0's `ReShade64.dll` unchanged as `dxgi.dll`, its license and the CC0 shader headers; `ReShade.ini` and `ReShadePreset.ini` with upstream's installer text; upstream's LICENSE; into the Valheim folder. |
| `valcraft-strangemap.mrpack` | 214402 B | `199291ae1dac8a627aab11daeb95738cee2220692f35749382c7fc190d5b8c8d` | the Minecraft side: upstream's `valcraft-mc.jar` unchanged (Java-WebSocket 1.6.0 inside, MIT), with upstream's LICENSE, for Minecraft 26.3 with Fabric Loader 0.19.5; Fabric API 0.161.0+26.3 is a Modrinth download link, not stored here. |

The sha256 of every file inside the zips is in `mashup.json` (`contents`).

## Licenses

| Part | License | Where |
|---|---|---|
| ValCraft by strangemap (all of the upstream tree) | MIT, Copyright strangemap; derived from universal-modder (MIT) | `LICENSE` |
| BepInExPack_Valheim 5.4.2350 (release asset) | MIT (BepInEx, the Valheim changes, HarmonyX, MonoMod, Mono.Cecil); UnityDoorstop LGPL-2.1 | `THIRD-PARTY.md` |
| ReShade 6.8.0 (`dxgi.dll` in `valcraft-strangemap-valheim.zip`) and its shader headers | BSD-3-Clause; headers CC0-1.0 | `THIRD-PARTY.md` |
| Fabric API (downloaded from Modrinth by the app, not stored here) | Apache-2.0 | https://github.com/FabricMC/fabric |

## Why this repository exists

The SIGF app (https://sigf.ai) installs mods from recipes (`mashup.json`) whose downloads are pinned release files. This repository makes ValCraft (strangemap) installable in one click, credited to strangemap. If you are the author and want anything changed or taken down, open an issue here.
