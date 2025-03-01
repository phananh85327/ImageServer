namespace EFImageServer.Models
{
    public class Photos
    {
        public int PhotoID { get; set; }
        public int UploadedBy { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadDate { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime LastChanged { get; set; }
    }
}
