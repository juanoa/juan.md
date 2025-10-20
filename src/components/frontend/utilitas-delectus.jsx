import { useState, useEffect } from 'preact/hooks';
import './utilitas-delectus.css';

export default function UtilitasDelectus() {
  const [position, setPosition] = useState(50); // Position percentage (0-100)

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random position between 30% and 70%
      let newPosition;
      let attempts = 0;
      const minDistance = 15; // Minimum distance so movement is noticeable

      do {
        newPosition = 30 + Math.random() * (70 - 30);
        attempts++;
      } while (Math.abs(newPosition - position) < minDistance && attempts < 10);

      setPosition(newPosition);
    }, 2000);

    return () => clearInterval(interval);
  }, [position]);

  const handleLineClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="utilitas-delectus-container">
      <div className="utilitas-delectus-labels">
        <span className="label-left">Utilitas</span>
        <span className="label-right">Delectus</span>
      </div>

      <div
        className="utilitas-delectus-line"
        onClick={handleLineClick}
      >
        <div
          className="utilitas-delectus-indicator"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="utilitas-delectus-description">
        <p>
          The right solution is almost always somewhere between utilitas and delectus.
        </p>
      </div>
    </div>
  );
}
