namespace EFImageServer.Request_Models
{
    public class RestoreRequest
    {
        public RestoreRequest()
        {
            BackupFile = string.Empty;
        }

        public string BackupFile { get; set; }
    }
}
