param([switch]$NoOpen)
$ErrorActionPreference = 'Stop'
$localWorkbook = Join-Path $PSScriptRoot 'FAQ-site.xlsx'
$siteRoot = if (Test-Path -LiteralPath $localWorkbook) { $PSScriptRoot } else { Join-Path $PSScriptRoot 'outputs\doneazasange-site' }
$updatedWorkbookPath = Join-Path $siteRoot 'FAQ-site-updated.xlsx'
$workbookPath = if (Test-Path -LiteralPath $updatedWorkbookPath) { $updatedWorkbookPath } else { Join-Path $siteRoot 'FAQ-site.xlsx' }
$outputPath = Join-Path $siteRoot 'faq-data.js'

if (-not (Test-Path -LiteralPath $workbookPath)) {
    throw "No FAQ workbook was found beside this refresh file."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("fdbs-faq-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temporary | Out-Null

try {
    [System.IO.Compression.ZipFile]::ExtractToDirectory($workbookPath, $temporary)
    $shared = @()
    $sharedPath = Join-Path $temporary 'xl\sharedStrings.xml'
    if (Test-Path -LiteralPath $sharedPath) {
        [xml]$sharedXml = [System.IO.File]::ReadAllText($sharedPath, [System.Text.Encoding]::UTF8)
        $shared = @($sharedXml.SelectNodes("//*[local-name()='si']") | ForEach-Object {
            ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }) -join ''
        })
    }

    $sheetPath = Join-Path $temporary 'xl\worksheets\sheet1.xml'
    [xml]$sheetXml = [System.IO.File]::ReadAllText($sheetPath, [System.Text.Encoding]::UTF8)
    $values = @{}
    foreach ($cell in $sheetXml.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']/*[local-name()='c']")) {
        $reference = $cell.r
        $type = $cell.t
        $valueNode = $cell.SelectSingleNode("./*[local-name()='v']")
        if ($type -eq 'inlineStr') {
            $value = ($cell.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }) -join ''
        } elseif ($type -eq 's' -and $null -ne $valueNode) {
            $value = $shared[[int]$valueNode.InnerText]
        } elseif ($null -ne $valueNode) {
            $value = $valueNode.InnerText
        } else {
            $value = ''
        }
        $values[$reference] = $value
    }

    $rowNumbers = @($sheetXml.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']") | ForEach-Object { [int]$_.r } | Where-Object { $_ -gt 1 } | Sort-Object)
    $faqs = @()
    foreach ($row in $rowNumbers) {
        $category = [string]$values["A$row"]
        $question = [string]$values["B$row"]
        $answer = [string]$values["C$row"]
        $keywords = [string]$values["D$row"]
        $orderRaw = [string]$values["E$row"]
        $activeRaw = ([string]$values["F$row"]).Trim().ToLowerInvariant()
        $relatedPage = ([string]$values["G$row"]).Trim()
        $active = $activeRaw -in @('1', 'true', 'da', 'yes', 'activ')
        if ($active -and $question.Trim() -and $answer.Trim()) {
            $order = if ($orderRaw -match '^-?\d+$') { [int]$orderRaw } else { $row - 2 }
            $faqs += [ordered]@{ id = $faqs.Count; category = $category; question = $question; answer = $answer; keywords = $keywords; order = $order; related_page = $relatedPage }
        }
    }
    $faqs = @($faqs | Sort-Object { $_.order }, { $_.question })
    $json = $faqs | ConvertTo-Json -Depth 5 -Compress
    [System.IO.File]::WriteAllText($outputPath, "window.FDBS_DATA.faqs=$json;`r`n", [System.Text.UTF8Encoding]::new($false))
    $indexPath = Join-Path $siteRoot 'index.html'
    $index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
    $safeJson = $json.Replace('<', '\u003c').Replace('>', '\u003e')
    $inlineFaq = "<script id=`"faq-inline-data`">window.FDBS_DATA.faqs=$safeJson;</script>"
    $index = [regex]::Replace($index, '<script id="faq-inline-data">.*?</script>', $inlineFaq, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $version = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $index = [regex]::Replace($index, 'data\.js\?v=[^"'']+', "data.js?v=$version")
    $index = [regex]::Replace($index, 'app\.js\?v=[^"'']+', "app.js?v=$version")
    [System.IO.File]::WriteAllText($indexPath, $index, [System.Text.UTF8Encoding]::new($false))
    foreach ($oldPreview in Get-ChildItem -LiteralPath $siteRoot -Filter 'faq-preview-*.html' -File) {
        [System.IO.File]::WriteAllText($oldPreview.FullName, $index, [System.Text.UTF8Encoding]::new($false))
    }
    $previewName = 'FAQ-LATEST.html'
    $previewPath = Join-Path $siteRoot $previewName
    $faqPreview = $index.Replace('<script src="app.js', '<script>if(!location.hash){location.hash="#/faq"}</script><script src="app.js')
    [System.IO.File]::WriteAllText($previewPath, $faqPreview, [System.Text.UTF8Encoding]::new($false))
    $projectIndex = Join-Path $PSScriptRoot 'index.html'
    if ($siteRoot -ne $PSScriptRoot -and (Test-Path -LiteralPath $projectIndex)) {
        [System.IO.File]::WriteAllText($projectIndex, $index, [System.Text.UTF8Encoding]::new($false))
    }
    Write-Host "FAQ refreshed. Active questions: $($faqs.Count)."
    Write-Host "Latest preview updated: $previewName"
    $routeGenerator = Join-Path $siteRoot 'generate-real-routes.ps1'
    if (Test-Path -LiteralPath $routeGenerator) { & $routeGenerator -SiteRoot $siteRoot }
    if (-not $NoOpen) {
        try {
            Start-Process -FilePath 'explorer.exe' -ArgumentList @($previewPath)
        } catch {
            Write-Warning "The FAQ was refreshed, but Windows could not open the preview automatically. Open FAQ-LATEST.html manually."
        }
    }
} finally {
    if ([System.IO.Directory]::Exists($temporary)) { [System.IO.Directory]::Delete($temporary, $true) }
}
