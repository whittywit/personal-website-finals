import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data);
    } catch (err) {
      console.error("Error loading guestbook:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("guestbook").insert([form]);
      if (error) throw error;
      setForm({ name: "", message: "" });
      load();
    } catch (err) {
      alert("Error saving message!");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase.from("guestbook").delete().eq("id", id);
      if (error) throw error;
      load();
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div className="container">
      <header className="profile-header">
        <h1>Wilkam!</h1>
        <p>Is this working...?</p>
      </header>

      <main className="guestbook-section">
        <h2>Guestbook</h2>
        <p className="text-muted">Leave your name and a message below</p>
        
        <form onSubmit={save} className="guestbook-form">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Write something nice..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows="4"
          />
          <button type="submit" className="btn-submit">
            Post Message
          </button>
        </form>

        <div className="entries-list">
          {loading ? (
            <div className="loading-spinner">Fetching messages...</div>
          ) : entries.length === 0 ? (
            <p className="text-muted">No messages yet. Be the first!</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <span className="entry-name">{entry.name}</span>
                  <span className="entry-date">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="entry-message">{entry.message}</p>
                <button
                  onClick={() => remove(entry.id)}
                  className="btn-delete"
                >
                  Delete Message
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}