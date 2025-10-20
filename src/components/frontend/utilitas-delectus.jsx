import { useState, useEffect } from 'preact/hooks';
import './utilitas-delectus.css';

export default function UtilitasDelectus() {
  const [position, setPosition] = useState(50); // Porcentaje de posición (0-100)

  useEffect(() => {
    const interval = setInterval(() => {
      // Generar posición aleatoria entre 33% y 66%
      let newPosition;
      let attempts = 0;
      const minDistance = 15; // Distancia mínima del 8% para que se note el movimiento

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
          La solución correcta casi siempre suele estar en un lugar intermedio entre el utilitas y el delectus.
        </p>
      </div>
    </div>
  );
}
