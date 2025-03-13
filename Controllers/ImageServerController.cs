using EFImageServer.Data;
using EFImageServer.DTO_Models;
using EFImageServer.Models;
using EFImageServer.Request_Models;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace EFImageServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageServerController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;

        public ImageServerController(DataContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        #region Users
        // GET: api/Users
        [HttpGet("Users")]
        public async Task<ActionResult<IEnumerable<UsersDTO>>> GetUsers()
        {
            return await _context.Users
                .Where(u => !u.IsDelete)
                .Select(u => new UsersDTO(u))
                .ToListAsync();
        }
        
        // POST: api/User
        [HttpPost("User")]
        public async Task<ActionResult<UsersDTO>> PostUser(Users user)
        {
            // Check if the email already exists
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest("Email already in use.");
            }

            // Hash the password using SHA256
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(user.Password));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                user.Password = builder.ToString();
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var usersDTO = new UsersDTO(user);

            return CreatedAtAction("GetUser", new { id = user.UserID }, usersDTO);
        }

        // GET: api/User
        [HttpPost("User/login")]
        public async Task<ActionResult<UsersDTO>> GetUser([FromBody] UserRequest user)
        {
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
                return BadRequest();

            // Hash the password using SHA256
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(user.Password));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                string hashedPassword = builder.ToString();

                // Validate the user
                var loginUser = await _context.Users
                    .Where(u => u.Email == user.Email && u.Password == hashedPassword && !u.IsDelete)
                    .Select(u => new UsersDTO(u))
                    .FirstOrDefaultAsync();

                return loginUser == null
                    ? BadRequest()
                    : loginUser;
            }
        }

        // PUT: api/User/update-password
        [HttpPut("User/UpdateUsername")]
        public async Task<IActionResult> PutUsername(int userID, string username)
        {
            var user = await _context.Users.FindAsync(userID);

            if (user == null || user.IsDelete)
            {
                return BadRequest();
            }

            user.Username = username;

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(userID))
                {
                    return BadRequest();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // PUT: api/User/update-password
        [HttpPut("User/UpdatePassword")]
        public async Task<IActionResult> PutPassword(int userID, [FromBody] string password)
        {
            var updateUser = await _context.Users.FindAsync(userID);

            if (updateUser == null || updateUser.IsDelete)
            {
                return BadRequest();
            }

            // Hash the new password using SHA256
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                updateUser.Password = builder.ToString();
            }

            _context.Entry(updateUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(userID))
                {
                    return BadRequest();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // DELETE: api/User
        [HttpDelete("User")]
        public async Task<IActionResult> DeleteUser(int userID)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.IsDelete)
            {
                return BadRequest();
            }

            if (user.Role == "Admin")
            {
                return BadRequest("Admin users cannot be deleted.");
            }

            user.IsDelete = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserID == id && !e.IsDelete);
        }
        #endregion
        
        #region Tags
        // GET: api/Tags
        [HttpGet("Tags")]
        public async Task<ActionResult<IEnumerable<Tags>>> GetTags()
        {
            return await _context.Tags.ToListAsync();
        }
        
        // GET: api/Tag
        [HttpGet("Tag")]
        public async Task<ActionResult<Tags>> GetTag(int id)
        {
            var tag = await _context.Tags.FindAsync(id);

            return tag == null
                ? BadRequest()
                : tag;
        }

        // POST: api/Tag
        [HttpPost("Tag")]
        public async Task<ActionResult<Tags>> PostTag(int userID, string tagName)
        {
            var user = await _context.Users.FindAsync(userID);

            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            if (await _context.Tags.AnyAsync(tag => tag.TagName == tagName))
            {
                return BadRequest();
            }

            var tag = new Tags() { TagName = tagName };
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();

            return Ok(tag);
        }

        // PUT: api/Tag
        [HttpPut("Tag")]
        public async Task<IActionResult> PutTag(int userID, Tags tag)
        {
            var user = await _context.Users.FindAsync(userID);

            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            if (!await _context.Tags.AnyAsync(checkTag => checkTag.TagID == tag.TagID))
            {
                return BadRequest();
            }

            _context.Entry(tag).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TagExists(tag.TagID))
                {
                    return BadRequest();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // DELETE: api/Tag
        [HttpDelete("Tag")]
        public async Task<IActionResult> DeleteTag(int userID, int tagID)
        {
            var user = await _context.Users.FindAsync(userID);

            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            var tag = await _context.Tags.FindAsync(tagID);
            if (tag == null)
            {
                return BadRequest();
            }

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool TagExists(int id)
        {
            return _context.Tags.Any(e => e.TagID == id);
        }
        #endregion

        #region Photos
        // GET: api/Photos
        [HttpGet("Photos")]
        public async Task<ActionResult<IEnumerable<PhotosDTO>>> GetPhotos([FromQuery] GetImageRequest image)
        {
            var tagsQuery = from pt in _context.PhotoTags
                            group pt by pt.PhotoID into g
                            select new
                            {
                                PhotoID = g.Key,
                                Tags = g.ToList()
                            };

            var query = from p in _context.Photos
                        join m in _context.Metadata on p.PhotoID equals m.PhotoID into metadataJoin
                        from m in metadataJoin.DefaultIfEmpty()
                        join u in _context.Users on p.UploadedBy equals u.UserID into usersJoin
                        from u in usersJoin.DefaultIfEmpty()
                        select new PhotosResponse
                        {
                            Photos = p,
                            Metadata = m,
                            UploadedBy = u.Username
                        };

            if (!string.IsNullOrEmpty(image.Keyword))
            {
                query = query.Where(p => p.Photos.Title.Contains(image.Keyword) || p.Photos.Description.Contains(image.Keyword))
                    .OrderByDescending(p => p.Photos.Title.Contains(image.Keyword))
                    .ThenByDescending(p => p.Photos.Description.Contains(image.Keyword));
            }

            if (!string.IsNullOrEmpty(image.Metadata.CameraMake))
                query = query.Where(p => p.Metadata.CameraMake == image.Metadata.CameraMake);

            if (!string.IsNullOrEmpty(image.Metadata.CameraModel))
                query = query.Where(p => p.Metadata.CameraModel == image.Metadata.CameraModel);

            if (!string.IsNullOrEmpty(image.Metadata.ExposureTime))
                query = query.Where(p => p.Metadata.ExposureTime == image.Metadata.ExposureTime);

            if (!string.IsNullOrEmpty(image.Metadata.Aperture))
                query = query.Where(p => p.Metadata.Aperture == image.Metadata.Aperture);

            if (!string.IsNullOrEmpty(image.Metadata.ISO))
                query = query.Where(p => p.Metadata.ISO == image.Metadata.ISO);

            if (!string.IsNullOrEmpty(image.Metadata.FocalLength))
                query = query.Where(p => p.Metadata.FocalLength == image.Metadata.FocalLength);

            if (!string.IsNullOrEmpty(image.Metadata.DateTaken))
            {
                var dateTaken = DateTime.ParseExact(image.Metadata.DateTaken, Constants.DATETIME_FORMAT, System.Globalization.CultureInfo.InvariantCulture);
                query = query.Where(p => p.Metadata.DateTaken.HasValue && p.Metadata.DateTaken >= dateTaken);
            }

            var count = await query.CountAsync();
            var photos = await query.ToArrayAsync();

            if (double.TryParse(image.Metadata.GPSLatitude, out var GPSLatitude))
            {
                photos = photos.Where(p => CheckApproximateLocation(p.Metadata.GPSLatitude, GPSLatitude)).ToArray();
            }
            if (double.TryParse(image.Metadata.GPSLongitude, out var GPSLongitude))
            {
                photos = photos.Where(p => CheckApproximateLocation(p.Metadata.GPSLongitude, GPSLongitude)).ToArray();
            }
            if (image.TagIDs.Length > 0)
            {
                var photoIDs = photos.Select(p => p.Photos.PhotoID).ToArray();
                var photoTags = await _context.PhotoTags.Where(t => photoIDs.Contains(t.PhotoID)).ToArrayAsync();

                photos = photos.Where(p => image.TagIDs.All(t => photoTags.Where(t => t.PhotoID == p.Photos.PhotoID).Select(t => t.TagID).Contains(t))).ToArray();
            }
            var sortedPhotos = photos.Skip(image.Start).Take(image.End - image.Start).Select(p => new PhotosDTO(p.Photos, p.UploadedBy, count)).ToArray();

            return sortedPhotos;
        }

        // GET: api/Photo
        [HttpGet("Photo")]
        public async Task<ActionResult<PhotosDTO>> GetPhoto(int photoID)
        {
            IQueryable<PhotosResponse> query =
                from p in _context.Photos
                join u in _context.Users on p.UploadedBy equals u.UserID into usersJoin
                from u in usersJoin.DefaultIfEmpty()
                where p.PhotoID == photoID
                select new PhotosResponse
                {
                    Photos = p,
                    UploadedBy = u.Username
                };
            
            var photo = await query.FirstOrDefaultAsync();

            return photo == null
                ? BadRequest()
                : new PhotosDTO(photo.Photos, photo.UploadedBy, 1);
        }

        // GET: api/Photos/Similar
        [HttpGet("Photos/Similar")]
        public async Task<ActionResult<IEnumerable<PhotosDTO>>> GetSimilarPhotos(int photoID, int n)
        {
            var jsonFilePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.FEATURES_FILE);
            var lastModified = System.IO.File.Exists(jsonFilePath) ? System.IO.File.GetLastWriteTime(jsonFilePath) : DateTime.MinValue;
            var photo = await _context.Photos.FindAsync(photoID);
            if (photo == null || photo.UploadDate >= lastModified) return new PhotosDTO[0];

            // Retrieve features for the specified photo
            var features = await _context.Features.FirstOrDefaultAsync(f => f.PhotoID == photoID);
            if (features == null)
            {
                return BadRequest("Photo not found.");
            }

            // Call Python script with the features data
            var similarPhotos = await CallPythonScriptForKNN(features, n);

            // Retrieve photos from the database based on the IDs returned by the Python script
            var query =
                from p in _context.Photos
                join u in _context.Users on p.UploadedBy equals u.UserID into usersJoin
                from u in usersJoin.DefaultIfEmpty()
                where similarPhotos.Contains(p.PhotoID)
                select new PhotosResponse
                {
                    Photos = p,
                    UploadedBy = u.Username
                };
            var photos = await query.ToArrayAsync();

            var getPhotos = photos
                .Select(p => new PhotosDTO(p.Photos, p.UploadedBy, photos.Length))
                .ToArray();

            return getPhotos;
        }

        // GET: api/Photo/Tags
        [HttpGet("Photo/Tags")]
        public async Task<ActionResult<IEnumerable<PhotoTags>>> GetPhotoTags(int photoID)
        {
            var photoTags = await _context.PhotoTags.Where(photoTag => photoTag.PhotoID == photoID).ToArrayAsync();
            return photoTags;
        }

        // POST: api/Photo
        [HttpPost("Photo")]
        public async Task<ActionResult<PhotosDTO>> PostPhoto(int userID, [FromBody] ImportImageRequest newPhoto, [FromQuery] int[] tagIDs)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userID);
            if (user == null) return BadRequest();

            var result = await ProcessPhoto(userID, newPhoto.Image, newPhoto.Title, newPhoto.Description, tagIDs);
            if (string.IsNullOrEmpty(result.ErrorMessage) == false)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result.ErrorMessage);
            }

            var count = await _context.Photos.CountAsync();
            return Ok("{\"count\": " + count + "}");
        }

        // PUT: api/Photo
        [HttpPut("Photo")]
        public async Task<IActionResult> UpdatePhotoTitleDescription(int photoID, string? title, string? description, [FromQuery] int[] tagIDs)
        {
            var photo = await _context.Photos.FindAsync(photoID);

            if (photo == null)
            {
                return BadRequest();
            }

            if (!string.IsNullOrEmpty(title)) photo.Title = title;
            if (!string.IsNullOrEmpty(description)) photo.Description = description;

            _context.Entry(photo).State = EntityState.Modified;

            var tags = await _context.PhotoTags.Where(photoTag => photoTag.PhotoID == photo.PhotoID).ToArrayAsync();
            var removeTags = tags.Where(tag => !tagIDs.Contains(tag.TagID)).ToArray();
            var tagIDsBak = tags.Select(tag => tag.TagID).ToArray();
            var addTags = tagIDs.Where(id => !tagIDsBak.Contains(id)).ToArray();
            var photoTags = addTags.Select(tagId => new PhotoTags
            {
                PhotoID = photo.PhotoID,
                TagID = tagId
            }).ToArray();

            _context.PhotoTags.RemoveRange(removeTags);
            _context.PhotoTags.AddRange(photoTags);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                 Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }

        // DELETE: api/Photo
        [HttpDelete("Photo")]
        public async Task<IActionResult> DeletePhoto(int photoID)
        {
            var photo = await _context.Photos.FindAsync(photoID);

            if (photo == null)
            {
                return BadRequest();
            }

            var metadata = await _context.Metadata.Where(m => m.PhotoID == photoID).ToArrayAsync();
            var feature = await _context.Features.Where(f => f.PhotoID == photoID).ToArrayAsync();
            var photoTags = await _context.PhotoTags.Where(t => t.PhotoID == photoID).ToArrayAsync();
            _context.Metadata.RemoveRange(metadata);
            _context.Features.RemoveRange(feature);
            _context.PhotoTags.RemoveRange(photoTags);
            await _context.SaveChangesAsync();

            var fullPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER + "/" + photo.FilePath);
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool CheckApproximateLocation(string baseLocation, double checkLocation)
        {
            var checkParse = double.TryParse(baseLocation, out var parseBaseLocation);
            return checkParse && parseBaseLocation * (1 - Constants.APPROXIMATE_LOCATION) <= checkLocation && checkLocation <= parseBaseLocation * (1 + Constants.APPROXIMATE_LOCATION);
        }

        private async Task<int[]> CallPythonScriptForKNN(Features features, int n)
        {
            try
            {
                var input = new
                {
                    PhotoID = features.PhotoID,
                    ColorHistogram = ConvertToDoubleArray(features.ColorHistogram),
                    TextureFeatures = ConvertToDoubleArray(features.TextureFeatures),
                    ShapeDescriptors = ConvertToDoubleArray(features.ShapeDescriptors),
                    n = n
                };

                var jsonData = JsonSerializer.Serialize(input);
                var psi = new ProcessStartInfo
                {
                    FileName = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_VENV)),
                    Arguments = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_KNN_SCRIPT_FILE_PATH)),
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
                            await sw.WriteLineAsync(jsonData);
                        }
                    }

                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        throw new Exception("Errors: " + error);
                    }

                    return JsonSerializer.Deserialize<int[]>(output) ?? Array.Empty<int>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Array.Empty<int>();
            }
        }

        private async Task<(string ErrorMessage, Features? Features)> ProcessPhoto(int userID, string image, string title, string description, int[] tagIDs, bool importOnlyPhotos = false)
        {
            try
            {
                if (string.IsNullOrEmpty(image))
                {
                    return ("Image is required.", null);
                }

                var base64String = image.Split(',')[1];
                var mimeType = image.Split(',')[0].Split(':')[1].Split(';')[0];
                var imageBytes = Convert.FromBase64String(base64String);

                var extension = mimeType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/gif" => ".gif",
                    _ => ".bin"
                };

                var fileName = string.Format("{0}{1}", Path.GetRandomFileName(), extension);
                var filePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER + "/" + fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await stream.WriteAsync(imageBytes, 0, imageBytes.Length);
                }

                if (importOnlyPhotos) return (string.Empty, null);

                var photo = new Photos
                {
                    Title = title,
                    Description = description,
                    FilePath = fileName,
                    UploadDate = DateTime.Now,
                    LastChanged = DateTime.Now,
                    UploadedBy = userID
                };

                var metadata = ExtractMetadata(filePath);

                var features = await GenerateFeaturesAsync(filePath);
                if (features == null) throw new Exception("Can't extract photo features");
                var feature = new Features
                {
                    ColorHistogram = ConvertToByteArray(features.ColorHistogram),
                    TextureFeatures = ConvertToByteArray(features.TextureFeatures),
                    ShapeDescriptors = ConvertToByteArray(features.ShapeDescriptors)
                };

                var photoTags = tagIDs.Select(t => new PhotoTags
                {
                    TagID = t
                }).ToArray();

                _context.Photos.Add(photo);
                await _context.SaveChangesAsync();

                metadata.PhotoID = photo.PhotoID;
                _context.Metadata.Add(metadata);

                feature.PhotoID = photo.PhotoID;
                _context.Features.Add(feature);

                if (photoTags.Length > 0)
                {
                    photoTags.Select(t => t.PhotoID = photo.PhotoID).ToArray();
                    _context.PhotoTags.AddRange(photoTags);
                }

                await _context.SaveChangesAsync();

                return (string.Empty, feature);
            }
            catch (Exception ex)
            {
                return (ex.Message, null);
            }
        }

        private async Task UpdateKDTreeAsync(IEnumerable<Features> features)
        {
            try
            {
                var input = features.Select(f => new
                {
                    PhotoID = f.PhotoID,
                    ColorHistogram = ConvertToDoubleArray(f.ColorHistogram),
                    TextureFeatures = ConvertToDoubleArray(f.TextureFeatures),
                    ShapeDescriptors = ConvertToDoubleArray(f.ShapeDescriptors)
                }).ToArray();

                var jsonData = JsonSerializer.Serialize(input);
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
                            await sw.WriteLineAsync(jsonData);
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

        private static double[] ConvertToDoubleArray(byte[] byteArray)
        {
            // Ensure the length of the byte array is a multiple of the size of double (8 bytes)
            int doubleCount = byteArray.Length / sizeof(double);
            double[] doubleArray = new double[doubleCount];

            Buffer.BlockCopy(byteArray, 0, doubleArray, 0, byteArray.Length);

            return doubleArray;
        }

        private Metadata ExtractMetadata(string filePath)
        {
            var directories = ImageMetadataReader.ReadMetadata(filePath);

            var exifIFD0 = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
            var subIfd = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
            var gps = directories.OfType<GpsDirectory>().FirstOrDefault();

            // Camera Make
            var cameraMake = exifIFD0 == null ? string.Empty : exifIFD0.GetDescription(ExifDirectoryBase.TagMake) ?? string.Empty;

            // Camera Model
            var cameraModel = exifIFD0 == null ? string.Empty : exifIFD0.GetDescription(ExifDirectoryBase.TagModel) ?? string.Empty;

            // Exposure Time
            var exposureTimeRaw = subIfd?.GetDescription(ExifDirectoryBase.TagExposureTime);
            var exposureTime = exposureTimeRaw ?? string.Empty;
            if (exposureTimeRaw != null && exposureTimeRaw.Contains("/"))
            {
                exposureTimeRaw = exposureTimeRaw.Replace(" sec", string.Empty);
                var parts = exposureTimeRaw.Split('/');
                if (parts.Length == 2 && double.TryParse(parts[0], out double numerator) && double.TryParse(parts[1], out double denominator))
                {
                    exposureTime = (numerator / denominator).ToString("G");
                }
            }

            // Aperture
            var aperture = subIfd?.GetDescription(ExifDirectoryBase.TagFNumber) ?? string.Empty;
            if (string.IsNullOrEmpty(aperture) == false) aperture = aperture.Replace("f/", string.Empty);

            // ISO
            var iso = subIfd?.GetDescription(ExifDirectoryBase.TagIsoEquivalent) ?? string.Empty;

            // Focal Length
            var focalLength = subIfd?.GetDescription(ExifDirectoryBase.TagFocalLength) ?? string.Empty;

            // GPS Latitude
            var GPSLatitude = string.Empty;
            if (gps?.GetGeoLocation()?.Latitude is double latitude)
            {
                GPSLatitude = latitude.ToString();
            }

            // GPS Longitude
            var GPSLongitude = string.Empty;
            if (gps?.GetGeoLocation()?.Longitude is double longitude)
            {
                GPSLongitude = longitude.ToString();
            }

            // Date Taken
            var dateTakenRaw = subIfd?.GetDescription(ExifDirectoryBase.TagDateTimeOriginal);
            var dateTaken = dateTakenRaw == null ? (DateTime?)null : DateTime.ParseExact(dateTakenRaw, Constants.DATETIME_FORMAT, System.Globalization.CultureInfo.InvariantCulture);

            var metadata = new Metadata
            {
                CameraMake = cameraMake,
                CameraModel = cameraModel,
                ExposureTime = exposureTime,
                Aperture = aperture,
                ISO = iso,
                FocalLength = focalLength,
                GPSLatitude = GPSLatitude,
                GPSLongitude = GPSLongitude,
                DateTaken = dateTaken,
            };
            return metadata;
        }

        private async Task<FeatureResponse?> GenerateFeaturesAsync(string filePath)
        {
            try
            {
                var dataToSend = new { ImagePath = filePath };
                var jsonData = JsonSerializer.Serialize(dataToSend);
                var psi = new ProcessStartInfo
                {
                    FileName = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_VENV)),
                    Arguments = string.Format("\"{0}\"", Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.PYTHON_IMAGE_PROCESSING_SCRIPT_FILE_PATH)),
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
                            await sw.WriteLineAsync(jsonData);
                        }
                    }

                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        throw new Exception("Errors: " + error);
                    }

                    return JsonSerializer.Deserialize<FeatureResponse>(output);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        private static byte[] ConvertToByteArray(double[] doubleArray)
        {
            byte[] byteArray = new byte[doubleArray.Length * sizeof(double)];
            Buffer.BlockCopy(doubleArray, 0, byteArray, 0, byteArray.Length);
            return byteArray;
        }

        public class PhotosResponse
        {
            public Photos Photos { get; set; }
            public Metadata Metadata { get; set; }
            public string UploadedBy { get; set; }
            public List<PhotoTags> Tags { get; set; }
        }

        private class FeatureResponse
        {
            public FeatureResponse()
            {
                ColorHistogram = new double[0];
                TextureFeatures = new double[0];
                ShapeDescriptors = new double[0];
            }

            public double[] ColorHistogram { get; set; }
            public double[] TextureFeatures { get; set; }
            public double[] ShapeDescriptors { get; set; }
        }
        #endregion

        #region Import/Export
        // POST: api/Import
        [HttpPost("Import")]
        public async Task<IActionResult> ImportPhotos(int userID, [FromBody] ImportImageRequest[] importData, bool clearExisting, bool importOnlyPhotos)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            if (clearExisting)
            {
                _context.PhotoTags.RemoveRange(_context.PhotoTags);
                _context.Features.RemoveRange(_context.Features);
                _context.Metadata.RemoveRange(_context.Metadata);
                await _context.SaveChangesAsync();

                var fullPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER);
                if (System.IO.File.Exists(fullPath)) System.IO.Directory.Delete(fullPath);
                System.IO.Directory.CreateDirectory(fullPath);

                _context.Photos.RemoveRange(_context.Photos);
                await _context.SaveChangesAsync();

            }

            var emailSuccess = true;
            var emailMessages = new List<string>();

            for (var i = 0; i < importData.Length; i++)
            {
                var result = await ProcessPhoto(userID, importData[i].Image, importData[i].Title, string.Empty, Array.Empty<int>(), importOnlyPhotos);
                if (string.IsNullOrEmpty(result.ErrorMessage) == false)
                {
                    emailSuccess = false;
                    emailMessages.Add($"Failed to import {importData[i].Title}: {result.ErrorMessage}");
                }
            }

            var emailSubject = emailSuccess ? "Photo Import Successful" : "Photo Import Completed with Errors";
            var emailBody = emailSuccess ? "All photos have been successfully imported." : string.Join("\n", emailMessages);

            await SendEmailNotification(user.Email, emailSubject, emailBody);

            return emailSuccess ? Ok() : StatusCode(StatusCodes.Status500InternalServerError, "Some photos failed to import.");
        }

        // POST: api/ImportLocal
        [HttpPost("ImportLocal")]
        public async Task<IActionResult> ImportLocalPhotos(int userID, string filePath, bool importOnlyPhotos)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            var images = ExtractImagesWithTitles(filePath);
            var importData = new List<ImportImageRequest>();
            foreach (var image in images)
            {
                importData.Add(new ImportImageRequest { Title = image.Title, Image = image.Base64File });
            }

            _context.PhotoTags.RemoveRange(_context.PhotoTags);
            _context.Features.RemoveRange(_context.Features);
            _context.Metadata.RemoveRange(_context.Metadata);
            await _context.SaveChangesAsync();

            var fullPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER);
            if (System.IO.File.Exists(fullPath)) System.IO.Directory.Delete(fullPath);
            System.IO.Directory.CreateDirectory(fullPath);

            _context.Photos.RemoveRange(_context.Photos);
            await _context.SaveChangesAsync();

            var emailSuccess = true;
            var emailMessages = new List<string>();

            for (var i = 0; i < importData.Count; i++)
            {
                var result = await ProcessPhoto(userID, importData[i].Image, importData[i].Title, string.Empty, Array.Empty<int>(), importOnlyPhotos);
                if (string.IsNullOrEmpty(result.ErrorMessage) == false)
                {
                    emailSuccess = false;
                    emailMessages.Add($"Failed to import {importData[i].Title}: {result.ErrorMessage}");
                }
            }

            var emailSubject = emailSuccess ? "Photo Import Successful" : "Photo Import Completed with Errors";
            var emailBody = emailSuccess ? "All photos have been successfully imported." : string.Join("\n", emailMessages);

            await SendEmailNotification(user.Email, emailSubject, emailBody);

            return emailSuccess ? Ok() : StatusCode(StatusCodes.Status500InternalServerError, "Some photos failed to import.");
        }

        // POST: api/Export
        [HttpPost("Export")]
        public async Task<IActionResult> ExportPhotos(int userID)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            try
            {
                var imagesFolderPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER);
                var fileName = string.Format("{0}.zip", Path.GetRandomFileName());
                var zipFilePath = ZipImages(imagesFolderPath, fileName);

                // Read the file content
                byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(zipFilePath);

                // Return the file as a download
                return File(fileBytes, "application/zip", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Failed to export photos: {ex.Message}");
            }
        }

        private async Task SendEmailNotification(string toEmail, string subject, string body, string attachmentPath = "")
        {
            using (var client = new SmtpClient("smtp.gmail.com", 587))
            {
                client.Credentials = new NetworkCredential(Constants.EMAIL_ADDRESS, Constants.EMAIL_PASSWORD);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(Constants.EMAIL_ADDRESS),
                    Subject = subject,
                    Body = body
                };

                mailMessage.To.Add(toEmail);
                if (!string.IsNullOrEmpty(attachmentPath))
                {
                    mailMessage.Attachments.Add(new Attachment(attachmentPath));
                }

                await client.SendMailAsync(mailMessage);
            }
        }

        private static List<(string Base64File, string Title)> ExtractImagesWithTitles(string directoryPath)
        {
            var imageExtensions = new HashSet<string> { ".jpg" };
            var imagesWithTitles = new List<(string Base64File, string Title)>();

            if (System.IO.Directory.Exists(directoryPath))
            {
                var files = System.IO.Directory.GetFiles(directoryPath);

                foreach (var file in files)
                {
                    var extension = Path.GetExtension(file).ToLower();

                    if (imageExtensions.Contains(extension))
                    {
                        string base64File = Convert.ToBase64String(System.IO.File.ReadAllBytes(file));
                        string base64FileWithMimeType = $"data:image/jpeg;base64,{base64File}";

                        imagesWithTitles.Add((base64FileWithMimeType, Path.GetFileNameWithoutExtension(file)));
                    }
                }
            }
            else
            {
                Console.WriteLine($"Directory not found: {directoryPath}");
            }

            return imagesWithTitles;
        }

        private string ZipImages(string imagesPath, string fileName)
        {
            var zipFilePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Zip files/" + fileName);

            // Create the zip file and add all files and directories
            ZipFile.CreateFromDirectory(imagesPath, zipFilePath, CompressionLevel.Optimal, true);

            return zipFilePath;
        }
        #endregion

        #region Backup/Restore
        // POST: api/Backup
        [HttpPost("Backup")]
        public async Task<IActionResult> BackupDatabase(int userID)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            try
            {
                var fileName = string.Format("{0}.bak", Path.GetRandomFileName());
                var backupFilePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Bak files/" + fileName);

                // Perform database backup
                await BackupDatabaseAsync(backupFilePath);

                // Ensure the backup file exists
                if (!System.IO.File.Exists(backupFilePath))
                {
                    return NotFound(new { message = "Backup file not found." });
                }

                // Read the file content as a stream to avoid loading it all into memory
                var fileStream = new FileStream(backupFilePath, FileMode.Open, FileAccess.Read);
                var fileSize = fileStream.Length;

                var emailSubject = "Backup File Created Successful";
                var emailBody = "Backup file for all photos have been created successfully.";

                await SendEmailNotification(user.Email, emailSubject, emailBody, backupFilePath);

                // Return the file as a download stream
                if (fileSize > 20971520) return File(fileStream, "application/octet-stream", fileName);

                return Ok();
            }
            catch (Exception ex)
            {
                var emailSubject = "Backup File Created with Errors";
                var emailBody = $"Failed to backup database: {ex.Message}";
                await SendEmailNotification(user.Email, emailSubject, emailBody);
                return StatusCode(StatusCodes.Status500InternalServerError, $"Failed to backup database: {ex.Message}");
            }
        }

        // POST: api/Restore
        [HttpPost("Restore")]
        public async Task<IActionResult> RestoreDatabase(int userID, [FromBody] RestoreRequest backup)
        {
            var user = await _context.Users.FindAsync(userID);
            if (user == null || user.Role != "Admin")
            {
                return BadRequest("User not found.");
            }

            if (string.IsNullOrEmpty(backup.BackupFile))
            {
                return BadRequest("Backup file is required.");
            }

            try
            {
                var base64String = backup.BackupFile.Split(',')[1];
                var imageBytes = Convert.FromBase64String(base64String);

                var backupFilePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Import files/" + Path.GetRandomFileName() + ".bak");

                // Save the uploaded .bak file to a temporary location
                using (var stream = new FileStream(backupFilePath, FileMode.Create))
                {
                    await stream.WriteAsync(imageBytes, 0, imageBytes.Length);
                }

                // Perform database restore
                await RestoreDatabaseAsync(backupFilePath);

                var emailSubject = "Backup File Restored Successful";
                var emailBody = "Backup file for all photos have been restored successfully.";

                await SendEmailNotification(user.Email, emailSubject, emailBody, backupFilePath);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Failed to restore database: {ex.Message}");
            }
        }

        // POST: api/RestoreLocal
        [HttpPost("RestoreLocal")]
        public async Task<IActionResult> RestoreLocalDatabase(string backupFilePath)
        {
            try
            {
                // Perform database restore
                await RestoreDatabaseAsync(backupFilePath);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Failed to restore database: {ex.Message}");
            }
        }

        private async Task BackupDatabaseAsync(string backupFilePath)
        {
            var connectionString = _configuration.GetConnectionString("Default");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                var backupQuery = $@"
                    BACKUP DATABASE [ImageServer]
                    TO DISK = N'{backupFilePath}'
                    WITH NOFORMAT, NOINIT,
                    NAME = N'ImageServer-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10";

                using (SqlCommand command = new SqlCommand(backupQuery, connection))
                {
                    await command.ExecuteNonQueryAsync();
                }
            }
        }
        
        private async Task RestoreDatabaseAsync(string backupFilePath)
        {
            var connectionString = _configuration.GetConnectionString("Default");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Switch to the master database
                using (SqlCommand useMasterCommand = new SqlCommand("USE master", connection))
                {
                    await useMasterCommand.ExecuteNonQueryAsync();
                }

                // Kill all connections to the ImageServer database
                var killConnectionsQuery = @"
                    DECLARE @kill varchar(8000) = '';
                    SELECT @kill = @kill + 'KILL ' + CONVERT(varchar(5), session_id) + ';'
                    FROM sys.dm_exec_sessions
                    WHERE database_id  = DB_ID('ImageServer')
                    EXEC(@kill)";

                using (SqlCommand killConnectionsCommand = new SqlCommand(killConnectionsQuery, connection))
                {
                    await killConnectionsCommand.ExecuteNonQueryAsync();
                }

                // Restore the ImageServer database
                var restoreQuery = $@"
                    RESTORE DATABASE [ImageServer]
                    FROM DISK = N'{backupFilePath}'
                    WITH FILE = 1,
                    NOUNLOAD, STATS = 10";

                using (SqlCommand command = new SqlCommand(restoreQuery, connection))
                {
                    await command.ExecuteNonQueryAsync();
                }
            }
        }
        #endregion
    }
}
