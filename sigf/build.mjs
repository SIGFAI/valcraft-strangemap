// ValCraft by strangemap (MIT): real Minecraft Java composited into Valheim's picture. A port of universal-modder's
// Minecraft x GTA V passthrough (rehan-remade, MIT): a hidden Minecraft 26.3 + Fabric mod `passthrough` serves
// ws://127.0.0.1:25599 and exports its frame to the shared memory Local\MCPassthroughFrame; in Valheim a BepInEx plugin
// (ValCraft.dll) sends camera, ground and hits, and a ReShade add-on (ValCraft.addon64 + MCPassthrough.fx) composites the
// frame. Not library/valcraft (LoAlCo's ValCraft, a SkyCraft port with its own Minecraft bundle): never both at once.
// Rehosted on SIGFAI/valcraft-strangemap (standard upstream fusion) from release v0.1.0, every upstream file unchanged.
// Upstream's install.ps1 is not used; its layout is reproduced:
//   - BepInExPack_Valheim 5.4.2350 (Thunderstore, the pack library/valcraft pins, unchanged), root BepInExPack_Valheim/;
//   - ReShade 6.8.0 add-on build: ReShade64.dll unchanged as dxgi.dll (upstream: extracted from the official setup), the
//     two CC0 shader headers and its license: the same files SIGF took for um-gta5-passthrough (hashes in its
//     source.json, read from $SIGF_LIBRARY_BUILDS/um-gta5-passthrough/reshade/, files of
//     s3://sigf-studio-954976316699-eu-west-1/work/library-builds/um-gta5-passthrough/0f5dcdfd.../reshade/);
//   - ReShade.ini / ReShadePreset.ini with upstream's text (install.ps1), ValCraft.addon64, MCPassthrough.fx,
//     BepInEx/plugins/ValCraft.dll.
// The plugin's own Minecraft autostart stays on (default config): the app starts Minecraft first and waits for port
// 25599, so the plugin sees it running and never starts a launcher, and on quit it tells Minecraft to close.
//   SIGF_LIBRARY_BUILDS=<dir> node library/valcraft-strangemap/build.mjs      (outputs: library/lib.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { mrpack, resolveFabricApi, sha256, unzip } from '../../orchestrator/src/recipe.js';
import { ROOT, asset, card, dl, emit, pinned, player, zipAsset } from '../lib.mjs';
import { RESHADE, sourceOf } from '../um-gta5-passthrough/sigf-build.mjs';

const UP = {
  repo: 'https://github.com/strangemap/valcraft', tag: 'v0.1.0', commit: '0dc1cd2484b1036b213a7e37bef1297f6b16ae74',
  license: 'MIT', authors: ['strangemap'],
  zip: { file: 'ValCraft-0.1.0.zip', sha256: '60e07ee7c5249b97e90b35bae9a5522e3d9e66fd041a0207276fce9de19169b7' }, // = GitHub digest, 2026-10-07
  files: {
    'files/ValCraft.dll': '80912360555093c5451452deeedf04228aa32d38f901a09b56ad33c5d8047b9e',
    'files/ValCraft.addon64': 'a3fa8a9a9d1a94aa2e31e2ba20c9599d1d37934c6c01696266a7f0e121f37699',
    'files/MCPassthrough.fx': 'c68e178c7fc3dbe5d4e10f0172fed14d0ea8ff3f9cce92a1b785f7373ea9d983',
    'files/valcraft-mc.jar': '74166af056a62e0706e9a3d0d384ad96e705529fa06349f0a4e1925efe51426e',
  },
};
const UM = { repo: 'https://github.com/rehan-remade/universal-modder' };
const ID = 'valcraft-strangemap', VERSION = '0.1.0', NAME = 'ValCraft (strangemap)';
const MC = { mc: '26.3', loader: '0.19.5', fabricApi: '0.161.0+26.3', java: '25' }; // mc/gradle.properties at the tag
const TAGLINE = 'Real Minecraft drawn inside Valheim: build blocks the trolls bump into and fight with Minecraft swords, bows and TNT.';
// The pack library/valcraft pins (Thunderstore file, rehosted unchanged).
const BEPV = {
  id: 'bepinexpack-valheim', version: '5.4.2350', file: 'denikson-BepInExPack_Valheim-5.4.2350.zip',
  url: 'https://thunderstore.io/package/download/denikson/BepInExPack_Valheim/5.4.2350/',
  page: 'https://thunderstore.io/c/valheim/p/denikson/BepInExPack_Valheim/',
  sha256: '37a91c000b4e88f2ed7a4bd7d812239852d2e36cbf0ff0a9f5faacfba46b105f',
  repo: 'https://github.com/AzumattDev/BepInEx', commit: 'ef506e0a6bb98c49d85b7927b5ab625605826be0',
  license: 'LGPL-2.1 (BepInEx 5.4.23.5) + MIT (Valheim changes, Harmony, MonoMod, Mono.Cecil)',
};
// install.ps1 at the tag, byte for byte (CRLF, ASCII).
const RESHADE_INI = [
  '[GENERAL]', 'EffectSearchPaths=.\\reshade-shaders\\Shaders\\', 'TextureSearchPaths=.\\reshade-shaders\\Textures\\', 'PresetPath=.\\ReShadePreset.ini',
  'PreprocessorDefinitions=RESHADE_DEPTH_INPUT_IS_REVERSED=1,RESHADE_DEPTH_INPUT_IS_UPSIDE_DOWN=0,RESHADE_DEPTH_INPUT_IS_LOGARITHMIC=0,RESHADE_DEPTH_LINEARIZATION_FAR_PLANE=1000',
  '', '[ADDON]', 'AddonPath=.\\', '', '[OVERLAY]', 'TutorialProgress=4', 'ShowClock=0', 'ShowFPS=0', '',
].join('\r\n');
const RESHADE_PRESET = 'Techniques=MCPassthrough@MCPassthrough.fx\r\nTechniqueSorting=MCPassthrough@MCPassthrough.fx\r\n';

