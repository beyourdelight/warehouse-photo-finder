"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/lib/LangToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, setLang, t } = useLang();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? t.loginFailed);
      return;
    }

    const next = searchParams.get("next") || "/";
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="page-center">
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <form className="card" onSubmit={onSubmit}>
        <h1 className="title">{t.loginTitle}</h1>
        <p className="subtitle">{t.loginSubtitle}</p>
        <input
          type="password"
          inputMode="text"
          autoFocus
          className="input-lg"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading || !password}>
          {loading ? t.loggingIn : t.loginBtn}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
