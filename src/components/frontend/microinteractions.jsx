import { useState } from 'preact/hooks';
import './microinteractions.css';

export default function Microinteractions() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [clickedCard, setClickedCard] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [toggleActive, setToggleActive] = useState(false);

  return (
    <div className="microinteractions-container">
      <h3>Ejemplos de microinteracciones</h3>
      <p className="microinteractions-description">
        Interactúa con los elementos de abajo para experimentar diferentes tipos de microinteracciones:
      </p>

      <div className="microinteractions-grid">
        {/* 1. Botón con hover y click */}
        <div className="microinteraction-item">
          <h4>Botón con hover</h4>
          <button
            className={`micro-button ${hoveredButton ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
            onClick={() => {
              setClickedCard(!clickedCard);
              setTimeout(() => setClickedCard(false), 200);
            }}
          >
            <span className="button-text">Hover me</span>
            <span className="button-icon">→</span>
          </button>
        </div>

        {/* 2. Card con hover y click */}
        <div className="microinteraction-item">
          <h4>Card interactiva</h4>
          <div
            className={`micro-card ${clickedCard ? 'clicked' : ''}`}
            onClick={() => {
              setClickedCard(!clickedCard);
              setTimeout(() => setClickedCard(false), 100);
            }}
          >
            <div className="card-header">
              <div className="card-avatar"></div>
              <div className="card-info">
                <div className="card-title">Usuario</div>
                <div className="card-subtitle">Haz click</div>
              </div>
            </div>
            <div className="card-content">
              <p>Esta card reacciona al hover y click con animaciones sutiles.</p>
            </div>
          </div>
        </div>

        {/* 3. Input con focus */}
        <div className="microinteraction-item">
          <h4>Input con focus</h4>
          <div className="input-container">
            <input
              type="text"
              className={`micro-input ${inputFocused ? 'focused' : ''}`}
              placeholder=""
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <div className="input-label">Email</div>
          </div>
        </div>

        {/* 4. Toggle switch */}
        <div className="microinteraction-item">
          <h4>Toggle switch</h4>
          <div
            className={`micro-toggle ${toggleActive ? 'active' : ''}`}
            onClick={() => setToggleActive(!toggleActive)}
          >
            <div className="toggle-slider">
              <div className="toggle-handle"></div>
            </div>
            <span className="toggle-label">
              {toggleActive ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
