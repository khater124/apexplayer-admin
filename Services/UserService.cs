using System.Text.Json;
using ApexPlayerPanel.Models;

namespace ApexPlayerPanel.Services;

public class UserService
{
    private readonly string _usersPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public UserService(IWebHostEnvironment env)
    {
        _usersPath = Path.Combine(env.ContentRootPath, "Data", "users.json");
    }

    public bool Validate(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return false;

        var users = LoadUsers();
        return users.Exists(u =>
            string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase) &&
            u.Password == password);
    }

    public string GetAuthVersion()
    {
        if (!File.Exists(_usersPath))
            return "0";

        return File.GetLastWriteTimeUtc(_usersPath).Ticks.ToString();
    }

    private List<StaffUser> LoadUsers()
    {
        if (!File.Exists(_usersPath))
            return new List<StaffUser>();

        var json = File.ReadAllText(_usersPath);
        var users = JsonSerializer.Deserialize<List<StaffUser>>(json);
        return users ?? new List<StaffUser>();
    }

    public bool UpdateCredentials(string oldUsername, string oldPassword, string newUsername, string newPassword)
    {
        var users = LoadUsers();
        var u = users.FirstOrDefault(x =>
            string.Equals(x.Username, oldUsername, StringComparison.OrdinalIgnoreCase) &&
            x.Password == oldPassword);
        if (u == null) return false;
        u.Username = newUsername?.Trim() ?? "";
        u.Password = newPassword?.Trim() ?? "";
        if (string.IsNullOrEmpty(u.Username) || string.IsNullOrEmpty(u.Password)) return false;
        File.WriteAllText(_usersPath, JsonSerializer.Serialize(users, JsonOptions));
        return true;
    }
}
