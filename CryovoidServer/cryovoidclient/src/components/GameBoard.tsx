import React from "react";

export type Tile = {
  x: number;
  y: number;
  terrain: string;
  building?: string;
};

type Props = { map: Tile[][] };

const GameBoard: React.FC<Props> = ({ map }) => {
  return (
    <div className="game-board">
      {map.flat().map((tile, i) => (
        <div key={i} className="tile">
          {tile.building ?? tile.terrain[0]}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
