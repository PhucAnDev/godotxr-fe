$projectRoot = "d:\do an\FE\godotxr-fe"
$outputFile = "d:\do an\FE\godotxr-fe\fe_project_codebase.md"
$extensions = @(".cs", ".tsx", ".json", ".ts", ".css", ".html", ".js", ".jsx")

# Ensure output directory exists and file is cleared
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

$files = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\\.git\\' -and
    $_.FullName -notmatch '\\\.tmp\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\build\\' -and
    $extensions -contains $_.Extension
}

"# Frontend Project Source Code`n`n" | Out-File -FilePath $outputFile -Encoding utf8

foreach ($file in $files) {
    # Compute relative path compatibly with PS 5.1
    $relativePath = $file.FullName.Substring($projectRoot.Length).TrimStart("\")
    $relativePath = $relativePath -replace '\\', '/'
    
    # Determine language for markdown code block
    $lang = "text"
    switch ($file.Extension) {
        ".tsx" { $lang = "tsx" }
        ".ts"  { $lang = "typescript" }
        ".json" { $lang = "json" }
        ".cs"   { $lang = "csharp" }
        ".css"  { $lang = "css" }
        ".html" { $lang = "html" }
        ".js"   { $lang = "javascript" }
        ".jsx"  { $lang = "jsx" }
    }
    
    Write-Host "Merging: $relativePath"
    
    "## File: $relativePath`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "````$lang" | Out-File -FilePath $outputFile -Append -Encoding utf8
    
    # Read file content with UTF-8 encoding
    $content = Get-Content -Path $file.FullName -Encoding utf8 -Raw
    if ($content) {
        $content | Out-File -FilePath $outputFile -Append -Encoding utf8
    }
    
    "`````n`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
}

Write-Host "Done! Output saved to $outputFile"
