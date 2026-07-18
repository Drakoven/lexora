import "./RatingChart.css";

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = 8;

function RatingChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <p className="rating-chart-empty">
        Pas encore assez de parties classées pour afficher une courbe.
      </p>
    );
  }

  const ratings = history.map((point) => point.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const range = max - min || 1;

  const points = history.map((point, index) => {
    const x = (index / (history.length - 1)) * (WIDTH - PADDING * 2) + PADDING;
    const y = HEIGHT - PADDING - ((point.rating - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${PADDING},${HEIGHT - PADDING} ${linePoints} ${WIDTH - PADDING},${HEIGHT - PADDING}`;

  return (
    <div className="rating-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="rating-chart-svg" preserveAspectRatio="none">
        <polygon points={areaPoints} className="rating-chart-area" />
        <polyline points={linePoints} className="rating-chart-line" />
      </svg>
      <div className="rating-chart-range">
        Entre {min} et {max} pts sur les {history.length} dernières parties classées
      </div>
    </div>
  );
}

export default RatingChart;
