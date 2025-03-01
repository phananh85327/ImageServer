namespace EFImageServer.Models
{
    public class Tags
    {
        public Tags()
        {
            TagID = 0;
            TagName = string.Empty;
        }

        public int TagID { get; set; }
        public string TagName { get; set; }
    }
}
