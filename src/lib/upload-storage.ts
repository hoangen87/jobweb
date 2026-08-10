import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export class UploadStorageConfigurationError extends Error {
  constructor() {
    super("Hệ thống lưu trữ file trên Vercel chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
    this.name = "UploadStorageConfigurationError";
  }
}

type SaveUploadOptions = {
  blobFolder: "cv" | "jd";
  localSubdirectory?: string;
};

export async function saveUploadedFile(
  file: File,
  safeFileName: string,
  { blobFolder, localSubdirectory = "" }: SaveUploadOptions
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${blobFolder}/${safeFileName}`, file, {
      access: "private",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new UploadStorageConfigurationError();
  }

  const relativeUploadDir = path.join("uploads", localSubdirectory);
  const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeFileName), Buffer.from(await file.arrayBuffer()));

  return `/${path.posix.join("uploads", localSubdirectory, safeFileName)}`;
}
