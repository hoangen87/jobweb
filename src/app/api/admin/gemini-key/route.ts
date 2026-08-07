import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { getGeminiApiKeyStatus, saveGeminiApiKey } from "@/lib/secure-settings";

const schema = z.object({
  apiKey: z.string().trim().min(10, "API key không hợp lệ.").max(500),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getGeminiApiKeyStatus());
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "API key không hợp lệ." }, { status: 400 });
  }

  try {
    await saveGeminiApiKey(parsed.data.apiKey);
    return NextResponse.json({ ok: true, configured: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể lưu API key." },
      { status: 500 }
    );
  }
}
