using System;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HorseRacing.Services;

public class CloudinaryOptions
{
    public string CloudName { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public string ApiSecret { get; set; } = "";
}

public interface ICloudStorageService
{
    Task<string> UploadAsync(IFormFile file, string folder = "general");
    Task<bool> DeleteAsync(string publicId);
}

public class CloudinaryStorageService : ICloudStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryStorageService> _logger;

    public CloudinaryStorageService(IOptions<CloudinaryOptions> options, ILogger<CloudinaryStorageService> logger)
    {
        var acc = new Account(options.Value.CloudName, options.Value.ApiKey, options.Value.ApiSecret);
        _cloudinary = new Cloudinary(acc);
        _cloudinary.Api.Secure = true;
        _logger = logger;
    }

    public async Task<string> UploadAsync(IFormFile file, string folder = "general")
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty.");

        var validTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf" };
        if (Array.IndexOf(validTypes, file.ContentType.ToLower()) < 0)
            throw new ArgumentException($"Unsupported file type: {file.ContentType}");

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"racemaster/{folder}",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto"),
            Overwrite = true,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
            throw new Exception($"Upload failed: {result.Error.Message}");
        }

        _logger.LogInformation("Uploaded to Cloudinary: {Url}", result.SecureUrl);
        return result.SecureUrl?.AbsoluteUri ?? result.Url?.AbsoluteUri ?? "";
    }

    public async Task<bool> DeleteAsync(string publicId)
    {
        try
        {
            var result = await _cloudinary.DeleteResourcesAsync(publicId);
            return result.Deleted?.Count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Cloudinary delete failed: {Error}", ex.Message);
            return false;
        }
    }
}
