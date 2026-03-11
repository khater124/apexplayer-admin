using System.Text.Json;
using ApexPlayerPanel.Models;

namespace ApexPlayerPanel.Services;

public class DeviceService
{
    private readonly string _devicesPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public DeviceService(IWebHostEnvironment env)
    {
        _devicesPath = Path.Combine(env.ContentRootPath, "Data", "devices.json");
    }

    public List<Device> GetAll()
    {
        if (!File.Exists(_devicesPath))
            return new List<Device>();

        var json = File.ReadAllText(_devicesPath);
        var devices = JsonSerializer.Deserialize<List<Device>>(json) ?? new List<Device>();

        foreach (var d in devices)
        {
            d.Mac ??= "";
            d.DeviceId ??= "";
            d.Playlists ??= new List<DevicePlaylist>();
        }

        return devices;
    }

    public Device? GetByMacAndDeviceId(string mac, string deviceId)
    {
        return GetAll().FirstOrDefault(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
    }

    public void SaveAll(List<Device> devices)
    {
        File.WriteAllText(_devicesPath, JsonSerializer.Serialize(devices, JsonOptions));
    }

    // Called by the API every time a device checks in
    public void UpdateLastSeen(string mac, string deviceId)
    {
        var all = GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
        if (device != null)
        {
            device.LastSeen = DateTime.UtcNow;
            SaveAll(all);
        }
    }

    // Immediately expire the device (end trial or subscription)
    public void EndSubscription(string mac, string deviceId)
    {
        var all = GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
        if (device != null)
        {
            device.ExpiryDate = DateTime.UtcNow.AddSeconds(-1); // expired immediately
            SaveAll(all);
        }
    }

    // Renew: +1 year from today, or unlimited (null)
    public void Renew(string mac, string deviceId, bool unlimited)
    {
        var all = GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
        if (device != null)
        {
            device.ExpiryDate = unlimited ? null : DateTime.UtcNow.AddYears(1);
            device.IsBlocked = false; // unblock on renewal if it was blocked
            SaveAll(all);
        }
    }

    public void ToggleBlock(string mac, string deviceId)
    {
        var all = GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
        if (device != null)
        {
            device.IsBlocked = !device.IsBlocked;
            SaveAll(all);
        }
    }

    public void Delete(string mac, string deviceId)
    {
        var all = GetAll();
        all.RemoveAll(d =>
            string.Equals(d.Mac, mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, deviceId, StringComparison.OrdinalIgnoreCase));
        SaveAll(all);
    }

    public void AddOrUpdate(Device device)
    {
        var all = GetAll();
        var existing = all.FirstOrDefault(d =>
            string.Equals(d.Mac, device.Mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, device.DeviceId, StringComparison.OrdinalIgnoreCase));

        if (existing != null)
        {
            existing.Playlists = device.Playlists;
        }
        else
        {
            // Brand-new device → start 7-day trial automatically
            device.TrialStartDate = DateTime.UtcNow;
            device.ExpiryDate = DateTime.UtcNow.AddDays(7);
            all.Add(device);
        }

        SaveAll(all);
    }
}
