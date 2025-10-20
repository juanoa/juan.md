import { useState } from "preact/hooks";

const TechPillars = ({ activePillar }) => {
  const [hoveredPillar, setHoveredPillar] = useState(null);

  const pillars = {
    product: {
      label: "Product",
      color: "#FFE4B5", // Light orange
      highlightColor: "#FFA500", // Orange for hover and active
    },
    engineering: {
      label: "Engineering",
      color: "#B3D9FF", // Light blue
      highlightColor: "#80BFFF", // Blue for hover and active
    },
    design: {
      label: "Design",
      color: "#D4F1D4", // Light green
      highlightColor: "#B4DFB4", // Green for hover and active
    },
  };

  const getPillarColor = (pillarKey) => {
    if (pillarKey === activePillar || hoveredPillar === pillarKey) {
      return pillars[pillarKey].highlightColor;
    }
    return pillars[pillarKey].color;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Top horizontal bar - more like the image */}
      <div
        style={{
          width: "100%",
          height: "50px",
          backgroundColor: "white",
          border: "2px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            color: "#555",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Product Frontend Engineer
        </span>
      </div>

      {/* Three pillars - more cylindrical like the image */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: "15px",
          alignItems: "flex-end",
        }}
      >
        {Object.entries(pillars).map(([key, pillar]) => (
          <div
            key={key}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginTop: "20px",
            }}
            onMouseEnter={() => setHoveredPillar(key)}
            onMouseLeave={() => setHoveredPillar(null)}
          >
            {/* Pillar - more cylindrical */}
            <div
              style={{
                width: "60px",
                height: "120px", // All pillars same height
                backgroundColor: getPillarColor(key),
                border: "1px solid black",
                transition: "all 0.3s ease",
                position: "relative",
                transform: (() => {
                  let scale = 1;
                  // If there's an active pillar and this is not it, make it smaller
                  if (activePillar && key !== activePillar) {
                    scale = 0.8;
                  }
                  // Apply hover effect on top of active state
                  if (hoveredPillar === key) {
                    scale *= 1.05;
                  }
                  return `scale(${scale})`;
                })(),
              }}
            />

            {/* Pillar label - integrated into pillar like the image */}
            <div
              style={{
                marginTop: "8px",
                padding: "4px 8px",
                backgroundColor: "transparent",
                fontSize: "12px",
                fontWeight: "500",
                color: "#555",
                textAlign: "center",
                minWidth: "60px",
              }}
            >
              {pillar.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechPillars;
