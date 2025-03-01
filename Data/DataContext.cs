using EFImageServer.Models;
using Microsoft.EntityFrameworkCore;

namespace EFImageServer.Data
{
    public class DataContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public DataContext(DbContextOptions<DataContext> options, IConfiguration configuration)
            : base(options)
        {
            // Add DB (Method 2)
            // Can remove configuration param
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder builder)
        {
            // Add DB (Method 2)
            if (builder.IsConfigured == false)
                builder.UseSqlServer(_configuration.GetConnectionString("Default"));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Users>().HasKey(users => new { users.UserID });
            modelBuilder.Entity<Tags>().HasKey(tags => new { tags.TagID });
            modelBuilder.Entity<Photos>().HasKey(photos => new { photos.PhotoID });
            modelBuilder.Entity<Features>().HasKey(features => new { features.FeatureID });
            modelBuilder.Entity<PhotoTags>().HasKey(photoTags => new { photoTags.TagID, photoTags.PhotoID });
            modelBuilder.Entity<Metadata>().HasKey(metadata => new { metadata.MetadataID });
        }

        public DbSet<Users> Users { get; set; }
        public DbSet<Tags> Tags { get; set; }
        public DbSet<Photos> Photos { get; set; }
        public DbSet<Features> Features { get; set; }
        public DbSet<PhotoTags> PhotoTags { get; set; }
        public DbSet<Metadata> Metadata { get; set; }
    }
}
