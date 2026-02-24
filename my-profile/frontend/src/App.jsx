import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function App() {
  const [activeTab, setActiveTab] = useState("profile");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Animation & Audio State ---
  const [appStage, setAppStage] = useState("CRUMPLED"); 
  const [currentTrack, setCurrentTrack] = useState(0); 
  const [volume, setVolume] = useState(0.1); // Initial 10%
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const playlist = [
    { name: "Who knows by Daniel Caesar - Track", src: "/daniel_caesar_song.mp3" },
    { name: "Heavy by The Marías - Track", src: "/marias_song.mp3" }
  ];

  const GALLERY = [
    { category: "ARTISTS", items: [{ name: "Daniel Caesar", img: "/daniel_caesar.jpg" }, { name: "The Marías", img: "/marias.jpg" }] },
    { category: "VIDEOGAMES", items: [{ name: "Valorant", img: "/valorant.jpg" }, { name: "CS2", img: "/cs2.jpg" }] },
    { category: "ANIME", items: [{ name: "L", img: "/L.jpg" }, { name: "FMAB", img: "/fmab.webp" }] }
  ];

  // --- Music Auto-Play Logic ---
  // This effect ensures that when currentTrack changes (via Next), it plays automatically
  useEffect(() => {
    if (appStage === "READY" && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Playback interrupted:", e));
    }
  }, [currentTrack, appStage]);

  // Sync volume slider
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleUncrumple = () => {
    setAppStage("UNCRUMPLING");
    if (videoRef.current) {
      videoRef.current.playbackRate = 4.0; 
      videoRef.current.play();
    }
    // Set initial volume to 10% and play
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch(e => console.error("Audio block:", e));
    }
  };

  const onVideoEnd = () => {
    setAppStage("READY");
    loadEntries();
  };

  const togglePlay = () => {
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const switchTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("guestbook").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadEntries(); }, []);

  const saveMessage = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("guestbook").insert([{ name: form.name.trim(), message: form.message.trim() }]);
      if (error) throw error;
      setForm({ name: "", message: "" });
      loadEntries();
    } catch (err) { alert("Error saving note."); } finally { setIsSubmitting(false); }
  };

  if (appStage !== "READY") {
    return (
      <div className="video-overlay" onClick={handleUncrumple}>
        <audio ref={audioRef} src={playlist[currentTrack].src} loop />
        <video ref={videoRef} src="/crumpled.mp4" onEnded={onVideoEnd} playsInline muted className="uncrumple-video" />
        {appStage === "CRUMPLED" && (
           <div className="uncrumple-prompt">
             <span className="uncrumple-text">UNCRUMPLE</span>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="notebook-container fade-in">
      <audio ref={audioRef} src={playlist[currentTrack].src} loop />

      <div className="mini-player">
        <div className="player-track-info">{playlist[currentTrack].name}</div>
        <div className="player-controls">
          <button onClick={togglePlay} className="ink-btn-sm">PLAY/PAUSE</button>
          <button onClick={switchTrack} className="ink-btn-sm">NEXT</button>
        </div>
        <div className="volume-slider">
          <span>VOL:</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(e.target.value)} />
        </div>
      </div>

      <nav className="notebook-nav">
        <button className={activeTab === "profile" ? "nav-link active" : "nav-link"} onClick={() => setActiveTab("profile")}>p1 Profile</button>
        <button className={activeTab === "guestbook" ? "nav-link active" : "nav-link"} onClick={() => setActiveTab("guestbook")}>p2 Guestbook</button>
      </nav>

      <div className="paper-sheet">
        {activeTab === "profile" ? (
          <section className="notebook-section">
            <header className="notebook-header">
              <h1>Daniel James J. Whitwell</h1>
              <p className="subtitle">Cyber Security & Forensics | Asia Pacific College</p>
            </header>
            <div className="stats-box">
              <div className="note-entry">
                <span className="ink-label">Interests: </span>
                <span className="ink-text">Videogames, Anime, Music</span>
              </div>
              {GALLERY.map((group) => (
                <div key={group.category} className="sketch-section">
                  <h3 className="sketch-title">// {group.category}</h3>
                  <div className="sketch-grid">
                    {group.items.map((item) => (
                      <div key={item.name} className="polaroid-frame">
                        <img src={item.img} alt={item.name} className="sketch-img" />
                        <span className="caption">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <main className="notebook-section">
            <h2 className="sketch-title">// GUESTBOOK</h2>
            <form onSubmit={saveMessage} className="ink-form">
              <input placeholder="Name/Alias" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <textarea placeholder="Leave a note..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows="4" />
              <button type="submit" className="ink-btn" disabled={isSubmitting}>{isSubmitting ? "Writing..." : "Post Message"}</button>
            </form>
            <div className="entry-list">
              {entries.map((entry) => (
                <div key={entry.id} className="post-it">
                  <strong>{entry.name}</strong>: {entry.message}
                </div>
              ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}