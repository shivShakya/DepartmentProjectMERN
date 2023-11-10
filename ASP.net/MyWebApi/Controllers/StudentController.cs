using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Controllers;

[ApiController]
[Route("[controller]")]

public class StudentController : ControllerBase
{
    private readonly Connection _dbContext;

    public StudentController(Connection dbContext)
    {
        _dbContext = dbContext;
    }


    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var students = _dbContext.students.FromSqlRaw("select * from students").ToList();
            Console.WriteLine(students);
            return Ok(students);
        }catch(Exception ex)
        {
            return StatusCode(500, $"Internal server error : {ex.Message}");
        }
    }

}

