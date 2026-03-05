# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# Copy everything and restore
COPY . .
RUN dotnet restore

# Build and publish
RUN dotnet publish -c Release -o /app

# Final Stage (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

# Render uses port 8080 by default for some plans, 
# but we can force it to 80 or 5211. Let's use 8080 for Render.
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Cinemac.Api.dll"]