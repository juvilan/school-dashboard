# 학교 대시보드: sdash-dl: 주소를 받아 처리한다 (이 PC 설정이 %LOCALAPPDATA%\SchoolDashboard 에 둠)
#  sdash-dl:open            → 탐색기로 다운로드 폴더
#  sdash-dl:folder?p=<경로> → 선생님이 적어 둔 자주 가는 PC 폴더를 탐색기로 (폴더만, 파일·프로그램은 열지 않음)
#  sdash-dl:pick?n=<번호>   → 폴더 고르는 창 → 결과를 클립보드로
#  그 밖의 주소(예전 판의 latest 등)도 다운로드 폴더만 연다.
param([string]$u = '')
# open.vbs 는 명령 줄에서 %이름% 이 환경 변수로 바뀌지 않게 % 를 { 로 바꿔 넘긴다 (주소에는 { 가 없음: 대시보드는 %7B 로 씀)
$u = $u.Replace('{', '%')

# 자주 가는 폴더: 드라이브 글자로 시작하는, 지금 있는 "폴더"만 연다.
# \\서버\ 같은 네트워크 주소는 열지 않는다 (다른 사이트가 이 주소로 PC 의 로그인 정보를 남의 서버에 보내게 하는 것을 막음).
# 파일·프로그램·압축 파일은 폴더가 아니라서 열리지 않는다.
# 학교 공유 폴더를 연결한 Z: 같은 네트워크 드라이브는 일부러 허용한다 (선생님이 쓰는 주된 폴더일 수 있음).
# 그 드라이브가 가리키는 서버는 선생님이 직접 연결한 곳이라, 바깥 사이트가 서버를 고를 수는 없다. (C 리뷰 2026-11-06 검토)
if ($u -match '^sdash-dl:/*folder\?p=([^&]*)$') {
  # 경로 글자는 그대로 쓴다 (한글 정규화를 하면 다른 폴더 이름이 될 수 있음)
  $p = ''
  try { $p = [Uri]::UnescapeDataString($Matches[1]) } catch { }
  $good = $p.Length -le 240 -and $p -match '^[A-Za-z]:\\' -and $p -notmatch '[\x00-\x1f\x7f"<>|?*]' -and -not $p.Substring(2).Contains(':')
  try {
    if ($good -and (Test-Path -LiteralPath $p -PathType Container -ErrorAction Stop)) {
      Invoke-Item -LiteralPath (Get-Item -LiteralPath $p -Force -ErrorAction Stop).FullName -ErrorAction Stop
      exit 0
    }
  } catch { }
  $show = if ($good) { $p } else { '(쓸 수 없는 경로)' }
  try { [void](New-Object -ComObject WScript.Shell).Popup("폴더를 찾지 못했어요.`n$show`n`n대시보드 맨 위 ✎ 에서 경로를 확인해 주세요.", 0, '학교 대시보드', 48) } catch { }
  exit 0
}

# 폴더 찾기: 윈도우 폴더 고르는 창(트리)을 띄우고, 결과를 클립보드에 "SDASH-PICK|요청번호|경로" 로 넣는다
# (취소는 경로 없이). 대시보드가 자기 요청번호인지 보고 칸에 넣는다. 고르기만 하고 아무것도 열거나 바꾸지 않는다.
# 다른 사이트도 이 주소를 부를 수는 있지만, 선생님이 폴더를 고르고 그 사이트에 클립보드 읽기까지 허락해야
# 경로(파일 내용 아님)를 볼 수 있다. 창 문구에 클립보드로 간다는 것을 적어 둔다. (C 리뷰 2026-11-06)
if ($u -match '^sdash-dl:/*pick\?n=([0-9a-f]{8,32})$') {
  $n = $Matches[1]
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::EnableVisualStyles()
    # 숨은 창에서 띄우면 크롬 뒤로 숨을 수 있어서, 맨 위에 뜨는 보이지 않는 창을 주인으로 둔다
    $owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false; Width = 1; Height = 1; StartPosition = 'CenterScreen'; Opacity = 0 }
    $owner.Show(); $owner.Activate()
    $d = New-Object System.Windows.Forms.FolderBrowserDialog
    $d.Description = '학교 대시보드에 넣을 폴더를 골라 [확인]을 눌러 주세요. 고른 경로는 클립보드로 복사돼요.'
    $d.ShowNewFolderButton = $false
    $d.RootFolder = 'MyComputer'
    $p = ''
    if ($d.ShowDialog($owner) -eq 'OK' -and $d.SelectedPath) { $p = $d.SelectedPath }
    [System.Windows.Forms.Clipboard]::SetText("SDASH-PICK|$n|$p")
    $owner.Close()
  } catch { }
  exit 0
}

# 그 밖에는 다운로드 폴더
$dl = $null
try { $dl = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path } catch { }
if (-not $dl -or -not (Test-Path -LiteralPath $dl)) { $dl = Join-Path $env:USERPROFILE 'Downloads' }

Start-Process explorer.exe -ArgumentList "`"$dl`""
