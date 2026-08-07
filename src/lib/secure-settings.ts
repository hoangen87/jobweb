import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";

const GEMINI_KEY_SETTING = "gemini_api_key";

function encryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "fallback-secret") {
    throw new Error("SESSION_SECRET chưa được cấu hình an toàn.");
  }
  return createHash("sha256").update(secret).digest();
}

function encrypt(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((item) => item.toString("base64")).join(".");
}

function decrypt(value: string): string {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("API key lưu trong hệ thống không hợp lệ.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const normalized = apiKey.trim();
  if (!normalized) throw new Error("API key không được để trống.");
  await prisma.systemSetting.upsert({
    where: { key: GEMINI_KEY_SETTING },
    create: { key: GEMINI_KEY_SETTING, encryptedValue: encrypt(normalized) },
    update: { encryptedValue: encrypt(normalized) },
  });
}

export async function getGeminiApiKey(): Promise<string | null> {
  if (process.env.GEMINI_API_KEY?.trim()) return process.env.GEMINI_API_KEY.trim();
  const setting = await prisma.systemSetting.findUnique({ where: { key: GEMINI_KEY_SETTING } });
  return setting ? decrypt(setting.encryptedValue) : null;
}

export async function getGeminiApiKeyStatus(): Promise<{ configured: boolean; updatedAt: Date | null }> {
  if (process.env.GEMINI_API_KEY?.trim()) return { configured: true, updatedAt: null };
  const setting = await prisma.systemSetting.findUnique({
    where: { key: GEMINI_KEY_SETTING },
    select: { updatedAt: true },
  });
  return { configured: Boolean(setting), updatedAt: setting?.updatedAt ?? null };
}
