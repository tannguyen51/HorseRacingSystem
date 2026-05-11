using HorseRacing.Dtos;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

public class ServiceResult<T>
{
    public int StatusCode { get; }
    public ApiResult<T> Result { get; }

    private ServiceResult(int statusCode, ApiResult<T> result)
    {
        StatusCode = statusCode;
        Result = result;
    }

    public static ServiceResult<T> Ok(T data)
    {
        return new ServiceResult<T>(StatusCodes.Status200OK, ApiResult<T>.Ok(data));
    }

    public static ServiceResult<T> Fail(int statusCode, string message)
    {
        return new ServiceResult<T>(statusCode, ApiResult<T>.Fail(message));
    }
}
