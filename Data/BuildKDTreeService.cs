
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.Net.Mail;
using System.Text.Json;
using System.Threading;

namespace EFImageServer.Data
{
    public class BuildKDTreeService : BackgroundService
    {
        private readonly DataContext _context;
        private readonly ILogger<BuildKDTreeService> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly CancellationTokenSource _cancellationTokenSource;

        public BuildKDTreeService(IServiceScopeFactory factory, ILogger<BuildKDTreeService> logger)
        {
            _context = factory.CreateScope().ServiceProvider.GetRequiredService<DataContext>();
            _serviceScopeFactory = factory;
            _logger = logger;
            _cancellationTokenSource = new CancellationTokenSource();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (Constants.BUILD_KDTREE == false) return;
            if (Constants.BUILD_KDTREE_ONSTARTUP)
            {
                _logger.LogInformation("Building KD-Tree...");

                await BuildKDTreeAsync();

                _logger.LogInformation("KD-Tree build completed.");
            }
            while (!stoppingToken.IsCancellationRequested)
            {
                var nextRunTime = GetNextRunTime(Constants.BUILD_KDTREE_SCHEDULE_HOUR, 0);
                var delay = nextRunTime - DateTime.Now;

                _logger.LogInformation($"Next KD-Tree build scheduled for {nextRunTime} (in {delay.TotalMilliseconds} ms)");

                await Task.Delay(delay, stoppingToken);

                _logger.LogInformation("Building KD-Tree...");

                await BuildKDTreeAsync();

                _logger.LogInformation("KD-Tree build completed.");
            }
        }

        private DateTime GetNextRunTime(int hour, int minute)
        {
            var now = DateTime.Now;
            var nextRun = new DateTime(now.Year, now.Month, now.Day, hour, minute, 0);

            if (nextRun <= now)
            {
                nextRun = nextRun.AddDays(1);
            }

            return nextRun;
        }