// ReShade files: the ones recorded for um-gta5-passthrough.
const rsHashes = sourceOf('um-gta5-passthrough').built.artifacts;
const rsDir = path.join(process.env.SIGF_LIBRARY_BUILDS ?? path.join(ROOT, 'orchestrator', 'test', 'out', 'library-builds'), 'um-gta5-passthrough');
const rs = (name) => {
  const data = fs.readFileSync(path.join(rsDir, ...name.split('/')));
  if (sha256(data) !== rsHashes[name]) throw new Error(`${name}: not the recorded ReShade ${RESHADE.version} file`);
  return data;
};

const up = new Map(unzip(await pinned(`${UP.repo}/releases/download/${UP.tag}/${UP.zip.file}`, UP.zip.sha256)).map(e => [e.name.replace(/\\/g, '/'), e.data]));
for (const [f, h] of Object.entries(UP.files)) if (!up.has(f) || sha256(up.get(f)) !== h) throw new Error(`${UP.zip.file}: ${f} missing or not the reviewed build`);
const bepv = asset(BEPV.file, await pinned(BEPV.url, BEPV.sha256, BEPV.file), { zipped: true });
const valheim = zipAsset(`${ID}-valheim.zip`, [
  { name: 'BepInEx/plugins/ValCraft.dll', data: up.get('files/ValCraft.dll') },
  { name: 'ValCraft.addon64', data: up.get('files/ValCraft.addon64') },
  { name: 'reshade-shaders/Shaders/MCPassthrough.fx', data: up.get('files/MCPassthrough.fx') },
  { name: 'dxgi.dll', data: rs('reshade/ReShade64.dll') },
  { name: 'reshade-shaders/Shaders/ReShade.fxh', data: rs('reshade/ReShade.fxh') },
  { name: 'reshade-shaders/Shaders/ReShadeUI.fxh', data: rs('reshade/ReShadeUI.fxh') },
  { name: 'reshade-shaders/LICENSE-ReShade.md', data: rs('reshade/ReShade-LICENSE.md') },
  { name: 'ReShade.ini', data: Buffer.from(RESHADE_INI) },
  { name: 'ReShadePreset.ini', data: Buffer.from(RESHADE_PRESET) },
  { name: 'ValCraft-LICENSE.txt', data: up.get('LICENSE') },
]);
const pack = async (offline) => {
  const fabricApi = offline ? null : await resolveFabricApi(MC.fabricApi, MC.mc);
  if (!offline && !fabricApi?.download) throw new Error(`Fabric API ${MC.fabricApi} not resolved on Modrinth`);
  return asset(`${ID}.mrpack`, mrpack({ name: NAME, summary: TAGLINE, versions: MC, versionId: VERSION, fabricApi,
    jars: [{ name: 'valcraft-mc.jar', data: up.get('files/valcraft-mc.jar') }],
    extra: [{ name: 'overrides/licenses/valcraft-strangemap-LICENSE.txt', data: up.get('LICENSE') }] }));
};
const assets = [bepv, valheim, await pack(false)];

