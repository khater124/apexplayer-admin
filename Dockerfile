# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ApexPlayerPanel.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create Data directory for persistence (volume will mount here)
RUN mkdir -p /app/Data

# Copy published app
COPY --from=build /app/publish .

# Fly.io uses PORT env var
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "ApexPlayerPanel.dll"]
