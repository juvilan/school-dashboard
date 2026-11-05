# 학교 대시보드: sdash-dl: 주소를 받아 처리한다 (이 PC 설정이 %LOCALAPPDATA%\SchoolDashboard 에 둠)
#  sdash-dl:open            → 탐색기로 다운로드 폴더
#  sdash-dl:latest?n=<이름> → 방금 받은 그 파일을 윈도우 기본 앱(한글·엑셀·파워포인트…)으로 연다
# 주소의 이름은 다운로드 폴더 안의 파일과 "비교"만 한다. 경로로 쓰지 않으므로 다른 폴더의 파일은 열 수 없다.
# 열 수 있는 것: 대시보드가 알려 준 받은 시각 이후에 생긴, 이름·확장자가 정확히 맞는 아래 종류의 파일이고,
# 크롬 출처 표시가 대시보드인 것만 (10분 안). 아니면 열지 않고 다운로드 폴더만 연다.
param([string]$u = '')

$Types = @('.hwp', '.hwpx', '.xlsx', '.xls', '.csv', '.pptx', '.ppt', '.docx', '.doc', '.pdf', '.txt', '.png', '.jpg', '.jpeg')

$dl = $null
try { $dl = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path } catch { }
if (-not $dl -or -not (Test-Path -LiteralPath $dl)) { $dl = Join-Path $env:USERPROFILE 'Downloads' }

# 크롬이 받은 파일에 붙여 두는 출처 표시(Zone.Identifier)로, 대시보드에서 받은 파일인지 본다.
# 출처가 적혀 있는데 대시보드가 아니면 열지 않는다 (다른 사이트가 받게 한 파일을 이 주소로 여는 것을 막음).
function From-Dashboard([string]$path) {
  $z = $null
  try { $z = Get-Content -LiteralPath $path -Stream Zone.Identifier -ErrorAction Stop } catch { return $true }  # 표시 없음(드묾): 이름·시각으로만
  $src = @($z | Where-Object { $_ -match '^(ReferrerUrl|HostUrl)=(blob:)?https?://' })   # about:internet 같은 것은 출처로 치지 않음
  if (-not $src.Count) { return $true }
  return [bool]($src | Where-Object { $_ -match '^(ReferrerUrl|HostUrl)=(blob:)?https://juvilan\.github\.io/school-dashboard/' })
}

if ($u -match '^sdash-dl:/*latest') {
  $want = ''; $t = 0
  if ($u -match '[?&]n=([^&]*)') { try { $want = [Uri]::UnescapeDataString($Matches[1]).Normalize([Text.NormalizationForm]::FormC) } catch { } }
  if ($u -match '[?&]t=(\d{9,11})(&|$)') { $t = [long]$Matches[1] }
  $stem = [IO.Path]::GetFileNameWithoutExtension($want)
  $ext = [IO.Path]::GetExtension($want).ToLower()
  if (-not $stem -or -not $ext -or $want -match '[\\/]' -or -not $t) { $want = '' }
  if ($want) {
    # 받은 시각 5초 전보다 오래된 파일(같은 이름의 예전 판)은 열지 않는다. 그리고 10분이 지나면 열지 않는다.
    $from = [DateTimeOffset]::FromUnixTimeSeconds($t - 5).LocalDateTime
    if ((Get-Date) -gt $from.AddMinutes(10)) { $want = '' }
  }
  # 이름이 정확히 같거나, 같은 이름이 있어 크롬이 붙인 " (1)" 꼴만. 크롬이 다 쓸 때까지 최대 8초 기다린다.
  $pat = '^' + [regex]::Escape($stem) + '( \(\d+\))?$'
  for ($i = 0; $want -and $i -lt 16; $i++) {
    $f = Get-ChildItem -LiteralPath $dl -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Extension.ToLower() -eq $ext -and $Types -contains $ext -and $_.LastWriteTime -ge $from -and
        $_.BaseName.Normalize([Text.NormalizationForm]::FormC) -match $pat
      } |
      Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($f) {
      if (From-Dashboard $f.FullName) { Invoke-Item -LiteralPath $f.FullName; exit 0 }
      break
    }
    Start-Sleep -Milliseconds 500
  }
}
Start-Process explorer.exe -ArgumentList "`"$dl`""
