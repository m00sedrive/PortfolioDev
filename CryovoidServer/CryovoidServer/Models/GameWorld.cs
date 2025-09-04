using CryovoidServer.Models;
using System;

namespace CryovoidServer
{
    public class GameWorld
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int Tick { get; set; }
        public List<Colonist> Colonists { get; set; } = new();
        public List<Tile> Map { get; set; } = new();
        public List<GameEvent> Events { get; set; } = new();
    }

}