const make = (urls, set) => {
  const mp = set.find(a => a.name.endsWith('.mrpack'));
  return {
    id: `sigf/${ID}`,
    version: VERSION,
    name: NAME,
    tagline: player(ID).tagline ?? TAGLINE,
    how_to_play: player(ID).howToPlay,
    kind: 'passthrough',
    games: [
      { game: 'valheim', role: 'host', label: 'Valheim', engine: 'Valheim (Unity 6, Mono, DirectX 11) + BepInEx 5 plugin ValCraft (C#) + ReShade add-on ValCraft.addon64 (C++)', apps: { steam: '892970' }, runtime: 'Unity 6000.0.75 build of the author (2026-10-05); no version check; DirectX 11 only (-force-d3d11)' },
      { game: 'minecraft', role: 'guest', label: 'Minecraft', engine: 'Minecraft Java 26.3 + Fabric mod passthrough (universal-modder\'s, with ValCraft\'s changes)', mc: MC.mc, loader: `fabric@${MC.loader}`, java: MC.java },
    ],
    requires: [
      { id: BEPV.id, version: BEPV.version, license: `${BEPV.license}, shipped unchanged`, page: BEPV.page,
        note: 'the Valheim build of BepInEx; installed into the game folder by the app', source: { url: urls[bepv.name], sha256: bepv.sha256 } },
      { id: RESHADE.id, version: RESHADE.version, license: `${RESHADE.license}, ReShade64.dll shipped unchanged as dxgi.dll`, page: RESHADE.page,
        note: 'the add-on build of ReShade composites Minecraft into Valheim; installed into the game folder by the app' },
      { id: 'fabric-loader', version: MC.loader },
      { id: 'fabric-api', version: MC.fabricApi, note: 'in the Minecraft pack (downloaded from Modrinth)' },
    ],
    install: [
      { game: 'valheim', strategy: 'game-dir-snapshot', loader: 'bepinex', files: [
        { src: bepv.name, dst: '{game}', root: 'BepInExPack_Valheim', unpack: true, contents: bepv.contents, ...dl(bepv, urls) },
        { src: valheim.name, dst: '{game}', unpack: true, contents: valheim.contents, ...dl(valheim, urls) },
      ] },
      // -Dpassthrough.startHidden=true: Minecraft's window is made see-through (upstream's instance.cfg; its
      // --enable-native-access is not on the app's whitelist and only silences a warning on Java 25).
      { game: 'minecraft', strategy: 'mrpack', jvm_args: ['-Dpassthrough.startHidden=true'], pack: { src: mp.name, ...dl(mp, urls) } },
    ],
    // Minecraft first (its mod listens on 127.0.0.1:25599: the plugin then skips its own autostart), then Valheim on
    // DirectX 11 (ReShade's dxgi.dll needs it; Valheim defaults to Vulkan).
    launch: [{ game: 'minecraft', wait: 'port:25599' }, { game: 'valheim', args: ['-force-d3d11'] }],
    files: set.map(a => ({ name: a.name, ...dl(a, urls) })),
    source: {
      repo: UP.repo, license: 'MIT AND LGPL-2.1 AND BSD-3-Clause', upstream_license: UP.license, tag: UP.tag, commit: UP.commit,
      hosted: `https://github.com/SIGFAI/${ID}`,
      based_on: UM.repo,
      bundled: [
        { name: 'BepInExPack_Valheim', version: BEPV.version, repo: BEPV.repo, commit: BEPV.commit, license: BEPV.license },
        { name: 'ReShade', version: RESHADE.version, repo: RESHADE.repo, commit: RESHADE.commit, license: RESHADE.license },
        { name: 'reshade-shaders (ReShade.fxh, ReShadeUI.fxh)', repo: RESHADE.shaders.repo, commit: RESHADE.shaders.commit, license: RESHADE.shaders.license },
      ],
    },
    media: { cover: "https://raw.githubusercontent.com/strangemap/valcraft/70d3389fac5d67b7001a156fc3623b622aa7c0fb/docs/img/meadow.jpg" },
    built_by: { author: UP.authors[0], authors: [...UP.authors, 'Rehan and universal-modder contributors'], packaged_by: 'SIGF' },
    idea_by: UP.authors[0],
    built_at: '2026-10-07T00:00:00.000Z',
    // Never installed together (the app refuses either order): LoAlCo's ValCraft: the same BepInEx in the Valheim folder.
    conflicts: ['sigf/valcraft'],
    ...card(UP.repo),
    notes: player(ID).notes,
  };
};

emit({ slug: ID, version: VERSION, assets, make });
