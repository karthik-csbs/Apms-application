# Create directory structure
$basePath = "c:\PEC College\PEC - APMS\apms-frontend\src"

$directories = @(
    "api",
    "services", 
    "auth",
    "components",
    "pages",
    "layouts",
    "routes",
    "context",
    "hooks",
    "utils",
    "theme"
)

foreach ($dir in $directories) {
    $path = Join-Path $basePath $dir
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "Created: $dir"
    }
}

Write-Host "Directory structure created successfully!"
