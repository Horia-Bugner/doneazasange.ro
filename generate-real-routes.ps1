param(
  [Parameter(Mandatory=$true)][string]$SiteRoot
)

$ErrorActionPreference = 'Stop'
$indexPath = Join-Path $SiteRoot 'index.html'
$dataPath = Join-Path $SiteRoot 'data.js'
$index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8
$data = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8

$routeMap = [ordered]@{
  '#/implica-te/sprijina-ne-financiar/redirectioneaza-3-5' = '/implica-te/sprijina-ne-financiar/redirectioneaza-3-5/'
  '#/' = '/'
  '#/pot-sa-donez' = '/pot-sa-donez/'
  '#/cum-donez' = '/cum-donez/'
  '#/centre' = '/centre/'
  '#/faq' = '/intrebari-frecvente/'
  '#/ghidul-donatorului' = '/ghidul-donatorului/'
  '#/legislatie' = '/legislatie/'
  '#/articole' = '/articole/'
  '#/acum' = '/proiecte-actuale/'
  '#/criterii' = '/criterii-eligibilitate/'
  '#/donorium' = '/donorium/'
  '#/galerie' = '/galerie/'
  '#/istoric' = '/despre-noi/'
  '#/implica-te' = '/implica-te/'
  '#/implica-te/organizeaza-o-donare' = '/implica-te/organizeaza-o-donare/'
  '#/implica-te/devino-voluntar' = '/implica-te/devino-voluntar/'
  '#/implica-te/sprijina-ne-financiar' = '/implica-te/sprijina-ne-financiar/'
  '#/contact' = '/contact/'
  '#/confidentialitate' = '/confidentialitate/'
}

foreach ($old in ($routeMap.Keys | Sort-Object Length -Descending)) {
  $index = $index.Replace(('href="' + $old + '"'), ('href="' + $routeMap[$old] + '"'))
}
$index = $index -replace "app\.js\?v=[^`"']+", 'app.js?v=20260908-avocatoo'
$index = $index.Replace('<script src="data.js?v=20260908-floreasca-position3"></script>','<script src="data.js?v=20260908-floreasca-position3"></script>').Replace('<script src="data.js?v=20260908-floreasca-position3"></script>','<script src="data.js?v=20260908-floreasca-position3"></script>').Replace('<script src="data.js?v=20260908-floreasca-position3"></script>','<script src="data.js?v=20260908-floreasca-position3"></script>').Replace('<script src="data.js?v=20260908-floreasca-position3"></script>','<script src="data.js?v=20260908-floreasca-position3"></script>').Replace('<script src="data.js?v=20260908-floreasca-position3"></script>','<script src="data.js?v=20260908-floreasca-position3"></script>')
$index = $index.Replace('bucharest-map-data.js?v=20260907-mehedinti1','bucharest-map-data.js?v=20260907-mehedinti1').Replace('county-data.js?v=20260907-mehedinti1','county-data.js?v=20260907-mehedinti1')
$index = $index -replace "styles\.css\?v=[^`"']+", 'styles.css?v=20260908-how-step-photos'
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
  @{ Url='/ghidul-donatorului/'; Title='Ghidul Donatorului — FDBS'; Description='Informații esențiale pentru pregătirea și etapele donării de sânge.' },
  @{ Url='/legislatie/'; Title='Legislație — FDBS'; Description='Acte normative relevante pentru donarea de sânge și activitatea de transfuzie sanguină din România.' },
  @{ Url='/articole/'; Title='Articole — FDBS'; Description='Informații și explicații despre donarea de sânge și activitatea FDBS.' },
  @{ Url='/proiecte-actuale/'; Title='Proiecte actuale — FDBS'; Description='Proiectele actuale ale Fundației Donatorilor Benevoli de Sânge.' },
  @{ Url='/criterii-eligibilitate/'; Title='Actualizarea criteriilor de eligibilitate — FDBS'; Description='Proiectul FDBS pentru criterii de eligibilitate bazate pe dovezi actuale.' },
  @{ Url='/donorium/'; Title='Donorium — FDBS'; Description='Platforma Donorium și comunitatea donatorilor de sânge.' },
  @{ Url='/galerie/'; Title='Galerie — FDBS'; Description='Imagini din istoria și proiectele FDBS.' },
  @{ Url='/despre-noi/'; Title='Despre FDBS'; Description='Istoria Fundației Donatorilor Benevoli de Sânge.' },
  @{ Url='/implica-te/'; Title='Implică-te — FDBS'; Description='Organizează o donare, devino voluntar sau sprijină FDBS.' },
  @{ Url='/implica-te/organizeaza-o-donare/'; Title='Organizează o donare — FDBS'; Description='Pașii pentru organizarea unei colecte de sânge împreună cu centrul local de transfuzie.' },
  @{ Url='/implica-te/devino-voluntar/'; Title='Devino voluntar — FDBS'; Description='Modalități prin care te poți implica voluntar în activitatea și campaniile FDBS.' },
  @{ Url='/implica-te/sprijina-ne-financiar/redirectioneaza-3-5/'; Title='Redirecționează 3,5% — FDBS'; Description='Susține FDBS prin redirecționarea a 3,5% din impozitul pe venit.' },
  @{ Url='/implica-te/sprijina-ne-financiar/'; Title='Sprijină-ne financiar — FDBS'; Description='Modalități de susținere a proiectelor FDBS prin redirecționare, sponsorizare sau donație.' },
  @{ Url='/contact/'; Title='Contact — FDBS'; Description='Trimite un mesaj sau contactează conducerea Fundației Donatorilor Benevoli de Sânge.' },
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
