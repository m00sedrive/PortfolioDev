namespace CryovoidServer.Services
{
    public class SimulationService : BackgroundService
    {
        private readonly GameService _gameService;
        private readonly ILogger<SimulationService> _logger;

        public SimulationService(GameService gameService, ILogger<SimulationService> logger)
        {
            _gameService = gameService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _gameService.UpdateWorlds(); // progress ticks
                await Task.Delay(1000, stoppingToken); // 1 sec per tick
            }
        }
    }

}
