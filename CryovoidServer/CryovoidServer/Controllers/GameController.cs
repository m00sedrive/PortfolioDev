using CryovoidServer.Models;
using CryovoidServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryovoidServer.Controllers
{
    [ApiController]
    [Route("api/game")]
    public class GameController : ControllerBase
    {
        private readonly GameService _gameService;

        public GameController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("create")]
        public ActionResult<GameWorld> CreateGame()
        {
            try
            {
                var world = _gameService.CreateGame();
                return Ok(world);
            }
            catch (Exception ex)
            {
                // Log to console
                Console.WriteLine(ex);
                // Return details to client (dev only)
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }


        // GET api/game/{id} - only GUIDs
        [HttpGet("{id:guid}")]
        public ActionResult<GameWorld> GetGame(Guid id)
        {
            var world = _gameService.GetWorld(id);
            if (world == null)
                return NotFound($"Game world with id {id} not found.");

            return Ok(world);
        }
    }
}
