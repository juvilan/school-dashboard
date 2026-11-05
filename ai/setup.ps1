# 학교 대시보드 AI 연결 설치 (윈도우)
# 대시보드의 "설치 줄"을 Win+R 에 붙여넣으면 이 파일을 받아 실행한다.
#  1) Claude Code 설치 (Anthropic 공식 설치 프로그램, 이미 있으면 건너뜀)
#  2) AI 도우미(helper.ps1)를 %LOCALAPPDATA%\SchoolDashboardAI 에 받기
#  3) PC 를 켤 때 도우미가 저절로 켜지게 시작 프로그램에 등록하고, 지금 바로 켜기
# 지우기: 같은 줄 끝에 -Uninstall 을 붙여 실행 (도우미·시작 프로그램 등록만 지움. Claude Code 는 남김)
param([switch]$Uninstall)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

$Base = 'https://juvilan.github.io/school-dashboard/ai'
$Dir = Join-Path $env:LOCALAPPDATA 'SchoolDashboardAI'
$Helper = Join-Path $Dir 'helper.ps1'
$Startup = [Environment]::GetFolderPath('Startup')
$Lnk = Join-Path $Startup 'SchoolDashboardAI.lnk'
$Claude = Join-Path $env:USERPROFILE '.local\bin\claude.exe'

function Say([string]$m, [string]$color = 'Gray') { Write-Host $m -ForegroundColor $color }
function Done([int]$code) {
  Write-Host ''
  Read-Host '엔터를 누르면 이 창이 닫혀요'
  exit $code
}
# 큰 파일을 받으며 몇 % 받았는지 보여 준다 (공식 설치 스크립트는 아무 표시 없이 받아서 멈춘 것처럼 보임)
function Get-WithProgress([string]$url, [string]$out) {
  $req = [Net.HttpWebRequest]::Create($url)
  $req.Timeout = 30000
  $req.ReadWriteTimeout = 120000
  $req.UserAgent = 'Mozilla/5.0 (Windows NT 10.0) WindowsPowerShell/5.1'
  if ($req.Proxy) { $req.Proxy.Credentials = [Net.CredentialCache]::DefaultCredentials }
  $res = $null; $in = $null; $fs = $null
  $buf = New-Object byte[] 1048576
  $done = 0L
  $total = -1
  $shown = -1
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $res = $req.GetResponse()
    $total = $res.ContentLength
    $in = $res.GetResponseStream()
    $fs = [IO.File]::Create($out)
    while (($n = $in.Read($buf, 0, $buf.Length)) -gt 0) {
      $fs.Write($buf, 0, $n)
      $done += $n
      if ($total -gt 0) {
        $pct = [int][Math]::Floor(100 * $done / $total)
        if ($pct -ne $shown) {
          $shown = $pct
          $sec = $sw.Elapsed.TotalSeconds
          $left = ''
          if ($sec -gt 3 -and $done -gt 0) {
            $rest = ($total - $done) / ($done / $sec)
            $left = if ($rest -ge 60) { ", 남은 시간 약 $([int][Math]::Ceiling($rest / 60))분" } else { ', 거의 다 됐어요' }
          }
          Write-Host ("`r    {0,3}%  ({1} / {2}MB{3})        " -f $pct, [Math]::Floor($done / 1MB), [int]($total / 1MB), $left) -NoNewline
        }
      } else {
        $mb = [Math]::Floor($done / 1MB)
        if ($mb -ne $shown) { $shown = $mb; Write-Host ("`r    {0}MB 받음        " -f $mb) -NoNewline }
      }
    }
    Write-Host ''
  } finally {
    if ($fs) { try { $fs.Dispose() } catch { } }
    if ($in) { try { $in.Dispose() } catch { } }
    if ($res) { try { $res.Close() } catch { } }
  }
  if ($total -gt 0 -and $done -ne $total) { throw '받는 도중 끊겼어요. 인터넷을 확인하고 다시 실행해 주세요.' }
}

# 큰 파일 받기: 윈도우에 들어 있는 curl.exe 가 옛 PowerShell 보다 훨씬 빠르고, 받은 양·속도·남은 시간도 보여 준다 (Time Left 칸).
# 학교망 보안 장비 때문에 인증서 폐기 확인이 실패하면 공식 설치 스크립트처럼 --ssl-revoke-best-effort 로 한 번 더.
# curl 이 없거나(아주 옛 윈도우) 계속 실패하면 PowerShell 로 받는다.
function Get-Big([string]$url, [string]$out) {
  $curl = Join-Path $env:SystemRoot 'System32\curl.exe'
  if (Test-Path $curl) {
    foreach ($relaxed in @($false, $true)) {
      $a = @('-fL', '--retry', '2', '--connect-timeout', '30', '-o', $out, $url)
      if ($relaxed) { $a = @('--ssl-revoke-best-effort') + $a }
      & $curl @a
      if ($LASTEXITCODE -eq 0 -and (Test-Path $out)) { return }
    }
    Say '    curl 로 받지 못해 다른 방법으로 다시 받아요...' 'Yellow'
  }
  Get-WithProgress $url $out
}

