import { NextResponse } from "next/server";

import {
  exportLibraryCsv,
  exportLibraryMarkdown,
} from "@/features/interview-prep/interview-prep.service";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const topicId = url.searchParams.get("topicId");
  const packId = url.searchParams.get("packId");
  const format = (url.searchParams.get("format") ?? "md").toLowerCase();
  const params = {
    ...(topicId ? { topicId } : {}),
    ...(packId ? { packId } : {}),
  };

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const csv = await exportLibraryCsv(params);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="interview-prep-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const markdown = await exportLibraryMarkdown(params);
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="interview-prep-${stamp}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
