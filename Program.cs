using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using ApexPlayerPanel.Services;

var builder = WebApplication.CreateBuilder(args);

// Production: bind to 0.0.0.0 and use PORT from env (Fly.io, Railway, etc.)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddRazorPages();
builder.Services.AddControllers();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(8);
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});
builder.Services.AddScoped<ApexPlayerPanel.Services.UserService>();
builder.Services.AddScoped<ApexPlayerPanel.Services.DeviceService>();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

// Trust proxy headers (Fly.io, etc.)
app.UseForwardedHeaders();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}
app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    var requiresAuth = path.Equals("/", StringComparison.OrdinalIgnoreCase)
                       || path.Equals("/Index", StringComparison.OrdinalIgnoreCase)
                       || path.StartsWith("/Index/", StringComparison.OrdinalIgnoreCase)
                       || path.Equals("/Dashboard", StringComparison.OrdinalIgnoreCase)
                       || path.StartsWith("/Dashboard/", StringComparison.OrdinalIgnoreCase)
                       || path.Equals("/Settings", StringComparison.OrdinalIgnoreCase)
                       || path.StartsWith("/Settings/", StringComparison.OrdinalIgnoreCase)
                       || path.Equals("/DeviceDetail", StringComparison.OrdinalIgnoreCase)
                       || path.StartsWith("/DeviceDetail/", StringComparison.OrdinalIgnoreCase);

    if (!requiresAuth)
    {
        await next();
        return;
    }

    var isLoggedIn = context.Session.GetString("StaffLoggedIn") == "1";
    if (!isLoggedIn)
    {
        context.Response.Redirect("/Login");
        return;
    }

    var userService = context.RequestServices.GetRequiredService<UserService>();
    var sessionVersion = context.Session.GetString("StaffAuthVersion");
    var currentVersion = userService.GetAuthVersion();
    if (string.IsNullOrWhiteSpace(sessionVersion) || !string.Equals(sessionVersion, currentVersion, StringComparison.Ordinal))
    {
        context.Session.Clear();
        context.Response.Redirect("/Login?msg=Session expired. Please sign in again.");
        return;
    }

    await next();
});
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

// Ensure Data folder and default users exist (for first deploy / fresh volume)
try
{
    var env = app.Services.GetRequiredService<IWebHostEnvironment>();
    var dataPath = Path.Combine(env.ContentRootPath, "Data");
    Directory.CreateDirectory(dataPath);
    var usersPath = Path.Combine(dataPath, "users.json");
    if (!File.Exists(usersPath))
        File.WriteAllText(usersPath, "[{\"Username\":\"admin\",\"Password\":\"admin123\"}]");
    var devicesPath = Path.Combine(dataPath, "devices.json");
    if (!File.Exists(devicesPath))
        File.WriteAllText(devicesPath, "[]");
}
catch { }

app.Run();
