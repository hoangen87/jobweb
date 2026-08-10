import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";

const LEGACY_GEMINI_KEY_SETTING = "gemini_api_key";
const GEMINI_CONFIG_SETTING = "gemini_ai_config";
export const GEMINI_PROVIDER = "Google Gemini";
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"] as const;
export type GeminiModel = (typeof GEMINI_MODELS)[number];

type StoredGeminiConfiguration = { alias: string; model: GeminiModel; active: boolean; apiKey: string };
export type GeminiConfiguration = Omit<StoredGeminiConfiguration, "apiKey"> & {
  configured: boolean; updatedAt: Date | null; source: "database" | "environment" | "none";
};

function encryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "fallback-secret") throw new Error("SESSION_SECRET chưa được cấu hình an toàn.");
  return createHash("sha256").update(secret).digest();
}
function encrypt(value: string): string {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((item) => item.toString("base64")).join(".");
}
function decrypt(value: string): string {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("API key lưu trong hệ thống không hợp lệ.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64")), decipher.final()]).toString("utf8");
}
function validModel(value: unknown): value is GeminiModel { return GEMINI_MODELS.includes(value as GeminiModel); }
function parseStored(value: string): StoredGeminiConfiguration {
  const parsed = JSON.parse(decrypt(value)) as Partial<StoredGeminiConfiguration>;
  if (!parsed.apiKey || !validModel(parsed.model)) throw new Error("Cấu hình Gemini lưu trong hệ thống không hợp lệ.");
  return { alias: parsed.alias?.trim() || "Đánh giá hồ sơ ứng viên", model: parsed.model, active: parsed.active !== false, apiKey: parsed.apiKey };
}

export async function getGeminiConfiguration(): Promise<GeminiConfiguration> {
  if (process.env.GEMINI_API_KEY?.trim()) return { configured: true, alias: "Gemini từ môi trường", model: validModel(process.env.GEMINI_MODEL) ? process.env.GEMINI_MODEL : "gemini-3.6-flash", active: true, updatedAt: null, source: "environment" };
  const config = await prisma.systemSetting.findUnique({ where: { key: GEMINI_CONFIG_SETTING } });
  if (config) { const stored = parseStored(config.encryptedValue); return { configured: true, alias: stored.alias, model: stored.model, active: stored.active, updatedAt: config.updatedAt, source: "database" }; }
  const legacy = await prisma.systemSetting.findUnique({ where: { key: LEGACY_GEMINI_KEY_SETTING } });
  if (legacy) return { configured: true, alias: "Đánh giá hồ sơ ứng viên", model: "gemini-3.6-flash", active: true, updatedAt: legacy.updatedAt, source: "database" };
  return { configured: false, alias: "Đánh giá hồ sơ ứng viên", model: "gemini-3.6-flash", active: false, updatedAt: null, source: "none" };
}

export async function getActiveGeminiConfiguration(): Promise<(StoredGeminiConfiguration & { source: "database" | "environment" }) | null> {
  if (process.env.GEMINI_API_KEY?.trim()) return { alias: "Gemini từ môi trường", model: validModel(process.env.GEMINI_MODEL) ? process.env.GEMINI_MODEL : "gemini-3.6-flash", active: true, apiKey: process.env.GEMINI_API_KEY.trim(), source: "environment" };
  const config = await prisma.systemSetting.findUnique({ where: { key: GEMINI_CONFIG_SETTING } });
  if (config) { const stored = parseStored(config.encryptedValue); return stored.active ? { ...stored, source: "database" } : null; }
  const legacy = await prisma.systemSetting.findUnique({ where: { key: LEGACY_GEMINI_KEY_SETTING } });
  return legacy ? { alias: "Đánh giá hồ sơ ứng viên", model: "gemini-3.6-flash", active: true, apiKey: decrypt(legacy.encryptedValue), source: "database" } : null;
}

export async function saveGeminiConfiguration(input: { alias: string; model: GeminiModel; active: boolean; apiKey?: string }): Promise<void> {
  if (!validModel(input.model)) throw new Error("Model Gemini không được hỗ trợ.");
  const storedConfig = await prisma.systemSetting.findUnique({ where: { key: GEMINI_CONFIG_SETTING } });
  const legacyConfig = storedConfig ? null : await prisma.systemSetting.findUnique({ where: { key: LEGACY_GEMINI_KEY_SETTING } });
  const savedApiKey = storedConfig ? parseStored(storedConfig.encryptedValue).apiKey : legacyConfig ? decrypt(legacyConfig.encryptedValue) : "";
  const apiKey = input.apiKey?.trim() || savedApiKey;
  if (!apiKey) throw new Error("API key không được để trống.");
  const payload: StoredGeminiConfiguration = { alias: input.alias.trim() || "Đánh giá hồ sơ ứng viên", model: input.model, active: input.active, apiKey };
  await prisma.$transaction([
    prisma.systemSetting.upsert({ where: { key: GEMINI_CONFIG_SETTING }, create: { key: GEMINI_CONFIG_SETTING, encryptedValue: encrypt(JSON.stringify(payload)) }, update: { encryptedValue: encrypt(JSON.stringify(payload)) } }),
    prisma.systemSetting.deleteMany({ where: { key: LEGACY_GEMINI_KEY_SETTING } }),
  ]);
}
export async function deleteGeminiConfiguration(): Promise<void> {
  await prisma.systemSetting.deleteMany({ where: { key: { in: [GEMINI_CONFIG_SETTING, LEGACY_GEMINI_KEY_SETTING] } } });
}
export async function getGeminiApiKey(): Promise<string | null> { return (await getActiveGeminiConfiguration())?.apiKey ?? null; }
export async function saveGeminiApiKey(apiKey: string): Promise<void> { await saveGeminiConfiguration({ alias: "Đánh giá hồ sơ ứng viên", model: "gemini-3.6-flash", active: true, apiKey }); }
export async function getGeminiApiKeyStatus(): Promise<{ configured: boolean; updatedAt: Date | null }> { const config = await getGeminiConfiguration(); return { configured: config.configured, updatedAt: config.updatedAt }; }