# Claude Code 설치: 공식 설치 스크립트(claude.ai/install.ps1)와 같은 순서 (최신 버전 → 목록의 체크섬 → 받기 → 확인 → claude install)
function Install-Claude {
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'Claude Code 는 64비트 윈도우에서만 돼요.' }
  $rel = 'https://downloads.claude.ai/claude-code-releases'
  $version = "$(Invoke-RestMethod -UseBasicParsing "$rel/latest")".Trim()
  if ($version -notmatch '^\d+\.\d+\.\d+') { throw 'Claude Code 버전을 알아내지 못했어요. (다운로드 서버에 닿지 않음)' }
  $plat = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'win32-arm64' } else { 'win32-x64' }
  $manifest = Invoke-RestMethod -UseBasicParsing "$rel/$version/manifest.json"
  $sum = $manifest.platforms.$plat.checksum
  if (-not $sum) { throw "이 PC 종류($plat)용 Claude Code 가 없어요." }
  $dl = Join-Path $env:USERPROFILE '.claude\downloads'
  New-Item -ItemType Directory -Force -Path $dl | Out-Null
  $bin = Join-Path $dl "claude-$version-$plat.exe"
  try {
    Get-Big "$rel/$version/$plat/claude.exe" $bin
    if ((Get-FileHash -Path $bin -Algorithm SHA256).Hash.ToLower() -ne $sum.ToLower()) { throw '받은 파일이 깨졌어요. 다시 실행해 주세요.' }
    Say '    받았어요. 설치를 마무리하고 있어요 (1분쯤)...'
    $ErrorActionPreference = 'Continue'   # claude install 이 알림을 오류 줄로 내도 멈추지 않게
    $code = 1
    try { & $bin install latest | Out-Host; $code = $LASTEXITCODE } finally { $ErrorActionPreference = 'Stop' }
    if ($code -ne 0) { throw "Claude Code 설치 마무리에 실패했어요 (코드 $code)." }
  } finally {
    Start-Sleep -Seconds 1
    Remove-Item -Force -ErrorAction SilentlyContinue $bin
  }
}

function Stop-Helper {
  Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -like '*SchoolDashboardAI\helper.ps1*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

Say ''
Say '학교 대시보드 AI 연결' 'Cyan'
Say '----------------------' 'Cyan'

if ($Uninstall) {
  Stop-Helper
  Remove-Item -Force -ErrorAction SilentlyContinue $Lnk
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Dir
  # Claude Code 가 남긴 이 도우미의 대화 기록도 지움
  $root = Join-Path $env:USERPROFILE '.claude\projects'
  if (Test-Path $root) { Get-ChildItem -Path $root -Directory | Where-Object { $_.Name -like '*SchoolDashboardAI-work' } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue }
  Say 'AI 도우미를 지웠어요. (Claude Code 프로그램은 그대로 두었어요)' 'Green'
  Done 0
}

try {
  # 1) Claude Code
  if (Test-Path $Claude) {
    Say '1/3 Claude Code 가 이미 있어요.' 'Green'
  } else {
    Say '1/3 Claude Code 를 받고 있어요 (약 340MB, 학교 인터넷에 따라 3~15분)...'
    Install-Claude
    if (-not (Test-Path $Claude)) { throw 'Claude Code 설치가 끝나지 않았어요.' }
    Say '    설치했어요.' 'Green'
  }

  # 2) 도우미 받기 (켜져 있던 옛 도우미는 끄고 바꿈)
  Say '2/3 AI 도우미를 받고 있어요...'
  New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  $tmp = "$Helper.new"
  Invoke-WebRequest -UseBasicParsing "$Base/helper.ps1" -OutFile $tmp
  Stop-Helper   # 새 파일을 받은 뒤에 옛 도우미를 끈다 (받기가 실패하면 옛 것이 계속 돌게)
  Start-Sleep -Milliseconds 500
  Move-Item -Force $tmp $Helper
  Say '    받았어요.' 'Green'

  # 3) 시작 프로그램 등록 + 지금 켜기
  Say '3/3 PC 를 켤 때 저절로 켜지게 등록하고 있어요...'
  $ps = Join-Path $PSHOME 'powershell.exe'
  $argLine = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Helper`""
  $sh = New-Object -ComObject WScript.Shell
  $s = $sh.CreateShortcut($Lnk)
  $s.TargetPath = $ps
  $s.Arguments = $argLine
  $s.WorkingDirectory = $Dir
  $s.WindowStyle = 7
  $s.Description = '학교 대시보드 AI 도우미'
  $s.Save()
  Start-Process -FilePath $ps -ArgumentList $argLine -WindowStyle Hidden

  # 켜졌는지 확인
  $ok = $false
  for ($i = 0; $i -lt 30 -and -not $ok; $i++) {   # 백신 검사로 늦게 뜨는 PC 를 생각해 30초까지
    Start-Sleep -Milliseconds 1000
    try {
      $c = New-Object System.Net.Sockets.TcpClient
      $c.Connect('127.0.0.1', 47615)
      $ok = $c.Connected
      $c.Close()
    } catch { }
  }
  if (-not $ok) { throw '도우미가 켜지지 않았어요.' }
  Say '    켜졌어요.' 'Green'
  # Claude Code 는 윈도우에서 Git(Git Bash)을 찾을 수 있다. 없으면 알려만 둔다 (대화가 안 되면 이것부터 확인)
  $git = @("$env:ProgramFiles\Git\bin\bash.exe", "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe") | Where-Object { Test-Path $_ }
  if (-not $git) { Say '    참고: 이 PC 에 Git 이 없어요. 대화가 안 되면 알려 주세요.' 'Yellow' }
  Say ''
  Say '설치가 끝났어요. 이 창을 닫고 대시보드로 돌아가 "Claude 로그인"을 눌러 주세요.' 'Cyan'
  Done 0
} catch {
  Say ''
  Say ('문제가 생겼어요: ' + $_.Exception.Message) 'Red'
  Say '이 창을 사진으로 찍어 보내 주시면 확인할게요.' 'Yellow'
  Done 1
}
