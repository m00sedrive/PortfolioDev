using CryovoidServer.Models;
using System.Collections.Concurrent;

namespace CryovoidServer
{
    public class GameService
    {
        private readonly ConcurrentDictionary<Guid, GameWorld> _worlds = new();

        public GameWorld CreateGame(int width = 20, int height = 20)
        {
            var world = new GameWorld
            {
                Map = new List<Tile>(),
                Colonists = new List<Colonist>(),
                Events = new List<GameEvent>()
            };

            // Initialize map tiles
            for (int x = 0; x < width; x++)
                for (int y = 0; y < height; y++)
                    world.Map.Add(new Tile { X = x, Y = y, Terrain = "Grass" });

            // Add a default colonist
            world.Colonists.Add(new Colonist
            {
                Name = "Alex",
                Hunger = 100,
                Traits = new List<string> { "Brave", "Curious" },
                Backstory = "A newcomer to the colony."
            });

            _worlds[world.Id] = world;
            return world;
        }

        public GameWorld? GetWorld(Guid id) =>
            _worlds.TryGetValue(id, out var world) ? world : null;

        public void UpdateWorlds()
        {
            foreach (var world in _worlds.Values)
            {
                world.Tick++;
                foreach (var c in world.Colonists)
                    c.Hunger = Math.Max(0, c.Hunger - 1);
            }
        }
    }
}
