"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/lib/LangToggle";

type Item = { url: string; uploadedAt: string; code?: string };

export default function HomePage() {
  const { lang, setLang, t } = useLang();
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [results, setResults] = useState<Item[] | null>(null);
  const [recent, setRecent] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingCode, setDeletingCode] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  function loadRecent(offset: number) {
    setLoadingMore(true);
    fetch(`/api/recent?offset=${offset}`)
      .then((r) => r.json())
      .then((data) => {
        setRecent((prev) => (offset === 0 ? data.items ?? [] : [...prev, ...(data.items ?? [])]));
        setHasMore(Boolean(data.hasMore));
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => {
    queueMicrotask(() => loadRecent(0));
  }, []);

  useEffect(() => {
    if (searched || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadRecent(recent.length);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [searched, hasMore, loadingMore, recent.length]);

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
    if (!confirm(t.confirmDeletePhoto)) return;
    setDeleting(true);
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setDeleting(false);
    if (res.ok) {
      setLightboxIndex(null);
      setResults((prev) => (prev ? prev.filter((it) => it.url !== url) : prev));
      setRecent((prev) => prev.filter((it) => it.url !== url));
    }
  }

  async function deleteWholeCode() {
    if (!searched || !results) return;
    if (!confirm(t.confirmDeleteCode(searched, results.length))) return;
    setDeletingCode(true);
    const res = await fetch("/api/delete-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: searched }),
    });
    setDeletingCode(false);
    if (res.ok) {
      setRecent((prev) => prev.filter((it) => it.code !== searched));
      clearSearch();
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1 className="app-title">{t.appTitle}</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangToggle lang={lang} setLang={setLang} />
          <Link href="/upload" className="btn-secondary">
            {t.uploadBtn}
          </Link>
        </div>
      </header>

      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoFocus
        className="search-input"
        placeholder={t.searchPlaceholder}
        value={code}
        onChange={(e) => onChange(e.target.value)}
      />

      {loading && <p className="hint-text">{t.searching}</p>}

      {!loading && searched && results && results.length === 0 && (
        <>
          <button className="btn-back" onClick={clearSearch}>
            ← {t.back}
          </button>
          <p className="empty-text">{t.notFound}</p>
        </>
      )}

      {!loading && results && results.length > 0 && (
        <section>
          <button className="btn-back" onClick={clearSearch}>
            ← {t.back}
          </button>
          <h2 className="section-title">{t.resultsTitle(searched ?? "", results.length)}</h2>
          <div className="grid">
            {results.map((item, i) => (
              <button key={item.url} className="thumb" onClick={() => setLightboxIndex(i)}>
                <img src={item.url} alt={`${searched}`} loading="lazy" />
              </button>
            ))}
          </div>
          <button className="btn-delete-code" disabled={deletingCode} onClick={deleteWholeCode}>
            {deletingCode ? t.deletingCode : t.deleteCode}
          </button>
        </section>
      )}

      {!searched && recentGroups.length > 0 && (
        <section>
          <h2 className="section-title">{t.recentTitle}</h2>
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
                <img src={group.cover} alt={group.code} loading="lazy" />
                {group.count > 1 && <span className="thumb-count">{t.photosCount(group.count)}</span>}
                <span className="thumb-code">{group.code}</span>
              </button>
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="hint-text">{t.loadingMore}</div>}
        </section>
      )}

      {lightboxIndex !== null && results && results[lightboxIndex] && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {lightboxIndex > 0 && (
              <button
                className="lightbox-nav lightbox-nav-prev"
                onClick={() => setLightboxIndex((i) => (i !== null ? i - 1 : i))}
                aria-label="prev"
              >
                ‹
              </button>
            )}
            <img src={results[lightboxIndex].url} alt="" />
            {lightboxIndex < results.length - 1 && (
              <button
                className="lightbox-nav lightbox-nav-next"
                onClick={() => setLightboxIndex((i) => (i !== null ? i + 1 : i))}
                aria-label="next"
              >
                ›
              </button>
            )}
          </div>
          {results.length > 1 && (
            <p className="lightbox-counter">
              {lightboxIndex + 1} / {results.length}
            </p>
          )}
          <button
            className="btn-delete"
            disabled={deleting}
            onClick={(e) => {
              e.stopPropagation();
              deleteImage(results[lightboxIndex].url);
            }}
          >
            {deleting ? t.deletingPhoto : t.deletePhoto}
          </button>
        </div>
      )}
    </div>
  );
}
