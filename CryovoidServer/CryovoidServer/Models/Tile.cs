namespace CryovoidServer.Models
{
    public class Tile
    {
        public int X { get; set; }
        public int Y { get; set; }
        public string Terrain { get; set; } = "Grass";
        public string? Building { get; set; }
    }
}
