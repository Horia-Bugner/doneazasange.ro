$ErrorActionPreference = 'Stop'
$siteRoot = if (Test-Path (Join-Path $PSScriptRoot 'index.html')) { $PSScriptRoot } else { Join-Path $PSScriptRoot 'outputs\doneazasange-site' }
$assetsRoot = Join-Path $siteRoot 'assets'
$heroRoot = Join-Path $assetsRoot 'hero-pool'
$galleryRoot = Join-Path $assetsRoot 'gallery-pool'
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.avif')

New-Item -ItemType Directory -Force -Path $heroRoot | Out-Null
$periods = @('1996-2000', '2001-2004', '2005-2009', '2010-2014', '2015-2019', '2020-prezent')
foreach ($period in $periods) {
    New-Item -ItemType Directory -Force -Path (Join-Path $galleryRoot $period) | Out-Null
}

function Get-PoolFiles([string]$folder, [string]$webPrefix) {
    @(Get-ChildItem -LiteralPath $folder -File | Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } | Sort-Object Name | ForEach-Object {
        [ordered]@{
            src = "$webPrefix/$($_.Name)"
            alt = [System.IO.Path]::GetFileNameWithoutExtension($_.Name).Replace('-', ' ').Replace('_', ' ')
            active = $true
        }
    })
}

$pools = [ordered]@{
    hero = @(Get-PoolFiles $heroRoot 'assets/hero-pool')
    gallery = [ordered]@{}
}
foreach ($period in $periods) {
    $pools.gallery[$period] = @(Get-PoolFiles (Join-Path $galleryRoot $period) "assets/gallery-pool/$period")
}

$json = $pools | ConvertTo-Json -Depth 8 -Compress
$content = "window.FDBS_IMAGE_POOLS=$json;`r`n"
Set-Content -LiteralPath (Join-Path $siteRoot 'image-pools.js') -Value $content -Encoding utf8
$indexPath = Join-Path $siteRoot 'index.html'
if (Test-Path -LiteralPath $indexPath) {
    $index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
    $version = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $index = [regex]::Replace($index, 'image-pools\.js\?v=[^"'']+', "image-pools.js?v=$version")
    [System.IO.File]::WriteAllText($indexPath, $index, [System.Text.UTF8Encoding]::new($false))
}
Write-Host "Image pools refreshed. Hero images: $($pools.hero.Count)."
$routeGenerator = Join-Path $siteRoot 'generate-real-routes.ps1'
if (Test-Path -LiteralPath $routeGenerator) { & $routeGenerator -SiteRoot $siteRoot }
