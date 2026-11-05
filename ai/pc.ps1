# 학교 대시보드: 이 PC 설정 (윈도우, 한 번만). 대시보드의 "이 PC 설정" 줄을 Win+R 에 붙여넣으면 받아서 실행된다.
#  1) [📁 다운로드 폴더] 버튼: sdash-dl: 주소 → 탐색기로 다운로드 폴더만 연다 (주소 내용은 쓰지 않음, 내 계정 HKCU 에만)
#  2) 크롬·엣지에서 대시보드(juvilan.github.io)에서 받은 엑셀·PPT·워드·한글·PDF·텍스트·그림 파일은 받자마자
#     윈도우 기본 앱으로 열기 (브라우저 정책 AutoOpenFileTypes + AutoOpenAllowedForURLs).
#     크롬·엣지는 이 정책을 도메인(AD/Azure AD)에 가입했거나 관리 등록된 PC 에서만 따른다 → 그런 PC 에서만 넣고,
#     아니면(대부분의 개인·학교 PC) 넣지 않고 브라우저에서 직접 "항상 열기"를 켜는 법을 알려 준다.
#     학교가 이미 넣어 둔 같은 정책이 있으면 건드리지 않는다.
# 되돌리기: 같은 줄 끝의 & $f 를 & $f -Undo 로 바꿔 실행
param([switch]$Undo)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }
function Say([string]$m, [string]$color = 'Gray') { Write-Host $m -ForegroundColor $color }

$Proto = 'HKCU:\Software\Classes\sdash-dl'
$Site = 'juvilan.github.io'
$Types = @('xlsx', 'xls', 'csv', 'pptx', 'ppt', 'docx', 'doc', 'hwp', 'hwpx', 'pdf', 'txt', 'png', 'jpg', 'jpeg')
$Browsers = @(
  @{ Name = '크롬'; Key = 'HKCU:\Software\Policies\Google\Chrome' },
  @{ Name = '엣지'; Key = 'HKCU:\Software\Policies\Microsoft\Edge' }
)

# 목록형 정책은 이름 1,2,3… 이 빈 번호 없이 이어져야 한다 (중간이 비면 그 뒤를 안 읽음)
function Get-List([string]$key) {
  if (-not (Test-Path $key)) { return @() }
  $props = Get-ItemProperty $key
  if (-not $props) { return @() }
  return @($props.PSObject.Properties | Where-Object { $_.Name -match '^\d+$' } | Sort-Object { [int]$_.Name } | ForEach-Object { [string]$_.Value })
}
function Write-List([string]$key, [string[]]$values) {
  if (-not (Test-Path $key)) { New-Item $key -Force | Out-Null }
  $props = Get-ItemProperty $key
  if ($props) { foreach ($p in @($props.PSObject.Properties | Where-Object { $_.Name -match '^\d+$' })) { Remove-ItemProperty $key $p.Name } }
  $i = 0
  foreach ($v in $values) { $i++; Set-ItemProperty $key "$i" $v }
  if ($i -eq 0) { Remove-Item $key -Force -ErrorAction SilentlyContinue }
}
$Mark = 'HKCU:\Software\SchoolDashboard'   # 우리가 넣은 것만 되돌리려고 기록

Say ''
Say '학교 대시보드 - 이 PC 설정' 'Cyan'
Say '--------------------------' 'Cyan'

if ($Undo) {
  Remove-Item $Proto -Recurse -Force -ErrorAction SilentlyContinue
  Say '다운로드 폴더 버튼 등록을 지웠어요.' 'Green'
  foreach ($b in $Browsers) {
    $mk = "$Mark\$($b.Name)"
    if (-not (Test-Path $mk)) { continue }
    try {
      $added = @((Get-ItemProperty $mk).Added -split ',')
      Write-List "$($b.Key)\AutoOpenFileTypes" @(Get-List "$($b.Key)\AutoOpenFileTypes" | Where-Object { $added -notcontains $_ })
      Write-List "$($b.Key)\AutoOpenAllowedForURLs" @(Get-List "$($b.Key)\AutoOpenAllowedForURLs" | Where-Object { $_ -ne $Site })
      Remove-Item $mk -Force
      Say "$($b.Name): 받은 파일 바로 열기를 껐어요." 'Green'
    } catch { Say ("$($b.Name): 끄지 못했어요 - " + $_.Exception.Message) 'Red' }
  }
  Say '브라우저를 다시 켜면 적용돼요.' 'Gray'
  Write-Host ''; Read-Host '엔터를 누르면 이 창이 닫혀요'; exit 0
}

