"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [content, setContent] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_content");
    if (stored) setContent(JSON.parse(stored));
  }, []);

  const save = () => {
    localStorage.setItem("admin_content", JSON.stringify(content));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin</h1>

      <label>Hero title</label>
      <input
        value={content.heroTitle || ""}
        onChange={e => setContent({ ...content, heroTitle: e.target.value })}
        style={{ width: "100%", marginBottom: 20 }}
      />

      <button onClick={save}>Сохранить</button>
      {saved && <p>Сохранено</p>}
    </div>
  );
}
