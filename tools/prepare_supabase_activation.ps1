$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvPath = Join-Path $ProjectRoot ".env.local"
if (-not (Test-Path -LiteralPath $EnvPath)) {
  throw "Khong tim thay .env.local trong thu muc twogether."
}

$EnvLines = Get-Content -LiteralPath $EnvPath
$UrlLine = $EnvLines | Where-Object { $_ -match '^\s*VITE_SUPABASE_URL\s*=' } | Select-Object -First 1
$KeyLine = $EnvLines | Where-Object { $_ -match '^\s*VITE_SUPABASE_ANON_KEY\s*=' } | Select-Object -First 1
if (-not $UrlLine -or -not $KeyLine) {
  throw ".env.local can co VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY."
}

$ProjectUrl = (($UrlLine -split '=', 2)[1]).Trim().Trim('"').Trim("'")
$AnonKey = (($KeyLine -split '=', 2)[1]).Trim().Trim('"').Trim("'")
if (-not $ProjectUrl -or -not $AnonKey) {
  throw "URL hoac anon key dang trong."
}
$ProjectRef = ([Uri]$ProjectUrl).Host.Split('.')[0]
if ($ProjectRef -notmatch '^[a-z0-9]+$') {
  throw "Khong doc duoc project ref an toan tu VITE_SUPABASE_URL."
}

$Parts = @(
  "supabase\migrations\202608200001_initial.sql",
  "supabase\migrations\202608310001_card_support.sql",
  "supabase\migrations\202609010001_device_pairing_sync.sql",
  "supabase\seed.sql",
  "supabase\bootstrap_pairing_codes.sql"
)
$SqlSections = foreach ($Part in $Parts) {
  $FullPath = Join-Path $ProjectRoot $Part
  if (-not (Test-Path -LiteralPath $FullPath)) { throw "Thieu file $Part" }
  "`n-- ===== $Part =====`n"
  Get-Content -LiteralPath $FullPath -Raw
}
$CombinedSql = $SqlSections -join "`n"
$GeneratedPath = Join-Path $ProjectRoot "supabase\activate_twogether.generated.sql"
[System.IO.File]::WriteAllText($GeneratedPath, $CombinedSql, [System.Text.UTF8Encoding]::new($false))
Set-Clipboard -Value $CombinedSql

Start-Process "https://supabase.com/dashboard/project/$ProjectRef/auth/providers"
Start-Process "https://supabase.com/dashboard/project/$ProjectRef/sql/new"

Write-Host ""
Write-Host "DA CHUAN BI XONG PHAN KET NOI SUPABASE" -ForegroundColor Green
Write-Host "1. Dang nhap Supabase neu trang web yeu cau."
Write-Host "2. O trang Auth Providers: bat Allow anonymous sign-ins va Save."
Write-Host "3. O trang SQL Editor: bam Ctrl+V, sau do bam Run mot lan."
Write-Host "4. Ket qua cuoi se tra ve 2 ma ghep thiet bi cua Hiep va Hoang. Luu rieng, khong gui vao chat."
Write-Host "5. Deploy Cloudflare voi hai bien VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY nhu .env.local."
Write-Host ""
Write-Host "SQL cung da duoc luu tai: $GeneratedPath"
Write-Host "Script khong hien URL, anon key hay ma ghep thiet bi len man hinh."

