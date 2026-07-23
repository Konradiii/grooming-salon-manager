FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY GroomingSalonApi.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
USER root
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "GroomingSalonApi.dll"]

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
# Most PaaS hosts (Railway, Render, ...) inject a dynamic $PORT at runtime;
# fall back to 8080 for hosts that don't.
ENTRYPOINT ["sh", "-c", "dotnet GroomingSalonApi.dll --urls http://+:${PORT:-8080}"]
