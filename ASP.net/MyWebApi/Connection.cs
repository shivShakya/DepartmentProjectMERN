using System;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Controllers.Alumni;
using MyWebApi.Model;

namespace MyWebApi
{
    public class Connection : DbContext
    {
        public Connection(DbContextOptions<Connection> options) : base(options) { }
        public DbSet<Student> students { get; set; }


        public DbSet<Alumni> alumni {get; set; }
    
    }
}

