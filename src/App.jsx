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
        setCards([{ front: "", back: "", flipped: false }]); // fallback
        setCurrentIndex(0);
      }
    }
    loadCards();
  }, []);

  const updateCard = async (side, value) => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards];
    newCards[currentIndex][side] = value;
    setCards(newCards);

    // Update DB
    try {
      await fetch("/api/updateCard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCards[currentIndex].id,
          side,
          value,
        }),
      });
    } catch (err) {
      console.error("Failed to update card:", err);
    }
  };

  const flipCard = () => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards];
    newCards[currentIndex].flipped = !newCards[currentIndex].flipped;
    setCards(newCards);
  };

  // async function deleteCurrentCard() {
  //   const cardId = cards[currentIndex].id;

  //   await fetch("/api/deleteCard", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ id: cardId }),
  //   });

  //   // Remove from state
  //   const newCards = [...cards];
  //   newCards.splice(currentIndex, 1);
  //   setCards(newCards);

  //   // Adjust index
  //   if (currentIndex >= newCards.length) {
  //     setCurrentIndex(newCards.length - 1);
  //   }
  // }

  const addCard = async () => {
    try {
      const res = await fetch("/api/addCard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: "", back: "" }),
      });
      const newCard = await res.json();
      setCards([...cards, newCard]);
      setCurrentIndex(cards.length); // go to new card
    } catch (err) {
      console.error("Failed to add card:", err);
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
        <button onClick={addCard}>➕ Add Card</button>
      </div>
    </div>
  );
}

export default App;