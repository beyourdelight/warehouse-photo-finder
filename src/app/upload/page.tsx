"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import imageCompression from "browser-image-compression";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/lib/LangToggle";

type PreviewItem = { name: string; url: string; status: "compressing" | "uploading" | "done" | "error" };

function randomId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export default function UploadPage() {
  const { lang, setLang, t } = useLang();
  const [code, setCode] = useState("");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCount, setExistingCount] = useState<number | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  function onCodeChange(v: string) {
    setCode(v.replace(/\D/g, "").slice(0, 4));
    setExistingCount(null);
  }

  useEffect(() => {
    if (!/^\d{4}$/.test(code)) return;
    let cancelled = false;
    fetch(`/api/search?code=${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setExistingCount((data.items ?? []).length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (!/^\d{4}$/.test(code)) {
      setError(t.errorEnterCode);
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
    setExistingCount(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (libraryInputRef.current) libraryInputRef.current.value = "";
  }

  const codeReady = code.length === 4 && !busy;

  return (
    <div className="container">
      <header className="topbar">
        <h1 className="app-title">{t.uploadTitle}</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <Link href="/" className="btn-secondary">
            {t.searchBack}
          </Link>
        </div>
      </header>

      <label className="field-label">{t.codeLabel}</label>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoFocus
        className="search-input"
        placeholder={t.codePlaceholder}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      {existingCount !== null && existingCount > 0 && (
        <p className="warning-text">{t.codeExists(existingCount)}</p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="visually-hidden"
        disabled={!codeReady}
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        disabled={!codeReady}
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      <div className="upload-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!codeReady}
          onClick={() => cameraInputRef.current?.click()}
        >
          📷 {items.some((it) => it.status === "done") ? t.takePhotoAgain : t.takePhoto}
        </button>
        <button
          type="button"
          className="btn-secondary-lg"
          disabled={!codeReady}
          onClick={() => libraryInputRef.current?.click()}
        >
          🖼️ {t.chooseFromLibrary}
        </button>
      </div>

      {items.length > 0 && (
        <div className="grid">
          {items.map((it) => (
            <div key={it.name} className="thumb upload-thumb">
              <img src={it.url} alt="" />
              <span className={`badge badge-${it.status}`}>
                {it.status === "compressing" && t.statusCompressing}
                {it.status === "uploading" && t.statusUploading}
                {it.status === "done" && t.statusDone}
                {it.status === "error" && t.statusError}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && !busy && (
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={startNext}>
          {t.nextCode}
        </button>
      )}
    </div>
  );
}
