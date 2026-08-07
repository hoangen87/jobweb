"use client";

import { useEffect, useState } from "react";

export default function ApiKeyButton() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/gemini-key")
      .then((response) => response.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => undefined);
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/gemini-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể lưu API key.");
      setConfigured(true);
      setApiKey("");
      setMessage("Đã mã hóa và lưu Gemini API key.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu API key.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative mt-4 flex justify-end">
      <button type="button" onClick={() => setOpen((value) => !value)} className="btn-secondary">
        Add API Key
        <span className={`ml-2 h-2 w-2 rounded-full ${configured ? "bg-green-500" : "bg-gray-300"}`} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-5 text-left shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Gemini API Key</h2>
              <p className="mt-1 text-xs text-gray-500">
                Trạng thái: {configured ? "Đã cấu hình" : "Chưa cấu hình"}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">Đóng</button>
          </div>
          <form onSubmit={save} className="mt-4">
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              required
              className="input-field"
              placeholder="Dán Gemini API key tại đây"
            />
            <button type="submit" disabled={saving || apiKey.trim().length < 10} className="btn-primary mt-3 w-full">
              {saving ? "Đang lưu..." : configured ? "Thay API Key" : "Lưu API Key"}
            </button>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Key được mã hóa bằng AES-256-GCM trước khi lưu và không hiển thị lại trên trình duyệt.
          </p>
          {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}
        </div>
      )}
    </div>
  );
}
