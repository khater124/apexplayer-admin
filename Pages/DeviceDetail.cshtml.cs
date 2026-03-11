using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Models;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class DeviceDetailModel : PageModel
{
    private readonly DeviceService _deviceService;

    public Device? Device { get; set; }

    [BindProperty] public string Mac { get; set; } = "";
    [BindProperty] public string DeviceId { get; set; } = "";
    [BindProperty] public string PlaylistName { get; set; } = "";
    [BindProperty] public string Host { get; set; } = "";
    [BindProperty] public string Username { get; set; } = "";
    [BindProperty] public string Password { get; set; } = "";
    [BindProperty] public int PlaylistIndex { get; set; } = -1;

    public DeviceDetailModel(DeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    public IActionResult OnGet(string? mac, string? deviceId)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        if (string.IsNullOrWhiteSpace(mac) || string.IsNullOrWhiteSpace(deviceId))
            return RedirectToPage("/Index");

        Mac = mac;
        DeviceId = deviceId;
        Device = _deviceService.GetByMacAndDeviceId(mac, deviceId)
                 ?? new Device { Mac = mac, DeviceId = deviceId };

        return Page();
    }

    public IActionResult OnPostAddPlaylist()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        if (string.IsNullOrWhiteSpace(Host) || string.IsNullOrWhiteSpace(Username))
        {
            ModelState.AddModelError(string.Empty, "Host and Username are required.");
            Device = _deviceService.GetByMacAndDeviceId(Mac, DeviceId) ?? new Device { Mac = Mac, DeviceId = DeviceId };
            return Page();
        }

        var device = _deviceService.GetByMacAndDeviceId(Mac.Trim(), DeviceId.Trim())
                     ?? new Device { Mac = Mac.Trim(), DeviceId = DeviceId.Trim() };

        var nameToUse = string.IsNullOrWhiteSpace(PlaylistName) ? Username.Trim() : PlaylistName.Trim();
        device.Playlists.Add(new DevicePlaylist
        {
            Name = nameToUse,
            Type = "XTREAM",
            Host = Host.Trim(),
            Username = Username.Trim(),
            Password = Password?.Trim() ?? ""
        });

        _deviceService.AddOrUpdate(device);
        return RedirectToPage(new { mac = device.Mac, deviceId = device.DeviceId });
    }

    public IActionResult OnPostEditPlaylist()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        var device = _deviceService.GetByMacAndDeviceId(Mac.Trim(), DeviceId.Trim());
        if (device != null && PlaylistIndex >= 0 && PlaylistIndex < device.Playlists.Count)
        {
            var pl = device.Playlists[PlaylistIndex];
            pl.Host = Host?.Trim() ?? "";
            pl.Username = Username?.Trim() ?? "";
            pl.Password = Password?.Trim() ?? "";
            pl.Name = string.IsNullOrWhiteSpace(PlaylistName) ? pl.Username : PlaylistName.Trim();
            _deviceService.AddOrUpdate(device);
        }

        return RedirectToPage(new { mac = Mac, deviceId = DeviceId });
    }

    public IActionResult OnPostEndSubscription()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");
        _deviceService.EndSubscription(Mac.Trim(), DeviceId.Trim());
        return RedirectToPage(new { mac = Mac, deviceId = DeviceId });
    }

    public IActionResult OnPostRenew(bool unlimited = false)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");
        _deviceService.Renew(Mac.Trim(), DeviceId.Trim(), unlimited);
        return RedirectToPage(new { mac = Mac, deviceId = DeviceId });
    }

    public IActionResult OnPostToggleBlock()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        _deviceService.ToggleBlock(Mac.Trim(), DeviceId.Trim());
        return RedirectToPage(new { mac = Mac, deviceId = DeviceId });
    }

    public IActionResult OnPostDeletePlaylist()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        var device = _deviceService.GetByMacAndDeviceId(Mac.Trim(), DeviceId.Trim());
        if (device != null && PlaylistIndex >= 0 && PlaylistIndex < device.Playlists.Count)
        {
            device.Playlists.RemoveAt(PlaylistIndex);
            _deviceService.AddOrUpdate(device);
        }

        return RedirectToPage(new { mac = Mac, deviceId = DeviceId });
    }
}
