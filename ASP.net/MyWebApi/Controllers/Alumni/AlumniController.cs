using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Controllers.Alumni;

[ApiController]
[Route("[controller]")]
public class AlumniController : ControllerBase
{
    private readonly Connection _dbContext;

    public AlumniController(Connection dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var alumni = _dbContext.alumni.Where(a => a.PRN == 775353463);
            Console.WriteLine(alumni);
            return Ok(alumni);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

}
