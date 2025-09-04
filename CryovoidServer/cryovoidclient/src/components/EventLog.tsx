import React from "react";

type GameEvent = {
  tick: number;
  description: string;
};

type Props = { events: GameEvent[] };

const EventLog: React.FC<Props> = ({ events }) => {
  return (
    <div className="event-log">
      <h2>Event Log</h2>
      {events.map((e, i) => (
        <div key={i}>
          <span style={{ color: "#888" }}>[{e.tick}] </span>
          {e.description}
        </div>
      ))}
    </div>
  );
};

export default EventLog;
