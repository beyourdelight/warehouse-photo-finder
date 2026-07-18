"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import imageCompression from "browser-image-compression";

type PreviewItem = { name: string; url: string; status: "compressing" | "uploading" | "done" | "error" };

function randomId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export default function UploadPage() {
  const [code, setCode] = useState("");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onCodeChange(v: string) {
    setCode(v.replace(/\D/g, "").slice(0, 4));
  }

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (!/^\d{4}$/.test(code)) {
      setError("กรอกรหัส 4 หลักก่อนเลือกรูป");
      return;
    }
    setError(null);
    setBusy(true);

    const files = Array.from(fileList);

    for (const file of files) {
      const previewId = randomId();
      const localUrl = URL.createObjectURL(file);
      setItems((prev) => [...prev, { name: previewId, url: localUrl, status: "compressing" }]);

      try {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: 1600,
          initialQuality: 0.8,
          maxSizeMB: 0.4,
          useWebWorker: true,
          fileType: "image/jpeg",
        });

        setItems((prev) =>
          prev.map((it) => (it.name === previewId ? { ...it, status: "uploading" } : it))
        );

        const pathname = `products/${code}/${randomId()}.jpg`;

        await upload(pathname, compressed, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });

        setItems((prev) =>
          prev.map((it) => (it.name === previewId ? { ...it, status: "done" } : it))
        );
      } catch {
        setItems((prev) =>
          prev.map((it) => (it.name === previewId ? { ...it, status: "error" } : it))
        );
      }
    }

    setBusy(false);
  }

  function startNext() {
    setCode("");
    setItems([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1 className="app-title">อัพโหลดรูป</h1>
        <Link href="/" className="btn-secondary">
          ค้นหา
        </Link>
      </header>

      <label className="field-label">รหัสสินค้า (4 หลัก)</label>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoFocus
        className="search-input"
        placeholder="เช่น 1234"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="file-input"
        disabled={code.length !== 4 || busy}
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      {items.length > 0 && (
        <div className="grid">
          {items.map((it) => (
            <div key={it.name} className="thumb upload-thumb">
              <img src={it.url} alt="" />
              <span className={`badge badge-${it.status}`}>
                {it.status === "compressing" && "กำลังย่อ..."}
                {it.status === "uploading" && "กำลังอัพ..."}
                {it.status === "done" && "สำเร็จ"}
                {it.status === "error" && "ผิดพลาด"}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && !busy && (
        <button className="btn-primary" onClick={startNext}>
          อัพรหัสถัดไป
        </button>
      )}
    </div>
  );
}
