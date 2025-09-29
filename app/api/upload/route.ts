// app/api/upload/route.ts
export const runtime = "nodejs";

import { promises as fs } from "fs";
import path from "path";

function sanitize(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response("file required", { status: 400 });

  const ext = path.extname(file.name || "").toLowerCase() || ".bin";
  const base = sanitize(path.basename(file.name || "upload", ext)) || "upload";
  const filename = `${Date.now()}-${base}${ext}`;

  const dir = path.join(process.cwd(), "public", "lots");
  await fs.mkdir(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buf);

  const url = `/lots/${filename}`;
  return Response.json({ url });
}
