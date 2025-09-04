namespace CryovoidServer.Models
{
    public class Colonist
    {
        public string Name { get; set; }
        public int Hunger { get; set; } = 100;
        public List<string> Traits { get; set; } = new();
        public string Backstory { get; set; } = "";
    }
}
