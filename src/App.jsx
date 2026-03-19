import { useState, useEffect, useMemo } from "react";

export default function App() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetching logic
  useEffect(() => {
    fetch("/api/getCards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data.length ? data : [{ front: "", back: "" }]);
      })
      .catch(() => setCards([{ front: "", back: "" }]))
      .finally(() => setLoading(false));
  }, []);

  // Current card helper
  const currentCard = cards[currentIndex];

  // 2. Optimized Handlers
  const handleUpdate = (side, value) => {
    const updated = [...cards];
    updated[currentIndex] = { ...updated[currentIndex], [side]: value };
    setCards(updated);
  };

  const handleSave = async () => {
    const { id, front, back } = currentCard;
    const endpoint = id ? "/api/updateCard" : "/api/addCard";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, front, back }),
      });
      const saved = await res.json();
      
      const updated = [...cards];
      updated[currentIndex] = saved; // Sync with DB ID
      setCards(updated);
      alert("Saved!");
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const changeCard = (dir) => {
    setIsFlipped(false); // Reset flip when moving
    setCurrentIndex((prev) => Math.max(0, Math.min(cards.length - 1, prev + dir)));
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="container">
      <div className="nav">
        <button disabled={currentIndex === 0} onClick={() => changeCard(-1)}>⬅</button>
        <span>{currentIndex + 1} / {cards.length}</span>
        <button disabled={currentIndex === cards.length - 1} onClick={() => changeCard(1)}>➡</button>
      </div>

      <div className={`card-wrapper ${isFlipped ? "is-flipped" : ""}`}>
        {/* Front */}
        <div className="card-face front">
          <textarea 
            value={currentCard?.front || ""} 
            onChange={(e) => handleUpdate("front", e.target.value)} 
            placeholder="Front side..."
          />
        </div>
        {/* Back */}
        <div className="card-face back">
          <textarea 
            value={currentCard?.back || ""} 
            onChange={(e) => handleUpdate("back", e.target.value)} 
            placeholder="Back side..."
          />
        </div>
      </div>

      <div className="controls">
        <button onClick={() => setIsFlipped(!isFlipped)}>🔄 Flip</button>
        <button onClick={() => {
          setCards([...cards, { front: "", back: "" }]);
          setCurrentIndex(cards.length);
          setIsFlipped(false);
        }}>➕ New</button>
        <button onClick={handleSave} className="save-btn">💾 Save</button>
      </div>
    </div>
  );
}