# 1) 다운로드 폴더 버튼
try {
  New-Item "$Proto\shell\open\command" -Force | Out-Null
  Set-ItemProperty $Proto '(default)' 'URL:sdash-dl'
  Set-ItemProperty $Proto 'URL Protocol' ''
  Set-ItemProperty "$Proto\shell\open\command" '(default)' 'explorer.exe shell:Downloads'
  Say '1/2 [다운로드 폴더] 버튼을 켰어요.' 'Green'
} catch {
  Say ('1/2 다운로드 폴더 버튼을 켜지 못했어요: ' + $_.Exception.Message) 'Red'
}

# 2) 받은 파일 바로 열기 (대시보드에서 받은 것만, 관리되는 PC 에서만)
$managed = $false
try { $managed = [bool](Get-CimInstance Win32_ComputerSystem).PartOfDomain } catch { }
if (-not $managed) {
  try { $managed = [bool](Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Enrollments\*' -ErrorAction SilentlyContinue | Where-Object { $_.EnrollmentState -eq 1 -and $_.UPN }) } catch { }
}
$manual = '    받은 파일을 바로 열려면: 파일을 한 번 받은 뒤 브라우저 오른쪽 위 다운로드(↓) → 그 파일 메뉴(⋮ 또는 오른쪽 클릭) → "이 유형의 파일 항상 열기"를 켜 주세요. 엑셀·한글처럼 종류마다 한 번씩이에요.'
if (-not $managed) {
  Say '2/2 받은 파일 바로 열기: 이 PC 는 브라우저가 이 설정을 받지 않는 PC 예요 (회사·기관 관리 PC 에서만 돼요).' 'Yellow'
  Say $manual 'Yellow'
} else {
  foreach ($b in $Browsers) {
    try {
      $curT = Get-List "$($b.Key)\AutoOpenFileTypes"
      $curU = Get-List "$($b.Key)\AutoOpenAllowedForURLs"
      $mk = "$Mark\$($b.Name)"
      if (($curT.Count -or $curU.Count) -and -not (Test-Path $mk)) {
        Say "2/2 $($b.Name): 학교가 이미 넣어 둔 설정이 있어 건드리지 않았어요." 'Yellow'
        continue
      }
      $add = @($Types | Where-Object { $curT -notcontains $_ })
      Write-List "$($b.Key)\AutoOpenFileTypes" @($curT + $add)
      if ($curU -notcontains $Site) { Write-List "$($b.Key)\AutoOpenAllowedForURLs" @($curU + $Site) }
      $old = @(); if (Test-Path $mk) { $old = @((Get-ItemProperty $mk).Added -split ',' | Where-Object { $_ }) }
      New-Item $mk -Force | Out-Null
      Set-ItemProperty $mk 'Added' ((@($old + $add) | Select-Object -Unique) -join ',')
      Say "2/2 $($b.Name): 대시보드에서 받은 엑셀·PPT·워드·한글·PDF·텍스트·그림은 받자마자 열려요. 브라우저를 모두 닫았다가 다시 켜 주세요." 'Green'
    } catch {
      Say "2/2 $($b.Name): 이 PC 는 이 설정을 관리자만 바꿀 수 있어요." 'Yellow'
      Say ('    (' + $_.Exception.Message + ')') 'DarkGray'
      Say $manual 'Yellow'
    }
  }
}
Write-Host ''
Say '끝났어요. 이 창을 닫고 대시보드로 돌아가세요.' 'Cyan'
Read-Host '엔터를 누르면 이 창이 닫혀요'
