using EFImageServer.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace EFImageServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            #region Custom
            builder.Configuration.AddJsonFile("Config.json", optional: false, reloadOnChange: true);
            // Add DB (Method 1)
            builder.Services.AddDbContext<DataContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("Default"))
            );
            builder.Services.AddAuthentication("NoAuthScheme").AddScheme<AuthenticationSchemeOptions, NoAuthHandler>("NoAuthScheme", options => { });
            builder.Services.AddHostedService<BuildKDTreeService>();

            // Configure FormOptions and Kestrel server for large file uploads
            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 10L * 1024L * 1024L * 1024L;
            });

            builder.Services.Configure<KestrelServerOptions>(options =>
            {
                options.Limits.MaxRequestBodySize = 10L * 1024L * 1024L * 1024L;
            });
            #endregion

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            #region Custom
            app.UseAuthentication();
            app.UseAuthorization();
            #endregion

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
