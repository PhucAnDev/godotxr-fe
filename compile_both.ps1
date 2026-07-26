# Files
$mdPath = "c:\Users\phuca\Downloads\Report3_Software Requirement Specification.docx (1).md"
$docxPaths = @(
    "c:\Users\phuca\Downloads\Report3_Software Requirement Specification (1).docx",
    "c:\Users\phuca\Downloads\Report3_Software Requirement Specification.docx"
)

# Parse the Markdown file to get the content of Section 3.2 with UTF8 encoding
if (!(Test-Path $mdPath)) {
    Write-Host "Error: MD file not found at $mdPath"
    exit 1
}

$mdLines = Get-Content $mdPath -Encoding UTF8
$section32Lines = New-Object System.Collections.Generic.List[string]
$inSection = $false

foreach ($line in $mdLines) {
    if ($line -like "### **3.2 Web Application*") {
        $inSection = $true
        # Skip the heading itself, as we will update it in-place in docx
        continue
    }
    if ($inSection) {
        if ($line -like "### **3.3*") {
            # End of section 3.2
            break
        }
        $section32Lines.Add($line)
    }
}

Write-Host "Parsed $($section32Lines.Count) lines of section 3.2 from Markdown file."

# Open Docx and read word/document.xml
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

foreach ($docxPath in $docxPaths) {
    Write-Host "`nProcessing file: $docxPath"
    if (!(Test-Path $docxPath)) {
        Write-Host "File not found, skipping."
        continue
    }

    try {
        $zip = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Update)
    } catch {
        Write-Host "------------------------------------------------------------------"
        Write-Host "ERROR: The file $docxPath is locked."
        Write-Host "Please SAVE and CLOSE your Microsoft Word application for this file."
        Write-Host "------------------------------------------------------------------"
        continue
    }

    $entry = $zip.GetEntry("word/document.xml")
    if ($entry -eq $null) {
        Write-Host "Error: word/document.xml not found."
        $zip.Dispose()
        continue
    }

    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $xmlContent = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()

    # Load XML
    [xml]$xml = $xmlContent
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

    # Find paragraph containing "3.2 <<Feature Name 1>>" or already renamed "3.2 Web Application"
    $paragraphs = $xml.SelectNodes("//w:p", $ns)
    $startP = $null
    $startIdx = -1
    for ($i = 0; $i -lt $paragraphs.Count; $i++) {
        $text = $paragraphs[$i].InnerText
        if ($text -eq "3.2 <<Feature Name 1>>" -or $text -eq "3.2 Web Application") {
            $startP = $paragraphs[$i]
            $startIdx = $i
            break
        }
    }

    if ($startP -eq $null) {
        Write-Host "Error: Could not find 3.2 heading in docx."
        $zip.Dispose()
        continue
    }

    Write-Host "Found heading paragraph at index $($startIdx) : $($startP.InnerText)"

    # Update heading text to "3.2 Web Application" if needed
    $tNodes = $startP.SelectNodes(".//w:t", $ns)
    if ($tNodes.Count -gt 0) {
        $tNodes[0].InnerText = "3.2 Web Application"
        for ($k = 1; $k -lt $tNodes.Count; $k++) {
            $tNodes[$k].InnerText = ""
        }
    }

    $parent = $startP.ParentNode
    $siblings = $parent.ChildNodes
    $sibIdx = [array]::IndexOf($siblings, $startP)

    # Find where the next section starts (3.3 <<Feature Name 2>>)
    $endIdx = -1
    for ($k = $sibIdx + 1; $k -lt $siblings.Count; $k++) {
        $text = $siblings[$k].InnerText
        if ($text -like "*3.3*" -or $text -like "*Feature Name 2*" -or $text -like "*4.*Non-Functional*") {
            $endIdx = $k
            break
        }
    }

    if ($endIdx -eq -1) {
        Write-Host "Error: Could not find next section boundary."
        $zip.Dispose()
        continue
    }

    Write-Host "Replacing elements from sibling index $($sibIdx + 1) to $($endIdx - 1) (total $($endIdx - $sibIdx - 1) nodes)."

    # Delete sibling elements between startIdx and endIdx
    for ($m = $endIdx - 1; $m -gt $sibIdx; $m--) {
        $parent.RemoveChild($siblings[$m]) | Out-Null
    }

    # Find templates for styling
    # Template Heading 4: We can look for paragraph containing "3.1.4"
    $heading4Template = $null
    foreach ($p in $paragraphs) {
        if ($p.InnerText -like "*3.1.4*") {
            $heading4Template = $p
            break
        }
    }

    # Template Normal: We can use any paragraph after 3.1.4 table or just clone a standard paragraph
    $normalTemplate = $null
    foreach ($p in $paragraphs) {
        if ($p.InnerText -like "*Checks email and password*") {
            $normalTemplate = $p
            break
        }
    }

    if ($normalTemplate -eq $null) {
        $normalTemplate = $paragraphs[$paragraphs.Count - 1]
    }

    # Helper to create styled paragraph
    function Create-Paragraph($text, $styleType) {
        $newP = $null
        
        if ($styleType -eq "Heading4" -and $heading4Template -ne $null) {
            $newP = $heading4Template.CloneNode($true)
            $pPr = $newP.SelectSingleNode("w:pPr", $ns)
            $newP.RemoveAll()
            if ($pPr -ne $null) {
                $newP.AppendChild($pPr) | Out-Null
            }
        } elseif ($styleType -eq "Heading5" -and $heading4Template -ne $null) {
            $newP = $heading4Template.CloneNode($true)
            $pPr = $newP.SelectSingleNode("w:pPr", $ns)
            $newP.RemoveAll()
            if ($pPr -ne $null) {
                $newP.AppendChild($pPr) | Out-Null
                $pStyle = $pPr.SelectSingleNode("w:pStyle", $ns)
                if ($pStyle -ne $null) {
                    $pStyle.SetAttribute("w:val", "Heading5")
                }
            }
        } elseif ($styleType -eq "Heading6" -and $heading4Template -ne $null) {
            $newP = $heading4Template.CloneNode($true)
            $pPr = $newP.SelectSingleNode("w:pPr", $ns)
            $newP.RemoveAll()
            if ($pPr -ne $null) {
                $newP.AppendChild($pPr) | Out-Null
                $pStyle = $pPr.SelectSingleNode("w:pStyle", $ns)
                if ($pStyle -ne $null) {
                    $pStyle.SetAttribute("w:val", "Heading6")
                }
            }
        } else {
            $newP = $normalTemplate.CloneNode($true)
            $pPr = $newP.SelectSingleNode("w:pPr", $ns)
            $newP.RemoveAll()
            if ($pPr -ne $null) {
                $newP.AppendChild($pPr) | Out-Null
            }
        }
        
        # Process text splits for bold
        $isList = $false
        # If line starts with indent spaces and then number, or just starts with bullet/number
        $cleanLineText = $text
        
        # Support markdown lists like "  1. Form input fields." or "* 1. Form input fields."
        # If it's a list item, we might have standard bullet or list numbers
        if ($cleanLineText.Trim().StartsWith("* ")) {
            $cleanLineText = $cleanLineText.Trim().Substring(2)
        }
        
        # We check if it starts with "1. ", "2. ", etc. (for numbered lists under Interface)
        $isNumberedList = $false
        $trimmedText = $cleanLineText.Trim()
        if ($trimmedText -match '^\d+\.\s(.*)') {
            $isNumberedList = $true
            # Do not strip number prefix as we want to write it explicitly as plain text in the run: e.g. "1. Form input fields"
        }
        
        $parts = $cleanLineText.Split(@("**"), [System.StringSplitOptions]::None)
        for ($i = 0; $i -lt $parts.Length; $i++) {
            $pText = $parts[$i]
            if ($pText -eq "") { continue }
            
            $r = $xml.CreateElement("w", "r", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
            
            if ($i % 2 -eq 1) {
                $rPr = $xml.CreateElement("w", "rPr", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
                $b = $xml.CreateElement("w", "b", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
                $rPr.AppendChild($b) | Out-Null
                $r.AppendChild($rPr) | Out-Null
            }
            
            $t = $xml.CreateElement("w", "t", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
            $t.InnerText = $pText
            $r.AppendChild($t) | Out-Null
            $newP.AppendChild($r) | Out-Null
        }
        
        # Indent the paragraph if it is a list item
        if ($isNumberedList -or $text.Trim().StartsWith("•") -or $text.Trim().StartsWith("-") -or $text.Trim().StartsWith("*")) {
            $pPr = $newP.SelectSingleNode("w:pPr", $ns)
            if ($pPr -eq $null) {
                $pPr = $xml.CreateElement("w", "pPr", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
                $newP.PrependChild($pPr) | Out-Null
            }
            # Add w:ind element for indentation
            $ind = $xml.CreateElement("w", "ind", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
            $ind.SetAttribute("w:left", "720") # Standard indentation in dxa (1/2 inch)
            $pPr.AppendChild($ind) | Out-Null
        }
        
        return $newP
    }

    # Insert new paragraphs sequentially
    $currentInsertIndex = $sibIdx + 1

    foreach ($line in $section32Lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "") { continue }
        
        $p = $null
        if ($trimmed -like "#### ***3.2.*") {
            $title = $trimmed.Replace("#### ***", "").Replace("***", "").Trim()
            $p = Create-Paragraph $title "Heading4"
        } elseif ($trimmed -like "##### **3.2.*") {
            $title = $trimmed.Replace("##### **", "").Replace("**", "").Trim()
            $p = Create-Paragraph $title "Heading5"
        } elseif ($trimmed -like "###### **3.2.*") {
            $title = $trimmed.Replace("###### **", "").Replace("**", "").Trim()
            $p = Create-Paragraph $title "Heading6"
        } elseif ($trimmed -like "---") {
            continue
        } elseif ($trimmed -like "*Screen layout:*" -or $trimmed.Contains("![][image") -or $trimmed -like "Figure 3.2.*") {
            $p = Create-Paragraph $trimmed "Normal"
        } else {
            # This handles both lists and normal paragraphs
            $p = Create-Paragraph $line "Normal" # Pass the original line to preserve indent spacing checks
        }
        
        if ($p -ne $null) {
            $parent.InsertAfter($p, $parent.ChildNodes[$currentInsertIndex - 1]) | Out-Null
            $currentInsertIndex++
        }
    }

    Write-Host "Appended new section 3.2 elements successfully."

    # Save XML back to zip using UTF-8 encoding
    $entry.Delete()
    $newEntry = $zip.CreateEntry("word/document.xml")
    $writerStream = $newEntry.Open()
    $writer = New-Object System.IO.StreamWriter($writerStream, [System.Text.Encoding]::UTF8)
    $xml.Save($writer)
    $writer.Close()
    $writerStream.Close()

    $zip.Dispose()
    Write-Host "Success! $docxPath updated successfully."
}
