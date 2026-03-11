using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ApexPlayerPanel.Services;

namespace ApexPlayerPanel.Pages;

public class LoginModel : PageModel
{
    private readonly UserService _userService;

    [BindProperty]
    public string Username { get; set; } = "";

    [BindProperty]
    public string Password { get; set; } = "";

    public string? ErrorMessage { get; set; }
    public string? SuccessMessage { get; set; }

    public LoginModel(UserService userService)
    {
        _userService = userService;
    }

    public IActionResult OnGet(string? msg)
    {
        if (HttpContext.Session.GetString("StaffLoggedIn") == "1")
            return RedirectToPage("/Index");
        SuccessMessage = msg;
        return Page();
    }

    public IActionResult OnPost()
    {
        if (_userService.Validate(Username, Password))
        {
            HttpContext.Session.SetString("StaffLoggedIn", "1");
            HttpContext.Session.SetString("StaffUsername", Username);
            return RedirectToPage("/Index");
        }
        ErrorMessage = "Invalid username or password.";
        return Page();
    }

    public IActionResult OnPostLogout()
    {
        HttpContext.Session.Clear();
        return RedirectToPage("/Login");
    }
}
