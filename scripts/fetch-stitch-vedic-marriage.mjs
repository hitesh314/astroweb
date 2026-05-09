#!/usr/bin/env node
/**
 * Resolves Stitch signed download URLs via @google/stitch-sdk (get_screen),
 * then saves HTML and PNGs under design/stitch/vedic-marriage-destiny/.
 *
 * Requires STITCH_API_KEY (https://stitch.withgoogle.com/settings).
 * Optionally put it in .env.local — this script loads that file lightly.
 *
 * Downloads use fetch() (follows redirects like curl -L).
 * Or: USE_CURL=1 npm run stitch:export — uses curl -fsSL.
 */

import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "design", "stitch", "vedic-marriage-destiny");

const PROJECT_ID = "13749506130185011983";

/** @type {{ dir: string; title: string; ids: string[] }[]} */
const SCREENS = [
  {
    dir: "01-design-system",
    title: "Design System",
    ids: [
      "dfdfd6030b90436c97055e7e9c736e0a",
      "asset-stub-assets-dfdfd6030b90436c97055e7e9c736e0a-1778321761792",
    ],
  },
  {
    dir: "02-astro-marriage-discover-mobile",
    title: "AstroMarriage | Discover Your Destiny (Light Mode)",
    ids: ["33d78f6b539343a995f54d63991523ea"],
  },
  {
    dir: "03-celestial-union-forecast-mobile",
    title: "Your Celestial Union Forecast (Light Mode)",
    ids: ["40dc78fe3f894e18893da11299bcda61"],
  },
  {
    dir: "04-birth-details-mobile",
    title: "Enter Your Birth Details (Light Mode)",
    ids: ["3cba5e9109ee4f57afbf66ee52271b5d"],
  },
  {
    dir: "05-vedic-insights-mobile",
    title: "Vedic Insights & Kundli Analysis (Light Mode)",
    ids: ["b9fcd8789e8f43789d48e1edf73de8df"],
  },
  {
    dir: "06-aligning-stars-mobile",
    title: "Aligning Your Stars (Light Mode)",
    ids: ["333b71368169483494fb51df070b94a4"],
  },
  {
    dir: "07-astro-marriage-discover-desktop",
    title: "AstroMarriage | Discover Your Destiny (Light Mode Desktop)",
    ids: ["9045cf9f72564d32baeeedbe0b2ecf01"],
  },
  {
    dir: "08-aligning-stars-desktop",
    title: "Aligning Your Stars (Light Mode Desktop)",
    ids: ["830a68dc8ae44604865af2d17db59de3"],
  },
  {
    dir: "09-birth-details-desktop",
    title: "Enter Your Birth Details (Light Mode Desktop)",
    ids: ["26d3c67c3e5143d288b1f133b72417d9"],
  },
  {
    dir: "10-celestial-union-forecast-desktop",
    title: "Your Celestial Union Forecast (Light Mode Desktop)",
    ids: ["05c41e6399a541b0929081360ee54f1e"],
  },
  {
    dir: "11-vedic-insights-desktop",
    title: "Vedic Insights & Kundli Analysis (Light Mode Desktop)",
    ids: ["dfa001b9d94b4d688af35297576d5358"],
  },
];

async function loadEnvLocal() {
  try {
    const raw = await readFile(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      let v = trimmed.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (
        !process.env[k] &&
        (k === "STITCH_API_KEY" || k === "STITCH_ACCESS_TOKEN")
      ) {
        process.env[k] = v;
      }
    }
  } catch {
    /* optional */
  }
}

/**
 * @param {string} url
 * @param {string} destPath
 * @param {boolean} binary
 */
async function downloadUrl(url, destPath, binary) {
  const useCurl = process.env.USE_CURL === "1";
  if (useCurl) {
    execFileSync("curl", ["-fsSL", url, "-o", destPath], { stdio: "inherit" });
    return;
  }
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, binary ? buf : buf.toString("utf8"));
}

async function exportDesignSystems(stitchModule) {
  const { stitch } = stitchModule;
  const project = stitch.project(PROJECT_ID);
  const list = await project.listDesignSystems();
  const dsRoot = join(OUT, "01-design-system");
  await mkdir(dsRoot, { recursive: true });

  /** @type {unknown[]} */
  const summary = [];
  let i = 0;
  for (const ds of list) {
    const assetId =
      ds.assetId ??
      ds.data?.name?.replace(/^assets\//, "") ??
      `design-system-${i++}`;
    const safeName = String(assetId).replace(/[^\w.-]+/g, "_");
    const theme = ds.data?.designSystem?.theme;
    const designMd = theme?.designMd;
    if (designMd) {
      await writeFile(join(dsRoot, `${safeName}-DESIGN.md`), designMd, "utf8");
    }
    await writeFile(
      join(dsRoot, `${safeName}-full.json`),
      JSON.stringify(ds.data ?? { assetId: ds.assetId }, null, 2),
      "utf8",
    );
    summary.push({ assetId: String(assetId), hasDesignMd: !!designMd });
  }
  await writeFile(
    join(dsRoot, "design-systems-index.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
}

await loadEnvLocal();

if (!process.env.STITCH_API_KEY && !process.env.STITCH_ACCESS_TOKEN) {
  console.error(
    "Missing STITCH_API_KEY or STITCH_ACCESS_TOKEN. Add STITCH_API_KEY to .env.local (see https://stitch.withgoogle.com/settings ).",
  );
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const stitchMod = await import("@google/stitch-sdk");
await exportDesignSystems(stitchMod);

const { stitch } = stitchMod;
const project = stitch.project(PROJECT_ID);

/** @type {Record<string, unknown>} */
const manifest = {
  projectId: PROJECT_ID,
  projectTitle: "Vedic Marriage Destiny",
  outputDir: OUT,
  screens: [],
};

for (const spec of SCREENS) {
  const dirPath = join(OUT, spec.dir);
  await mkdir(dirPath, { recursive: true });
  /** @type {{ id: string; error?: string }} */
  let result = { id: "", error: "no id tried" };

  for (const screenId of spec.ids) {
    try {
      const screen = await project.getScreen(screenId);
      const htmlUrl = await screen.getHtml();
      const imageUrl = await screen.getImage();
      if (!htmlUrl) throw new Error("empty htmlCode.downloadUrl");
      await downloadUrl(htmlUrl, join(dirPath, "code.html"), false);
      if (imageUrl) {
        await downloadUrl(imageUrl, join(dirPath, "screen.png"), true);
      }
      result = {
        id: screenId,
        html: "code.html",
        ...(imageUrl ? { image: "screen.png" } : {}),
      };
      break;
    } catch (e) {
      result = {
        id: screenId,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  manifest.screens.push({
    dir: spec.dir,
    title: spec.title,
    ...result,
  });
}

await writeFile(
  join(OUT, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8",
);

console.log("Stitch export complete:", OUT);
