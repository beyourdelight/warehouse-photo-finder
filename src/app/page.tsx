"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { url: string; uploadedAt: string; code?: string };

export default function HomePage() {
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [results, setResults] = useState<Item[] | null>(null);
  const [recent, setRecent] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/recent")
      .then((r) => r.json())
      .then((data) => setRecent(data.items ?? []))
      .catch(() => {});
  }, []);

  const recentGroups: { code: string; cover: string; count: number }[] = [];
  for (const item of recent) {
    if (!item.code) continue;
    const existing = recentGroups.find((g) => g.code === item.code);
    if (existing) {
      existing.count += 1;
    } else {
      recentGroups.push({ code: item.code, cover: item.url, count: 1 });
    }
  }

  async function runSearch(value: string) {
    if (!/^\d{4}$/.test(value)) return;
    setLoading(true);
    setSearched(value);
    const res = await fetch(`/api/search?code=${value}`);
    const data = await res.json();
    setResults(data.items ?? []);
    setLoading(false);
  }

  function clearSearch() {
    setCode("");
    setResults(null);
    setSearched(null);
  }

  function onChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4) {
      runSearch(digits);
    } else {
      setResults(null);
      setSearched(null);
    }
  }

  async function deleteImage(url: string) {
    if (!confirm("ลบรูปนี้?")) return;
    setDeleting(true);
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setDeleting(false);
    if (res.ok) {
      setLightbox(null);
      setResults((prev) => (prev ? prev.filter((it) => it.url !== url) : prev));
      setRecent((prev) => prev.filter((it) => it.url !== url));
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1 className="app-title">ค้นหากล่องสินค้า</h1>
        <Link href="/upload" className="btn-secondary">
          + อัพโหลด
        </Link>
      </header>

      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoFocus
        className="search-input"
        placeholder="รหัส 4 ตัวท้าย"
        value={code}
        onChange={(e) => onChange(e.target.value)}
      />

      {loading && <p className="hint-text">กำลังค้นหา...</p>}

      {!loading && searched && results && results.length === 0 && (
        <>
          <button className="btn-back" onClick={clearSearch}>
            ← กลับ
          </button>
          <p className="empty-text">ไม่พบรหัสสินค้า ติดต่อผู้ดูแล</p>
        </>
      )}

      {!loading && results && results.length > 0 && (
        <section>
          <button className="btn-back" onClick={clearSearch}>
            ← กลับ
          </button>
          <h2 className="section-title">
            รหัส {searched} — {results.length} รูป
          </h2>
          <div className="grid">
            {results.map((item) => (
              <button key={item.url} className="thumb" onClick={() => setLightbox(item.url)}>
                <img src={item.url} alt={`สินค้า ${searched}`} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      )}

      {!searched && recentGroups.length > 0 && (
        <section>
          <h2 className="section-title">อัพโหลดล่าสุด</h2>
          <div className="grid">
            {recentGroups.map((group) => (
              <button
                key={group.code}
                className="thumb"
                onClick={() => {
                  setCode(group.code);
                  runSearch(group.code);
                }}
              >
                <img src={group.cover} alt={`สินค้า ${group.code}`} loading="lazy" />
                {group.count > 1 && <span className="thumb-count">{group.count} รูป</span>}
                <span className="thumb-code">{group.code}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
          <button
            className="btn-delete"
            disabled={deleting}
            onClick={(e) => {
              e.stopPropagation();
              deleteImage(lightbox);
            }}
          >
            {deleting ? "กำลังลบ..." : "ลบรูปนี้"}
          </button>
        </div>
      )}
    </div>
  );
}
