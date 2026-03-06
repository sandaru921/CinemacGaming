using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Cinemac.Api.Services
{
    public interface IImageService
    {
        Task<string?> UploadImageAsync(IFormFile file);
    }
}
