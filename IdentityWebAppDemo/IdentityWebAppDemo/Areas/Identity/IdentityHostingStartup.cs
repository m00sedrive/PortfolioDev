using System;
using IdentityWebAppDemo.Areas.Identity.Data;
using IdentityWebAppDemo.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: HostingStartup(typeof(IdentityWebAppDemo.Areas.Identity.IdentityHostingStartup))]
namespace IdentityWebAppDemo.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
                services.AddDbContext<IdentityWebAppDemoContext>(options =>
                    options.UseSqlServer(
                        context.Configuration.GetConnectionString("IdentityWebAppDemoContextConnection")));

                services.AddDefaultIdentity<IdentityWebAppDemoUser>()
                    .AddEntityFrameworkStores<IdentityWebAppDemoContext>();
            });
        }
    }
}