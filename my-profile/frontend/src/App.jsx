import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Load all guestbook entries
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

  // Save new entry
  const save = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("guestbook").insert([form]);
      if (error) throw error;
      setForm({ name: "", message: "" });
      load();
    } catch (err) {
      console.error("Error saving entry:", err);
    }
  };

  // Delete an entry
  const remove = async (id) => {
    try {
      const { error } = await supabase.from("guestbook").delete().eq("id", id);
      if (error) throw error;
      load();
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1>My Profile & Guestbook</h1>

      {/* Guestbook Form */}
      <form onSubmit={save} style={styles.form}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>
          Sign Guestbook
        </button>
      </form>

      <hr />

      {loading && <p>Loading entries...</p>}
      {!loading && entries.length === 0 && <p>No entries yet.</p>}

      {/* Guestbook Entries */}
      {entries.map((entry) => (
        <div key={entry.id} style={styles.card}>
          <p>
            <strong>{entry.name}</strong> (
            {new Date(entry.created_at).toLocaleString()})
          </p>
          <p>{entry.message}</p>
          <button
            onClick={() => remove(entry.id)}
            style={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// Simple styles for clean layout
const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "1rem",
  },
  input: {
    padding: "8px",
    fontSize: "14px",
  },
  textarea: {
    padding: "8px",
    fontSize: "14px",
    minHeight: "80px",
  },
  button: {
    padding: "10px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #ddd",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
  },
  deleteButton: {
    marginTop: "5px",
    padding: "5px",
    cursor: "pointer",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
  },
};