import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const recoveredAssets = [
  ["home", "media/6709e471672707c0cf4e6fa4_FunktionalGrotesk-Light.woff2", "font", "font/woff2", "6709e471672707c0cf4e6fa4"],
  ["home", "media/6709e4711141238c6075e88b_FunktionalGrotesk-Regular.woff2", "font", "font/woff2", "6709e4711141238c6075e88b"],
  ["home", "media/6709e4713af7da131946bb76_FunktionalGrotesk-Medium.woff2", "font", "font/woff2", "6709e4713af7da131946bb76"],
  ["home", "media/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2", "font", "font/woff2", "UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw"],
  ["home", "media/JTUQjIg1_i6t8kCHKm459WxRyS7m0dR9pA.woff2", "font", "font/woff2", "JTUQjIg1_i6t8kCHKm459WxRyS7m0dR9pA"],
  ["home", "media/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2", "font", "font/woff2", "JTUSjIg1_i6t8kCHKm459WlhyyTh89Y"],
  ["home", "media/TK3iWkUHHAIjg752GT8Gl-1PKw.woff2", "font", "font/woff2", "TK3iWkUHHAIjg752GT8Gl-1PKw"],
  ["hyphae", "media/growth-sim-transcode.mp4", "video", "video/mp4", "673e99ecf734e9a1b53d585c"],
  ["luma", "media/11-transcode.mp4", "video", "video/mp4", "68cc895c3452528c1dc05ba2"],
  ["luma", "media/screen-change-transcode.mp4", "video", "video/mp4", "671901563197d5d830944eed"],
  ["molekule-go", "media/UV-animation-transcode.mp4", "video", "video/mp4", "67b7caa46fb082fcc8c86951"],
  ["molekule-go", "media/aq-indicator-transcode.mp4", "video", "video/mp4", "67b7c911533b2b704339444a"],
  ["niche", "media/1-transcode.mp4", "video", "video/mp4", "689b2578633ba1f8a80670bb"],
  ["niche", "media/15-transcode.mp4", "video", "video/mp4", "689b26374c227b4b050983b4"],
  ["niche", "media/19-transcode.mp4", "video", "video/mp4", "689b2669f210fef8b8e2a145"],
  ["ping", "media/ping-functions.mp4", "video", "video/mp4", "6954c0b14010a0624b61e67e"],
  ["ping", "media/12.mp4", "video", "video/mp4", "6954df0d296b11374906723f"],
  ["ping", "media/app-functions.mp4", "video", "video/mp4", "6954c0f7d7d559ac2df5e0e6"],
];

for (const [project, path, kind, contentType, sourceMarker] of recoveredAssets) {
  const manifestPath = join("public/assets", project, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const filename = path.split("/").at(-1);
  const failureIndex = manifest.failures.findIndex((asset) => asset.url.includes(sourceMarker));

  if (failureIndex === -1) {
    throw new Error(`Could not match ${project}/${filename} to a failed asset.`);
  }

  const [failure] = manifest.failures.splice(failureIndex, 1);
  manifest.assets.push({
    ...failure,
    id: `recovered-${manifest.assets.length + 1}`,
    kind,
    contentType,
    path,
    recovered: true,
  });
  delete manifest.assets.at(-1).reason;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
