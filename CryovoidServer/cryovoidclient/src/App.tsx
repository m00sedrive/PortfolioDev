import React, { useEffect, useState } from "react";
import { newGame, getGame } from "./api/gameApi";
import GameBoard, { Tile } from "./components/GameBoard";
import ColonistPanel from "./components/ColonistPanel";
import EventLog from "./components/EventLog";
import "./App.css";

type Colonist = { name: string; hunger: number; traits: string[]; backstory: string };
type GameEvent = { tick: number; description: string };
type GameWorld = { id: string; tick: number; map: Tile[][]; colonists: Colonist[]; events: GameEvent[] };

function App() {
  const [world, setWorld] = useState<GameWorld | null>(null);

  useEffect(() => {
    async function init() {
      const game = await newGame();
      setWorld(game);

      // Poll backend every 1 sec
      setInterval(async () => {
        const updated = await getGame(game.id);
        setWorld(updated);
      }, 1000);
    }

    init();
  }, []);

  if (!world) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <GameBoard map={world.map} />
      <div className="side-panel">
        <ColonistPanel colonists={world.colonists} />
        <EventLog events={world.events} />
      </div>
    </div>
  );
}

export default App;
