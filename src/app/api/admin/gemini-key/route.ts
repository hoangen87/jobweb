import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { deleteGeminiConfiguration, GEMINI_BASE_URL, GEMINI_MODELS, GEMINI_PROVIDER, getActiveGeminiConfiguration, getGeminiConfiguration, saveGeminiConfiguration } from "@/lib/secure-settings";

const schema = z.object({ alias: z.string().trim().min(2).max(80), model: z.enum(GEMINI_MODELS), active: z.boolean().default(true), apiKey: z.string().trim().min(10).max(500).optional() });
async function authorized() { const admin = await getCurrentAdminUser(); return !!admin && hasPermission(admin.role, "AI_CONFIGURE"); }
export async function GET() { if (!(await authorized())) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ ...(await getGeminiConfiguration()), provider: GEMINI_PROVIDER, baseUrl: GEMINI_BASE_URL, task: "Đánh giá hồ sơ ứng viên" }); }
export async function PUT(req: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Thông tin cấu hình AI không hợp lệ." }, { status: 400 });
  try { const current = await getGeminiConfiguration(); if (current.source === "environment") return NextResponse.json({ error: "Cấu hình này đang được quản lý bằng biến môi trường Vercel." }, { status: 409 }); await saveGeminiConfiguration(parsed.data); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể lưu cấu hình AI." }, { status: 500 }); }
}
export async function POST() {
  if (!(await authorized())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const config = await getActiveGeminiConfiguration(); if (!config) return NextResponse.json({ error: "Cấu hình AI chưa được kích hoạt." }, { status: 400 });
  try { const response = await fetch(`${GEMINI_BASE_URL}/models/${config.model}?key=${encodeURIComponent(config.apiKey)}`, { signal: AbortSignal.timeout(15000) }); if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body?.error?.message || `Gemini trả về HTTP ${response.status}.`); } return NextResponse.json({ ok: true, message: "Kết nối Gemini thành công." }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message.slice(0, 240) : "Không thể kết nối Gemini." }, { status: 502 }); }
}
export async function DELETE() { if (!(await authorized())) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const current = await getGeminiConfiguration(); if (current.source === "environment") return NextResponse.json({ error: "Hãy xóa GEMINI_API_KEY trong Vercel Environment Variables." }, { status: 409 }); await deleteGeminiConfiguration(); return NextResponse.json({ ok: true }); }
