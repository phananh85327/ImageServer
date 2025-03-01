namespace EFImageServer.Request_Models
{
    public class ImportImageRequest
    {
        public ImportImageRequest()
        {
            Image = string.Empty;
            Title = string.Empty;
            Description = string.Empty;
        }

        public string Image { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
