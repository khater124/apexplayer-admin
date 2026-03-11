using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Models;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class IndexModel : PageModel
{
    private readonly DeviceService _deviceService;

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

    [BindProperty(SupportsGet = true)]
    public int Page { get; set; } = 1;

    public IndexModel(DeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    public IActionResult OnGet()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        var all = _deviceService.GetAll();

        if (!string.IsNullOrWhiteSpace(Search))
        {
            var q = Search.Trim().ToLower();
            all = all.Where(d =>
                d.Mac.ToLower().Contains(q) ||
                d.DeviceId.ToLower().Contains(q) ||
                d.Playlists.Any(p =>
                    (p.Username ?? "").ToLower().Contains(q) ||
                    (p.Host ?? "").ToLower().Contains(q))
            ).ToList();
        }

        TotalCount = all.Count;
        int totalPages = Math.Max(1, (int)Math.Ceiling((double)TotalCount / PageSize));
        PageNumber = Math.Clamp(Page, 1, totalPages);
        Devices = all.Skip((PageNumber - 1) * PageSize).Take(PageSize).ToList();
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

        _deviceService.AddOrUpdate(new Device
        {
            Mac = Mac,
            DeviceId = DeviceId,
            Playlists = new List<DevicePlaylist>()
        });

        return RedirectToPage(new { Search, Page = 1 });
    }

    public IActionResult OnPostToggleBlock(string mac, string deviceId)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        _deviceService.ToggleBlock(mac, deviceId);
        return RedirectToPage(new { Search, Page });
    }

    public IActionResult OnPostDelete(string mac, string deviceId)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        _deviceService.Delete(mac, deviceId);
        return RedirectToPage(new { Search, Page });
    }

}
