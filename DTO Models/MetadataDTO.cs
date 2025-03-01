using EFImageServer.Data;
using EFImageServer.Models;

namespace EFImageServer.DTO_Models
{
    public class MetadataDTO
    {
        public MetadataDTO()
        {
            CameraMake = string.Empty;
            CameraModel = string.Empty;
            ExposureTime = string.Empty;
            Aperture = string.Empty;
            ISO = string.Empty;
            FocalLength = string.Empty;
            GPSLatitude = string.Empty;
            GPSLongitude = string.Empty;
            DateTaken = string.Empty;
        }

        public MetadataDTO(Metadata metadata)
        {
            CameraMake = metadata.CameraMake;
            CameraModel = metadata.CameraModel;
            ExposureTime = metadata.ExposureTime;
            Aperture = metadata.Aperture;
            ISO = metadata.ISO;
            FocalLength = metadata.FocalLength;
            GPSLatitude = metadata.GPSLatitude;
            GPSLongitude = metadata.GPSLongitude;
            DateTaken = metadata.DateTaken.HasValue ? metadata.DateTaken.Value.ToString(Constants.DATETIME_FORMAT) : string.Empty;
        }

        public string CameraMake { get; set; }
        public string CameraModel { get; set; }
        public string ExposureTime { get; set; }
        public string Aperture { get; set; }
        public string ISO { get; set; }
        public string FocalLength { get; set; }
        public string GPSLatitude { get; set; }
        public string GPSLongitude { get; set; }
        public string DateTaken { get; set; }
    }
}
