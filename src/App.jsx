import { useState } from "react";
import "./App.css";

function App() {
  const [cards, setCards] = useState([
    { front: "", back: "", flipped: false },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const updateCard = (side, value) => {
    const newCards = [...cards];
    newCards[currentIndex][side] = value;
    setCards(newCards);
  };

  const flipCard = () => {
    const newCards = [...cards];
    newCards[currentIndex].flipped =
      !newCards[currentIndex].flipped;
    setCards(newCards);
  };

  const addCard = () => {
    const newCards = [
      ...cards,
      { front: "", back: "", flipped: false },
    ];
    setCards(newCards);
    setCurrentIndex(newCards.length - 1); // jump to new card
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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
              onChange={(e) =>
                updateCard("front", e.target.value)
              }
            />
          </div>

          <div className="card-face back">
            <textarea
              placeholder="Back..."
              value={card.back}
              onChange={(e) =>
                updateCard("back", e.target.value)
              }
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