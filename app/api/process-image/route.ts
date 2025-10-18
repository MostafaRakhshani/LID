import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

function ensureLotsPath(url: string) {
  if (!url.startsWith("/lots/")) throw new Error("invalid path");
  const safe = url.replace(/\.\./g, "");
  return path.join(process.cwd(), "public", safe);
}

export async function POST(req: Request) {
  try {
    const { url, preset } = await req.json() as { url: string; preset?: "square" | "rect" | "thumb" };
    if (!url) return new Response("url required", { status: 400 });

    const inputPath = ensureLotsPath(url);
    const ok = await fs.stat(inputPath).then(() => true).catch(() => false);
    if (!ok) return new Response("not found", { status: 404 });

    // ????? ?????????
    const size = preset === "thumb" ? 400 :
                 preset === "rect"  ? 1200 :
                                      1200; // square

    const outDir = path.join(process.cwd(), "public", "lots");
    await fs.mkdir(outDir, { recursive: true });

    const base = path.basename(inputPath, path.extname(inputPath)).toLowerCase();
    const outName = `${base}-mkt-${Date.now()}.jpg`;
    const outPath = path.join(outDir, outName);

    await sharp(inputPath)
      .rotate() // ????? EXIF
      .resize(
        preset === "rect"
          ? { width: size, height: Math.round(size * 3 / 4), fit: "contain", background: "#ffffff" }
          : { width: size, height: size, fit: "contain", background: "#ffffff" }
      )
      .flatten({ background: "#ffffff" }) // ???????? ????
      .sharpen()
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);

    return Response.json({ url: `/lots/${outName}` });
  } catch {
    return new Response("processing error", { status: 500 });
  }
}
