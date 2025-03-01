using EFImageServer.Models;

namespace EFImageServer.DTO_Models
{
    public class UsersDTO
    {
        public UsersDTO(Users user)
        {
            UserID = user.UserID;
            Username = user.Username;
            Email = user.Email;
            Role = user.Role;
        }

        public int UserID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
