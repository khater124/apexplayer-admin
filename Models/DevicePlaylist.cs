namespace ApexPlayerPanel.Models;

/// <summary>Playlist assigned to a device (XTREAM or M3U - same as app Profile)</summary>
public class DevicePlaylist
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = ""; // "XTREAM" or "M3U"

    // Xtream
    public string Host { get; set; } = "";
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";

    // M3U
    public string M3uUrl { get; set; } = "";
}
