import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // --- State Management ---
  // cards: Array of objects [{ id, front, back, flipped }]
  const [cards, setCards] = useState([]);
  // currentIndex: Tracks which card in the array we are currently viewing
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Initial Data Fetch ---
  // Runs once when the component mounts
  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/getCards");
        if (!res.ok) throw new Error("Failed to fetch cards");
        const data = await res.json();
        
        // If the DB is empty, provide a blank template card so the UI doesn't crash
        setCards(data.length > 0 ? data : [{ front: "", back: "", flipped: false }]);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load cards:", err);
        // Fallback to a blank card on error
        setCards([{ front: "", back: "", flipped: false }]);
        setCurrentIndex(0);
      }
    }
    loadCards();
  }, []);

  // --- UI Logic Helpers --- 

  // Updates the text of the current card as the user types
  const updateCard = (side, value) => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards]; // Create a shallow copy to maintain immutability
    newCards[currentIndex][side] = value; // side is 'front' or 'back'
    setCards(newCards);
  };

  // Toggles the local 'flipped' boolean to trigger CSS animations
  const flipCard = () => {
    if (!cards[currentIndex]) return;
    const newCards = [...cards];
    newCards[currentIndex].flipped = !newCards[currentIndex].flipped;
    setCards(newCards);
  };

  // Adds a blank card object to the local state and jumps to it
  const newCard = () => {
    const newCards = [...cards, { front: "", back: "", flipped: false }];
    setCards(newCards);
    setCurrentIndex(newCards.length - 1);
  };

  // --- API / Database Interactions ---
  
  // Handles both Create (POST) and Update (POST) operations
  const saveCard = async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      let savedCard;

      // If card has an ID, it exists in the DB; otherwise, it's a brand new card
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

      // Sync local state with the returned data from the DB (crucial for getting the new ID)
      const newCards = [...cards];
      newCards[currentIndex] = { ...savedCard, flipped: card.flipped };
      setCards(newCards);
    } catch (err) {
      console.error("Failed to save card:", err);
    }
  };

  // --- Navigation ---
  // random card
  const randomCard = () => {
    // random index
    let ranIndex = Math.floor(Math.random() * cards.length - 1);
    const newCards = [...cards];
    // Reset the random card to the front side before showing it
    newCards[ranIndex + 1].flipped = false;
    setCards(newCards);
    setCurrentIndex(ranIndex + 1);
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      const newCards = [...cards];
      // Reset the next card to the front side before showing it
      newCards[currentIndex + 1].flipped = false;
      setCards(newCards);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      const newCards = [...cards];
      // Reset the previous card to the front side before showing it
      newCards[currentIndex - 1].flipped = false;
      setCards(newCards);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Loading guard to prevent errors if the state is still empty
  if (!cards[currentIndex]) return <div>Loading...</div>;

  const card = cards[currentIndex];

  return (
    <div className="container">
      <h1>Flashcards</h1>

      {/* Navigation Header */}
      <div className="nav">
        <button onClick={prevCard}>⬅</button>
        <span>
          Card {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={nextCard}>➡</button>
      </div>

      {/* Flashcard Visuals */}
      <div className="card-wrapper">
        {/* The 'flipped' class usually triggers a 180deg Y-axis rotation in CSS */}
        <div className={`card ${card.flipped ? "flipped" : ""}`}>
          
          {/* Front Face */}
          <div className="card-face front">
            <textarea
              placeholder="Front..."
              value={card.front}
              onChange={(e) => updateCard("front", e.target.value)}
            />
          </div>

          {/* Back Face */}
          <div className="card-face back">
            <textarea
              placeholder="Back..."
              value={card.back}
              onChange={(e) => updateCard("back", e.target.value)}
            />
          </div>
          
        </div>
      </div>

      {/* Action Buttons */}
      <div className="controls">
        <button onClick={flipCard}>🔄 Flip</button>
        <button onClick={newCard}>➕ New Card</button>
        <button onClick={saveCard}>💾 Save Card</button>
        <button onClick={randomCard}>👽 random Card</button>
      </div>
    </div>
  );
}

export default App;