        private async Task BuildKDTreeAsync()
        {
            try
            {
                var jsonFilePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.FEATURES_FILE);
                var batchSize = 300;

                // If the file doesn't exist, create it from scratch
                if (Constants.BUILD_FEATURES_FILE) await GenerateFullFeaturesJson(jsonFilePath, batchSize);

                // Prepare process for calling Python script
                var psi = new ProcessStartInfo
                {
                    FileName = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_VENV)),
                    Arguments = string.Format("\"{0}\" \"{1}\"",
                                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_KD_TREE_SCRIPT_FILE_PATH),
                                jsonFilePath), // Pass JSON file path as an argument
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = new Process { StartInfo = psi })
                {
                    process.Start();
                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        throw new Exception("Errors: " + error);
                    }
                    Console.WriteLine(output);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private async Task GenerateFullFeaturesJson(string jsonFilePath, int batchSize)
        {
            var totalRecords = await _context.Photos.CountAsync();

            using (var fs = new FileStream(jsonFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
            using (var sw = new StreamWriter(fs))
            {
                bool firstItem = true;

                await sw.WriteAsync("["); // Start JSON array

                for (int i = 0; i < totalRecords; i += batchSize)
                {
                    var batch = await _context.Features
                        .OrderBy(f => f.PhotoID)
                        .Skip(i)
                        .Take(batchSize)
                        .ToListAsync();

                    var batchData = batch.Select(f => new
                    {
                        PhotoID = f.PhotoID,
                        ColorHistogram = ConvertToDoubleArray(f.ColorHistogram),
                        TextureFeatures = ConvertToDoubleArray(f.TextureFeatures),
                        ShapeDescriptors = ConvertToDoubleArray(f.ShapeDescriptors)
                    });

                    string jsonBatch = JsonSerializer.Serialize(batchData);

                    // Remove extra array brackets from batch JSON to prevent double nesting
                    jsonBatch = jsonBatch.TrimStart('[').TrimEnd(']');

                    if (!firstItem)
                    {
                        await sw.WriteAsync(","); // Add separator between objects
                    }
                    await sw.WriteAsync(jsonBatch);
                    firstItem = false;
                }

                await sw.WriteLineAsync("]"); // Close JSON array
            }
        }

        private async Task UpdateFeaturesJson(string jsonFilePath, List<int> newPhotoIds, int batchSize)
        {
            // Read existing JSON
            var existingData = new List<dynamic>();

            if (File.Exists(jsonFilePath))
            {
                string existingJson = await File.ReadAllTextAsync(jsonFilePath);
                existingData = JsonSerializer.Deserialize<List<dynamic>>(existingJson) ?? new List<dynamic>();
            }

            // Extract all PhotoIDs from the JSON file
            var jsonPhotoIds = existingData.Select(f => (int)f.PhotoID).ToHashSet();

            // Get all valid PhotoIDs from the database (Photos that still exist)
            var validPhotoIds = await _context.Photos.Select(p => p.PhotoID).ToHashSetAsync();

            // Find deleted photos (Exist in JSON but not in DB)
            var deletedPhotoIds = jsonPhotoIds.Except(validPhotoIds).ToList();

            // Remove deleted photos from JSON data
            if (deletedPhotoIds.Any())
            {
                existingData.RemoveAll(f => deletedPhotoIds.Contains((int)f.PhotoID));
            }

            // Fetch new or updated features
            var newFeatures = await _context.Features
                .Where(f => newPhotoIds.Contains(f.PhotoID))
                .ToListAsync();

            var newFeatureData = newFeatures.Select(f => new
            {
                PhotoID = f.PhotoID,
                ColorHistogram = ConvertToDoubleArray(f.ColorHistogram),
                TextureFeatures = ConvertToDoubleArray(f.TextureFeatures),
                ShapeDescriptors = ConvertToDoubleArray(f.ShapeDescriptors)
            }).ToList();

            // Remove old versions of updated photos and add the new ones
            existingData.RemoveAll(f => newPhotoIds.Contains((int)f.PhotoID));
            existingData.AddRange(newFeatureData);

            // Write updated JSON back to file
            await File.WriteAllTextAsync(jsonFilePath, JsonSerializer.Serialize(existingData, new JsonSerializerOptions { WriteIndented = false }));
        }

        /*
        private async Task BuildKDTreeAsync()
        {
            try
            {
                var batchSize = 300;
                var totalRecords = await _context.Features.CountAsync();

                // Prepare the process for calling Python script
                var psi = new ProcessStartInfo
                {
                    FileName = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_VENV)),
                    Arguments = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_KD_TREE_SCRIPT_FILE_PATH)),
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = new Process { StartInfo = psi })
                {
                    process.Start();
                    using (var sw = process.StandardInput)
                    {
                        if (sw.BaseStream.CanWrite)
                        {
                            await sw.WriteLineAsync("[");
                            bool firstBatch = true;

                            for (int i = 0; i < totalRecords; i += batchSize)
                            {
                                var batch = await _context.Features
                                    .OrderBy(f => f.PhotoID)
                                    .Skip(i)
                                    .Take(batchSize)
                                    .ToListAsync();

                                var batchData = batch.Select(f => new
                                {
                                    PhotoID = f.PhotoID,
                                    ColorHistogram = ConvertToDoubleArray(f.ColorHistogram),
                                    TextureFeatures = ConvertToDoubleArray(f.TextureFeatures),
                                    ShapeDescriptors = ConvertToDoubleArray(f.ShapeDescriptors)
                                });

                                string jsonBatch = JsonSerializer.Serialize(batchData);

                                if (!firstBatch)
                                {
                                    await sw.WriteAsync(",");
                                }
                                await sw.WriteAsync(jsonBatch);
                                firstBatch = false;
                            }

                            await sw.WriteLineAsync("]");
                        }
                    }

                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        throw new Exception("Errors: " + error);
                    }
                    Console.WriteLine(output);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        */
        private static double[] ConvertToDoubleArray(byte[] byteArray)
        {
            // Ensure the length of the byte array is a multiple of the size of double (8 bytes)
            int doubleCount = byteArray.Length / sizeof(double);
            double[] doubleArray = new double[doubleCount];

            Buffer.BlockCopy(byteArray, 0, doubleArray, 0, byteArray.Length);

            return doubleArray;
        }

        public void StopService()
        {
            _cancellationTokenSource.Cancel();
        }
    }
}
