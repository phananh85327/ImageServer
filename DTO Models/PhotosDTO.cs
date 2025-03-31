using EFImageServer.Data;
using EFImageServer.Models;

namespace EFImageServer.DTO_Models
{
    public class PhotosDTO
    {
        public PhotosDTO(Photos photo, string uploadedBy, int count)
        {
            PhotoID = photo.PhotoID;
            UploadedBy = photo.UploadedBy;
            ImageBase64 = ConvertImageToBase64(photo.FilePath);
            UploadDate = photo.UploadDate;
            Title = photo.Title;
            Description = photo.Description;
            LastChanged = photo.LastChanged;
            UploadedByUsername = uploadedBy;
            Count = count;
        }

        public int PhotoID { get; set; }
        public int UploadedBy { get; set; }
        public string ImageBase64 { get; set; }
        public DateTime UploadDate { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime LastChanged { get; set; }
        public string UploadedByUsername { get; set; }
        public int Count { get; set; }

        private string ConvertImageToBase64(string filePath)
        {
            var fullPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", Constants.IMAGE_FOLDER + "/" + filePath);
            if (!File.Exists(fullPath))
            {
                return string.Empty;
            }
            var imageBytes = File.ReadAllBytes(fullPath);
            var base64String = Convert.ToBase64String(imageBytes);

            var mimeType = string.Empty;
            switch (Path.GetExtension(fullPath).ToLower())
            {
                case ".jpg":
                case ".jpeg":
                    mimeType = "image/jpeg";
                    break;
                case ".png":
                    mimeType = "image/png";
                    break;
                case ".gif":
                    mimeType = "image/gif";
                    break;
                default:
                    mimeType = "application/octet-stream";
                    break;
            }

            var fileName = Path.GetFileName(filePath);
            return $"data:{mimeType};base64,{base64String};filename={fileName}";
        }
    }
}
