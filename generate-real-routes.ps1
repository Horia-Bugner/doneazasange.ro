param(
  [Parameter(Mandatory=$true)][string]$SiteRoot
)

$ErrorActionPreference = 'Stop'
$indexPath = Join-Path $SiteRoot 'index.html'
$dataPath = Join-Path $SiteRoot 'data.js'
$index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8
$data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8

$routeMap = [ordered]@{
  '#/' = '/'
  '#/pot-sa-donez' = '/pot-sa-donez/'
  '#/cum-donez' = '/cum-donez/'
  '#/centre' = '/centre/'
  '#/faq' = '/intrebari-frecvente/'
  '#/acum' = '/proiecte-actuale/'
  '#/criterii' = '/criterii-eligibilitate/'
  '#/donorium' = '/donorium/'
  '#/galerie' = '/galerie/'
  '#/istoric' = '/despre-noi/'
  '#/implica-te' = '/implica-te/'
  '#/confidentialitate' = '/confidentialitate/'
}

foreach ($old in ($routeMap.Keys | Sort-Object Length -Descending)) {
  $index = $index.Replace(('href="' + $old + '"'), ('href="' + $routeMap[$old] + '"'))
}
$index = $index.Replace('app.js?v=1787045544','app.js?v=20260818-14').Replace('app.js?v=20260818-7','app.js?v=20260818-14').Replace('app.js?v=20260818-8','app.js?v=20260818-14').Replace('app.js?v=20260818-9','app.js?v=20260818-14').Replace('app.js?v=20260818-10','app.js?v=20260818-14').Replace('app.js?v=20260818-11','app.js?v=20260818-14').Replace('app.js?v=20260818-12','app.js?v=20260818-14').Replace('app.js?v=20260818-13','app.js?v=20260818-14')
$index = $index.Replace('styles.css?v=20260817-3','styles.css?v=20260818-city3').Replace('styles.css?v=20260818-gallery1','styles.css?v=20260818-city3').Replace('styles.css?v=20260818-city1','styles.css?v=20260818-city3').Replace('styles.css?v=20260818-city2','styles.css?v=20260818-city3')
Set-Content -LiteralPath $indexPath -Value $index -Encoding UTF8

function ConvertTo-Slug([string]$value) {
  $normalized = $value.Normalize([Text.NormalizationForm]::FormD)
  $ascii = -join ($normalized.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  return (($ascii.ToLowerInvariant() -replace '[^a-z0-9]+','-').Trim('-'))
}

$cities = [regex]::Matches($data, "\['[^']*','([^']*)','[^']*','[-0-9.]+','[-0-9.]+'").Groups | Where-Object Name -eq '1' | ForEach-Object Value | Sort-Object -Unique
$pages = @(
  @{ Url='/pot-sa-donez/'; Title='Pot să donez? — FDBS'; Description='Criterii generale de eligibilitate pentru donarea de sânge.' },
  @{ Url='/cum-donez/'; Title='Cum donez? — FDBS'; Description='Pregătirea și etapele donării de sânge.' },
  @{ Url='/centre/'; Title='Unde pot dona sânge? — FDBS'; Description='Harta centrelor de transfuzie și a punctelor de colectă din România.' },
  @{ Url='/intrebari-frecvente/'; Title='Întrebări frecvente despre donarea de sânge — FDBS'; Description='Răspunsuri pentru donatori despre eligibilitate, pregătire, donare și beneficii.' },
  @{ Url='/proiecte-actuale/'; Title='Proiecte actuale — FDBS'; Description='Proiectele actuale ale Fundației Donatorilor Benevoli de Sânge.' },
  @{ Url='/criterii-eligibilitate/'; Title='Actualizarea criteriilor de eligibilitate — FDBS'; Description='Proiectul FDBS pentru criterii de eligibilitate bazate pe dovezi actuale.' },
  @{ Url='/donorium/'; Title='Donorium — FDBS'; Description='Platforma Donorium și comunitatea donatorilor de sânge.' },
  @{ Url='/galerie/'; Title='Galerie — FDBS'; Description='Imagini din istoria și proiectele FDBS.' },
  @{ Url='/despre-noi/'; Title='Despre FDBS'; Description='Istoria Fundației Donatorilor Benevoli de Sânge.' },
  @{ Url='/implica-te/'; Title='Implică-te — FDBS'; Description='Organizează o donare, devino voluntar sau sprijină FDBS.' },
  @{ Url='/confidentialitate/'; Title='Confidențialitate și cookies — FDBS'; Description='Politica de confidențialitate și preferințele cookies.' }
)
foreach ($city in $cities) {
  $slug = ConvertTo-Slug $city
  $pages += @{ Url="/centre/$slug/"; Title="Donare de sânge în $city — FDBS"; Description="Adresă, program și indicații pentru donarea de sânge în $city." }
}

foreach ($page in $pages) {
  $relative = $page.Url.Trim('/') -replace '/', [IO.Path]::DirectorySeparatorChar
  $directory = Join-Path $SiteRoot $relative
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
  $depth = ($page.Url.Trim('/').Split('/').Count)
  $prefix = '../' * $depth
  $html = $index
  $html = $html.Replace('<head>', "<head>`r`n  <base href=`"$prefix`" />")
  $html = [regex]::Replace($html, '<title>.*?</title>', '<title>' + [Security.SecurityElement]::Escape($page.Title) + '</title>', 1)
  $html = [regex]::Replace($html, '<meta name="description" content="[^"]*" />', '<meta name="description" content="' + [Security.SecurityElement]::Escape($page.Description) + '" />', 1)
  $html = [regex]::Replace($html, '<link rel="canonical" href="[^"]+" />', '<link rel="canonical" href="https://doneazasange.ro' + $page.Url + '" />', 1)
  $html = $html.Replace('<body>', '<body>' + "`r`n  <script>window.FDBS_ROOT_PREFIX='$prefix';</script>")
  Set-Content -LiteralPath (Join-Path $directory 'index.html') -Value $html -Encoding UTF8
}

$urls = @('https://doneazasange.ro/') + ($pages | ForEach-Object { 'https://doneazasange.ro' + $_.Url })
$lastmod = Get-Date -Format 'yyyy-MM-dd'
$nodes = $urls | ForEach-Object { "  <url><loc>$([Security.SecurityElement]::Escape($_))</loc><lastmod>$lastmod</lastmod></url>" }
$sitemap = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`r`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`r`n$($nodes -join "`r`n")`r`n</urlset>`r`n"
Set-Content -LiteralPath (Join-Path $SiteRoot 'sitemap.xml') -Value $sitemap -Encoding UTF8
Set-Content -LiteralPath (Join-Path $SiteRoot 'robots.txt') -Value "User-agent: *`r`nAllow: /`r`nSitemap: https://doneazasange.ro/sitemap.xml`r`n" -Encoding UTF8

Write-Host "Generated $($pages.Count) indexable route pages, including $($cities.Count) city pages."
