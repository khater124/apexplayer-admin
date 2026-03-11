namespace ApexPlayerPanel.Models;

public class Device
{
    public string Mac { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public bool IsBlocked { get; set; } = false;

    // Trial: set automatically when device is first added (now + 7 days)
    public DateTime? TrialStartDate { get; set; }
    // Null = unlimited, otherwise the date access expires
    public DateTime? ExpiryDate { get; set; }
    // Updated every time the device calls the API
    public DateTime? LastSeen { get; set; }

    public List<DevicePlaylist> Playlists { get; set; } = new();

    // Helper: is the device currently expired?
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
}
