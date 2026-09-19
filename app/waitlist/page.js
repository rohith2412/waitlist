"use client";

import { useState } from "react";

const ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT || "/api/waitlist";

export default function Page() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function onSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="wrap">
      <form onSubmit={onSubmit} className="form">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <button type="submit" disabled={status === "loading"} className="btn">
          {status === "loading" ? "…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
