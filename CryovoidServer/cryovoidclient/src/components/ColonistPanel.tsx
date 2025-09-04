import React from "react";

type Colonist = {
  name: string;
  hunger: number;
  traits: string[];
  backstory: string;
};

type Props = { colonists: Colonist[] };

const ColonistPanel: React.FC<Props> = ({ colonists }) => {
  return (
    <div className="colonist-panel">
      <h2>Colonists</h2>
      {colonists.map((c, i) => (
        <div key={i} style={{ marginBottom: "8px" }}>
          <div><strong>{c.name}</strong></div>
          <div>Hunger: {c.hunger}</div>
          <div>Traits: {c.traits.join(", ")}</div>
          <div style={{ fontSize: "12px", color: "#555" }}>{c.backstory}</div>
        </div>
      ))}
    </div>
  );
};

export default ColonistPanel;
