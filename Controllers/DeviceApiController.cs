using Microsoft.AspNetCore.Mvc;
using ApexPlayerPanel.Models;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Controllers;

[ApiController]
[Route("api/device")]
public class DeviceApiController : ControllerBase
{
    private readonly DeviceService _deviceService;

    public DeviceApiController(DeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    [HttpGet]
    public IActionResult Get([FromQuery] string mac, [FromQuery] string deviceId)
    {
        if (string.IsNullOrWhiteSpace(mac) || string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { playlists = Array.Empty<DevicePlaylist>() });

        var device = _deviceService.GetByMacAndDeviceId(mac.Trim(), deviceId.Trim());
        if (device == null)
            return Ok(new { isBlocked = false, isExpired = false, playlists = Array.Empty<DevicePlaylist>() });

        // Update last seen timestamp
        _deviceService.UpdateLastSeen(mac.Trim(), deviceId.Trim());

        if (device.IsBlocked)
            return Ok(new { isBlocked = true, isExpired = false, expiryDate = device.ExpiryDate, playlists = Array.Empty<DevicePlaylist>() });

        if (device.IsExpired)
            return Ok(new { isBlocked = false, isExpired = true, expiryDate = device.ExpiryDate, playlists = Array.Empty<DevicePlaylist>() });

        return Ok(new { isBlocked = false, isExpired = false, expiryDate = device.ExpiryDate, playlists = device.Playlists });
    }

    // Client fetches its own expiry date to display in the app
    [HttpGet("expiry")]
    public IActionResult GetExpiry([FromQuery] string mac, [FromQuery] string deviceId)
    {
        if (string.IsNullOrWhiteSpace(mac) || string.IsNullOrWhiteSpace(deviceId))
            return BadRequest();
        var device = _deviceService.GetByMacAndDeviceId(mac.Trim(), deviceId.Trim());
        if (device == null) return Ok(new { expiryDate = (DateTime?)null });
        return Ok(new { expiryDate = device.ExpiryDate });
    }

    // Admin renews a device subscription
    [HttpPost("renew")]
    public IActionResult Renew([FromQuery] string mac, [FromQuery] string deviceId, [FromQuery] bool unlimited = false)
    {
        if (string.IsNullOrWhiteSpace(mac) || string.IsNullOrWhiteSpace(deviceId))
            return BadRequest();
        _deviceService.Renew(mac.Trim(), deviceId.Trim(), unlimited);
        return Ok();
    }

    // Client reports a playlist it logged into manually → add to device on server
    [HttpPost("addplaylist")]
    public IActionResult AddPlaylist([FromBody] ClientPlaylistRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Mac) || string.IsNullOrWhiteSpace(req.DeviceId))
            return BadRequest();

        var all = _deviceService.GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, req.Mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, req.DeviceId, StringComparison.OrdinalIgnoreCase));

        if (device == null)
        {
            device = new Device { Mac = req.Mac, DeviceId = req.DeviceId, Playlists = new() };
            all.Add(device);
        }

        // Avoid exact duplicates (same host + username)
        bool exists = device.Playlists.Any(p =>
            string.Equals(p.Host, req.Playlist.Host, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(p.Username, req.Playlist.Username, StringComparison.OrdinalIgnoreCase));

        if (!exists)
            device.Playlists.Add(req.Playlist);

        _deviceService.SaveAll(all);
        return Ok();
    }

    // Client removed a playlist → remove from device on server
    [HttpPost("removeplaylist")]
    public IActionResult RemovePlaylist([FromBody] ClientRemoveRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Mac) || string.IsNullOrWhiteSpace(req.DeviceId))
            return BadRequest();

        var all = _deviceService.GetAll();
        var device = all.FirstOrDefault(d =>
            string.Equals(d.Mac, req.Mac, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(d.DeviceId, req.DeviceId, StringComparison.OrdinalIgnoreCase));

        if (device != null)
        {
            device.Playlists.RemoveAll(p =>
                string.Equals(p.Host, req.Host, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(p.Username, req.Username, StringComparison.OrdinalIgnoreCase));
            _deviceService.SaveAll(all);
        }

        return Ok();
    }
}

public class ClientPlaylistRequest
{
    public string Mac { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public DevicePlaylist Playlist { get; set; } = new();
}

public class ClientRemoveRequest
{
    public string Mac { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public string Host { get; set; } = "";
    public string Username { get; set; } = "";
}
