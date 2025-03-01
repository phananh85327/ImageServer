namespace EFImageServer.Models
{
    public class Metadata
    {
        public int MetadataID { get; set; }
        public int PhotoID { get; set; }
        public string CameraMake { get; set; }
        public string CameraModel { get; set; }
        public string ExposureTime { get; set; }
        public string Aperture { get; set; }
        public string ISO { get; set; }
        public string FocalLength { get; set; }
        public string GPSLatitude { get; set; }
        public string GPSLongitude { get; set; }
        public DateTime? DateTaken { get; set; }
    }
}
