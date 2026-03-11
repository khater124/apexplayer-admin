using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class SettingsModel : PageModel
{
    private readonly UserService _userService;

    [BindProperty] public string CurrentUsername { get; set; } = "";
    [BindProperty] public string CurrentPassword { get; set; } = "";
    [BindProperty] public string NewUsername { get; set; } = "";
    [BindProperty] public string NewPassword { get; set; } = "";
    [BindProperty] public string ConfirmPassword { get; set; } = "";

    public string? SuccessMessage { get; set; }
    public string? ErrorMessage { get; set; }

    public SettingsModel(UserService userService) => _userService = userService;

    public IActionResult OnGet()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");
        return Page();
    }

    public IActionResult OnPost()
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") != "1")
            return RedirectToPage("/Login");

        if (NewPassword != ConfirmPassword)
        {
            ErrorMessage = "New passwords do not match.";
            return Page();
        }

        if (string.IsNullOrWhiteSpace(NewUsername) || string.IsNullOrWhiteSpace(NewPassword))
        {
            ErrorMessage = "New username and password cannot be empty.";
            return Page();
        }

        bool ok = _userService.UpdateCredentials(CurrentUsername, CurrentPassword, NewUsername, NewPassword);
        if (!ok)
        {
            ErrorMessage = "Current username or password is incorrect.";
            return Page();
        }

        HttpContext.Session.Clear();
        return RedirectToPage("/Login", new { msg = "Credentials updated. Please sign in again on this device." });
    }
}
