# 학교 대시보드: 이 PC 설정 (윈도우, 한 번만). 대시보드의 "이 PC 설정" 줄을 Win+R 에 붙여넣으면 받아서 실행된다.
#  sdash-dl: 주소 → open.vbs → open.ps1 (내 계정 HKCU 에만): [📁 다운로드]·자주 가는 폴더 버튼이 탐색기를 연다.
#  예전 판이 관리 PC 에 넣었던 "받은 파일 바로 열기" 브라우저 정책(구글 드라이브용)은 이제 쓰지 않아서, 우리가 넣은 것만 걷어 낸다.
# 되돌리기: 같은 줄 끝의 & $f 를 & $f -Undo 로 바꿔 실행
param([switch]$Undo)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }
function Say([string]$m, [string]$color = 'Gray') { Write-Host $m -ForegroundColor $color }

$Proto = 'HKCU:\Software\Classes\sdash-dl'
$Site = 'juvilan.github.io'
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
# 예전 판이 넣은 브라우저 정책(받은 파일 바로 열기) 중 우리가 넣은 것만 걷어 낸다
function Remove-OurPolicy {
  foreach ($b in $Browsers) {
    $mk = "$Mark\$($b.Name)"
    if (-not (Test-Path $mk)) { continue }
    try {
      $added = @((Get-ItemProperty $mk).Added -split ',' | Where-Object { $_ })
      $curU = @(Get-List "$($b.Key)\AutoOpenAllowedForURLs")
      # 조심스럽게: 허용 주소가 우리 것(대시보드)뿐일 때만 우리가 넣은 파일 종류까지 뺀다.
      # 학교가 다른 주소를 더했거나 바꿨으면 종류 목록은 학교 것일 수 있어 그대로 두고, 우리 주소만 뺀다.
      if ($curU -contains $Site) {
        if (@($curU | Where-Object { $_ -ne $Site }).Count -eq 0) {
          Write-List "$($b.Key)\AutoOpenFileTypes" @(Get-List "$($b.Key)\AutoOpenFileTypes" | Where-Object { $added -notcontains $_ })
        }
        Write-List "$($b.Key)\AutoOpenAllowedForURLs" @($curU | Where-Object { $_ -ne $Site })
      }
      Remove-Item $mk -Force
      Say "$($b.Name): 예전에 켠 받은 파일 바로 열기를 껐어요 (이제 쓰지 않아요)." 'Green'
    } catch { Say ("$($b.Name): 끄지 못했어요 - " + $_.Exception.Message) 'Red' }
  }
}

Say ''
Say '학교 대시보드 - 이 PC 설정' 'Cyan'
Say '--------------------------' 'Cyan'

if ($Undo) {
  Remove-Item $Proto -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $env:LOCALAPPDATA 'SchoolDashboard\open.ps1') -Force -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $env:LOCALAPPDATA 'SchoolDashboard\open.vbs') -Force -ErrorAction SilentlyContinue
  Say '다운로드 폴더 버튼 등록을 지웠어요.' 'Green'
  Remove-OurPolicy
  Say '브라우저를 다시 켜면 적용돼요.' 'Gray'
  Write-Host ''; Read-Host '엔터를 누르면 이 창이 닫혀요'; exit 0
}

$OpenDir = Join-Path $env:LOCALAPPDATA 'SchoolDashboard'
$OpenPs = Join-Path $OpenDir 'open.ps1'
function Register-Dl {
  # sdash-dl: → open.ps1 (다운로드 폴더 · 자주 가는 폴더 열기). 받기에 실패하면 다운로드 폴더만 여는 예전 방식.
  $cmd = 'explorer.exe shell:Downloads'
  try {
    New-Item $OpenDir -ItemType Directory -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = 3072
    Invoke-WebRequest -UseBasicParsing 'https://juvilan.github.io/school-dashboard/ai/open.ps1' -OutFile $OpenPs
    $ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $cmd = "`"$ps`" -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$OpenPs`" `"%1`""
    # 검은 창이 번쩍이지 않게: 창을 만들지 않는 wscript 가 open.vbs → open.ps1 을 숨겨서 실행한다.
    # 학교 PC 에서 Windows Script Host 를 꺼 두었으면 위의 PowerShell 방식 그대로 (잠깐 번쩍임)
    $wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'
    $wshOff = $false
    foreach ($h in 'HKCU:', 'HKLM:') {
      try { if ("$((Get-ItemProperty "$h\Software\Microsoft\Windows Script Host\Settings" -Name Enabled -ErrorAction Stop).Enabled)" -eq '0') { $wshOff = $true } } catch { }
    }
    if ((Test-Path $wscript) -and (Test-Path (Join-Path $env:SystemRoot 'System32\vbscript.dll')) -and -not $wshOff) {
      $vbs = Join-Path $OpenDir 'open.vbs'
      Set-Content -LiteralPath $vbs -Encoding ASCII -Value @'
' School Dashboard: run open.ps1 (next to this file) with no console window.
Option Explicit
Dim sh, fso, a, i, c, ps, dir
If WScript.Arguments.Count < 1 Then WScript.Quit 7
a = WScript.Arguments(0)
If Len(a) > 4000 Or LCase(Left(a, 9)) <> "sdash-dl:" Or Right(a, 1) = "\" Then WScript.Quit
For i = 1 To Len(a)
  c = AscW(Mid(a, i, 1))
  If (c >= 0 And c < 32) Or c = 34 Or c = 123 Or c = 127 Then WScript.Quit
Next
' Run expands %NAME% in the command line, so pass "%" as "{" (open.ps1 turns it back).
a = Replace(a, "%", "{")
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
ps = sh.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"
sh.Run """" & ps & """ -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & dir & "\open.ps1"" """ & a & """", 0, False
'@
      # 시험: 인자 없이 돌리면 7 로 끝난다. VBScript 가 막힌 PC(기능 꺼짐·차단)면 다른 값 → PowerShell 방식 그대로
      $ok = $false
      try {
        $t = Start-Process -FilePath $wscript -ArgumentList '//B', '//Nologo', "`"$vbs`"" -Wait -PassThru -WindowStyle Hidden
        $ok = $t.ExitCode -eq 7
      } catch { }
      if ($ok) { $cmd = "`"$wscript`" //B //Nologo `"$vbs`" `"%1`"" }
    }
  } catch { }
  $k = 'HKCU:\Software\Classes\sdash-dl'
  New-Item "$k\shell\open\command" -Force | Out-Null
  Set-ItemProperty $k '(default)' 'URL:sdash-dl'
  Set-ItemProperty $k 'URL Protocol' ''
  Set-ItemProperty "$k\shell\open\command" '(default)' $cmd
  return ($cmd -notlike 'explorer*')
}

# 다운로드·자주 가는 폴더 버튼
try {
  if (Register-Dl) { Say '[📁 다운로드]·자주 가는 폴더 버튼을 켰어요.' 'Green' }
  else { Say '[📁 다운로드] 버튼을 켰어요. (자주 가는 폴더용 파일은 받지 못했어요. 인터넷을 확인하고 다시 해 주세요)' 'Yellow' }
} catch {
  Say ('다운로드 폴더 버튼을 켜지 못했어요: ' + $_.Exception.Message) 'Red'
}
Remove-OurPolicy
Write-Host ''
Say '끝났어요. 이 창을 닫고 대시보드로 돌아가세요.' 'Cyan'
Read-Host '엔터를 누르면 이 창이 닫혀요'
