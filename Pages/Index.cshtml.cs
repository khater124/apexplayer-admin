using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Models;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class IndexModel : PageModel
{
    private readonly DeviceService _deviceService;
    private readonly ILogger<IndexModel> _logger;

    public List<Device> Devices { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 15;
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    [BindProperty]
    public string Mac { get; set; } = "";

    [BindProperty]
    public string DeviceId { get; set; } = "";

    [BindProperty(SupportsGet = true)]
    public string Search { get; set; } = "";

    [BindProperty(SupportsGet = true, Name = "Page")]
    public int CurrentPage { get; set; } = 1;

    public IndexModel(DeviceService deviceService, ILogger<IndexModel> logger)
    {
        _deviceService = deviceService;
        _logger = logger;
    }

    public IActionResult OnGet()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        try
        {
            var all = _deviceService.GetAll();

            if (!string.IsNullOrWhiteSpace(Search))
            {
                var q = Search.Trim().ToLower();
                all = all.Where(d =>
                    (d?.Mac ?? "").ToLower().Contains(q) ||
                    (d?.DeviceId ?? "").ToLower().Contains(q) ||
                    (d?.Playlists ?? new List<DevicePlaylist>()).Any(p =>
                        (p.Username ?? "").ToLower().Contains(q) ||
                        (p.Host ?? "").ToLower().Contains(q))
                ).ToList();
            }

            all = all.Where(d => d != null).ToList();
            TotalCount = all.Count;
            int totalPages = Math.Max(1, (int)Math.Ceiling((double)TotalCount / PageSize));
            PageNumber = Math.Clamp(CurrentPage, 1, totalPages);
            Devices = all.Skip((PageNumber - 1) * PageSize).Take(PageSize).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load device list. TraceId: {TraceId}", HttpContext.TraceIdentifier);
            TempData["DeviceError"] = $"Could not load device list right now. Ref: {HttpContext.TraceIdentifier}";
            Devices = new List<Device>();
            TotalCount = 0;
            PageNumber = 1;
        }

        return base.Page();
    }

    public IActionResult OnPostAdd()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        Mac = Mac?.Trim() ?? "";
        DeviceId = DeviceId?.Trim() ?? "";

        if (string.IsNullOrWhiteSpace(Mac) || string.IsNullOrWhiteSpace(DeviceId))
        {
            ModelState.AddModelError(string.Empty, "MAC and Device ID are required.");
            Devices = _deviceService.GetAll();
            return Page();
        }

        try
        {
            var existing = _deviceService.GetByMacAndDeviceId(Mac, DeviceId);
            var macUsedElsewhere = _deviceService.GetAll()
                .Any(d => string.Equals(d.Mac, Mac, StringComparison.OrdinalIgnoreCase) &&
                         !string.Equals(d.DeviceId, DeviceId, StringComparison.OrdinalIgnoreCase));

            var deviceToSave = new Device
            {
                Mac = Mac,
                DeviceId = DeviceId,
                Playlists = existing?.Playlists ?? new List<DevicePlaylist>()
            };
            _deviceService.AddOrUpdate(deviceToSave);

            if (existing != null)
            {
                TempData["DeviceMessage"] = "Device updated successfully.";
            }
            else
            {
                TempData["DeviceMessage"] = "Device added successfully.";
            }

            if (macUsedElsewhere)
            {
                TempData["DeviceWarning"] = "Note: This MAC address is also registered with another Device ID.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to add/update device. Mac: {Mac}, DeviceId: {DeviceId}, TraceId: {TraceId}",
                Mac,
                DeviceId,
                HttpContext.TraceIdentifier);
            TempData["DeviceError"] = $"Could not save this device. Ref: {HttpContext.TraceIdentifier}";
            TotalCount = 0;
            PageNumber = 1;
            Devices = new List<Device>();
            return RedirectToPage(new { Search, Page = 1 });
        }

        return RedirectToPage(new { Search, Page = 1 });
    }

    public IActionResult OnPostToggleBlock(string mac, string deviceId)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        _deviceService.ToggleBlock(mac, deviceId);
        return RedirectToPage(new { Search, Page = CurrentPage });
    }

    public IActionResult OnPostDelete(string mac, string deviceId)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        _deviceService.Delete(mac, deviceId);
        return RedirectToPage(new { Search, Page = CurrentPage });
    }

}
