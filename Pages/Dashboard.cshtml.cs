using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class DashboardModel : PageModel
{
    private readonly DeviceService _deviceService;

    public int TotalDevices       { get; set; }
    public int ActiveToday        { get; set; }
    public int ActiveThisWeek     { get; set; }
    public int TrialDevices       { get; set; }
    public int ExpiringSoon       { get; set; }  // expires in <= 3 days
    public int ExpiredDevices     { get; set; }
    public int BlockedDevices     { get; set; }
    public int UnlimitedDevices   { get; set; }

    // Last 10 recently seen devices
    public List<RecentDevice> RecentDevices { get; set; } = new();

    public DashboardModel(DeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    public IActionResult OnGet()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        var all = _deviceService.GetAll();
        var now = DateTime.UtcNow;

        TotalDevices     = all.Count;
        ActiveToday      = all.Count(d => d.LastSeen.HasValue && (now - d.LastSeen.Value).TotalHours < 24);
        ActiveThisWeek   = all.Count(d => d.LastSeen.HasValue && (now - d.LastSeen.Value).TotalDays < 7);
        BlockedDevices   = all.Count(d => d.IsBlocked);
        ExpiredDevices   = all.Count(d => !d.IsBlocked && d.IsExpired);
        UnlimitedDevices = all.Count(d => !d.ExpiryDate.HasValue);
        ExpiringSoon     = all.Count(d => !d.IsBlocked && d.ExpiryDate.HasValue &&
                                          !d.IsExpired &&
                                          (d.ExpiryDate.Value - now).TotalDays <= 3);
        TrialDevices     = all.Count(d => d.TrialStartDate.HasValue &&
                                          d.ExpiryDate.HasValue &&
                                          (d.ExpiryDate.Value - d.TrialStartDate.Value).TotalDays <= 8 &&
                                          !d.IsExpired);

        RecentDevices = all
            .Where(d => d.LastSeen.HasValue)
            .OrderByDescending(d => d.LastSeen)
            .Take(10)
            .Select(d =>
            {
                var ago = now - d.LastSeen!.Value;
                return new RecentDevice
                {
                    Mac      = d.Mac,
                    DeviceId = d.DeviceId,
                    LastSeen = ago.TotalMinutes < 2  ? "Just now" :
                               ago.TotalMinutes < 60 ? $"{(int)ago.TotalMinutes}m ago" :
                               ago.TotalHours   < 24 ? $"{(int)ago.TotalHours}h ago" :
                                                        $"{(int)ago.TotalDays}d ago",
                    IsBlocked = d.IsBlocked,
                    IsExpired = d.IsExpired
                };
            }).ToList();

        return Page();
    }
}

public class RecentDevice
{
    public string Mac      { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public string LastSeen { get; set; } = "";
    public bool   IsBlocked { get; set; }
    public bool   IsExpired { get; set; }
}
