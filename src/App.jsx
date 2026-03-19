import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load cards from API
  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/getCards");
        if (!res.ok) throw new Error("Failed to fetch cards");
        const data = await res.json();
        setCards(data.length > 0 ? data : [{ front: "", back: "", flipped: false }]);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load cards:", err);
        setCards([{ front: "", back: "", flipped: false }]);
        setCurrentIndex(0);
      }
    }
    loadCards();
  }, []);

  const updateCard = (side, value) => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards];
    newCards[currentIndex][side] = value;
    setCards(newCards);
  };

  const flipCard = () => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards];
    newCards[currentIndex].flipped = !newCards[currentIndex].flipped;
    setCards(newCards);
  };

  // --- New card locally ---
  const newCard = () => {
    const newCards = [...cards, { front: "", back: "", flipped: false }];
    setCards(newCards);
    setCurrentIndex(newCards.length - 1);
  };

  // --- Save current card to DB (add or update) ---
  const saveCard = async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      let savedCard;

      if (card.id) {
        // Existing card → update
        const res = await fetch("/api/updateCard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: card.id,
            front: card.front,
            back: card.back,
          }),
        });
        savedCard = await res.json();
      } else {
        // New card → add
        const res = await fetch("/api/addCard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: card.front,
            back: card.back,
          }),
        });
        savedCard = await res.json();
      }

      // Update state with DB card
      const newCards = [...cards];
      newCards[currentIndex] = { ...savedCard, flipped: card.flipped };
      setCards(newCards);
    } catch (err) {
      console.error("Failed to save card:", err);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevCard = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (!cards[currentIndex]) return <div>Loading...</div>;

  const card = cards[currentIndex];

  return (
    <div className="container">
      <h1>Flashcards</h1>

      <div className="nav">
        <button onClick={prevCard}>⬅</button>
        <span>
          Card {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={nextCard}>➡</button>
      </div>

      <div className="card-wrapper">
        <div className={`card ${card.flipped ? "flipped" : ""}`}>
          <div className="card-face front">
            <textarea
              placeholder="Front..."
              value={card.front}
              onChange={(e) => updateCard("front", e.target.value)}
            />
          </div>

          <div className="card-face back">
            <textarea
              placeholder="Back..."
              value={card.back}
              onChange={(e) => updateCard("back", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={flipCard}>🔄 Flip</button>
        <button onClick={newCard}>➕ New Card</button>
        <button onClick={saveCard}>💾 Save Card</button>
      </div>
    </div>
  );
}

export default App;