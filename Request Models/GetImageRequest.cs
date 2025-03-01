using EFImageServer.DTO_Models;

namespace EFImageServer.Request_Models
{
    public class GetImageRequest
    {
        public GetImageRequest()
        {
            Keyword = string.Empty;
            Metadata = new MetadataDTO();
            TagIDs = new int[0];
            Start = 0;
            End = 0;
        }

        public string Keyword { get; set; }
        public MetadataDTO Metadata { get; set; }
        public int[] TagIDs { get; set; }
        public int Start { get; set; }
        public int End { get; set; }
    }
}
