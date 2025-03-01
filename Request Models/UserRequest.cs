using EFImageServer.Models;

namespace EFImageServer.Request_Models
{
    public class UserRequest
    {
        public UserRequest()
        {
            Email = string.Empty;
            Password = string.Empty;
        }

        public string Email { get; set; }
        public string Password { get; set; }
    }
}
