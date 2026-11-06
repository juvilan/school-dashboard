# 학교 대시보드 AI 도우미 (윈도우 PowerShell 5.1 이상)
# 이 PC 에 깔린 Claude Code(Claude 구독) 또는 Codex CLI(ChatGPT 구독)로 대시보드 대화창의 질문에 답한다.
# 선생님 각자의 구독으로 동작한다. Codex 는 설치(setup.ps1 -Codex)가 이 폴더의 codex\ 에 두고,
# 로그인·설정은 이 폴더의 codex-home\ 에만 둔다 (선생님 PC 의 다른 Codex 설정과 섞이지 않게).
# - 127.0.0.1 에서만 듣는다 (다른 PC 에서는 닿지 않음).
# - 대시보드 주소(https://juvilan.github.io)에서 온 요청만 받는다. 다른 웹사이트는 거절.
# - Claude Code 는 도구를 모두 끄고 실행한다 → 파일을 읽거나 고치거나 명령을 실행하지 못하고 대화만 한다.
# - Codex 도 명령 실행·앱·플러그인·웹 검색을 끄고, 읽기 전용·기록 없이(--ephemeral) 실행한다.
# 기능(대화 화면)은 대시보드 쪽에 있고, 이 도우미는 질문을 넘기고 답을 그대로 돌려주는 일만 한다.

$ErrorActionPreference = 'Stop'
$HelperVersion = 3
$Port = 47615
$Dir = Join-Path $env:LOCALAPPDATA 'SchoolDashboardAI'
$Work = Join-Path $Dir 'work'   # Claude Code 를 이 빈 폴더에서 실행 (다른 폴더의 설정·파일을 보지 않게)
New-Item -ItemType Directory -Force -Path $Work | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Dir 'codex-home') | Out-Null

$Allowed = @('https://juvilan.github.io')
if ($env:SDAI_EXTRA_ORIGIN) { $Allowed += $env:SDAI_EXTRA_ORIGIN }   # 시험용

$S = [hashtable]::Synchronized(@{
  Version = $HelperVersion
  Port    = $Port
  Allowed = $Allowed
  Work    = $Work
  CodexExe  = (Join-Path $Dir 'codex\bin\codex.exe')
  CodexHome = (Join-Path $Dir 'codex-home')
  Log     = (Join-Path $Dir 'helper.log')
  Login   = $null      # 로그인 진행 중인 claude 프로세스와 출력
  Chats   = 0          # 동시에 도는 대화 수
  StatusGen = 0        # 로그인·로그아웃마다 올림 (상태 기억 무효화)
  Lock    = (New-Object System.Object)
})

function Write-Log([string]$msg) {
  try {
    if ((Test-Path $S.Log) -and ((Get-Item $S.Log).Length -gt 1MB)) { Move-Item -Force $S.Log ($S.Log + '.old') }
    Add-Content -Path $S.Log -Encoding UTF8 -Value ((Get-Date -Format 's') + ' ' + $msg)
  } catch { }
}

# ---- 요청 하나를 처리 (연결마다 따로 도는 runspace 안에서) ----
$Handler = {
  param($Client, $S)
  $ErrorActionPreference = 'Stop'
  $utf8 = New-Object System.Text.UTF8Encoding($false)

  function Log([string]$m) {
    try { Add-Content -Path $S.Log -Encoding UTF8 -Value ((Get-Date -Format 's') + ' ' + $m) } catch { }
  }

  function Find-Claude {
    $p = Join-Path $env:USERPROFILE '.local\bin\claude.exe'
    if (Test-Path $p) { return $p }
    $c = Get-Command claude.exe -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    return $null
  }

  # 이 Codex 판에 있는 기능 이름 (없는 이름을 --disable 하면 Codex 가 오류로 멈춰서, 있는 것만 끈다). 파일이 바뀌면 다시 읽음
  function Codex-Features([string]$exe) {
    $stamp = (Get-Item -LiteralPath $exe).LastWriteTimeUtc.Ticks
    $c = $S.CxFeatures
    if ($c -and $c.Stamp -eq $stamp) { return $c.Names }
    $r = Invoke-Short $exe @('features', 'list') 30000
    $names = @{}
    foreach ($ln in ($r.out -split "`n")) { if ($ln -match '^([a-z0-9_]+)\s') { $names[$Matches[1]] = $true } }
    if ($names.Count -gt 0) { $S.CxFeatures = @{ Stamp = $stamp; Names = $names } }
    return $names
  }

  # ChatGPT 계정 정보: codex-home\auth.json 의 id_token(JWT) 가운데 부분에서 이메일·요금제만 읽는다
  function Codex-Account {
    try {
      $a = Get-Content -Raw -Encoding UTF8 (Join-Path $S.CodexHome 'auth.json') | ConvertFrom-Json
      $t = [string]$a.tokens.id_token
      if (-not $t) { return $null }
      $mid = $t.Split('.')[1].Replace('-', '+').Replace('_', '/')
      while ($mid.Length % 4) { $mid += '=' }
      $j = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($mid)) | ConvertFrom-Json
      $plan = ''
      try { $plan = [string]$j.'https://api.openai.com/auth'.chatgpt_plan_type } catch { }
      return @{ email = [string]$j.email; plan = $plan }
    } catch { return $null }
  }

  # 윈도우 명령줄 규칙대로 인자 하나를 따옴표로 감싼다 (빈 값, 공백, 따옴표, 역슬래시 안전)
  function Quote-Arg([string]$a) {
    if ($a.Length -gt 0 -and $a -notmatch '[\s"]') { return $a }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('"')
    $bs = 0
    foreach ($ch in $a.ToCharArray()) {
      if ($ch -eq '\') { $bs++ }
      elseif ($ch -eq '"') { [void]$sb.Append('\' * ($bs * 2 + 1)); [void]$sb.Append('"'); $bs = 0 }
      else { if ($bs) { [void]$sb.Append('\' * $bs) }; [void]$sb.Append($ch); $bs = 0 }
    }
    if ($bs) { [void]$sb.Append('\' * ($bs * 2)) }
    [void]$sb.Append('"')
    return $sb.ToString()
  }

  function New-ClaudeProcess([string]$exe, [string[]]$argv) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $exe
    $psi.Arguments = (($argv | ForEach-Object { Quote-Arg $_ }) -join ' ')
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.StandardOutputEncoding = $utf8
    $psi.StandardErrorEncoding = $utf8
    $psi.WorkingDirectory = $S.Work
    $psi.EnvironmentVariables['CODEX_HOME'] = $S.CodexHome   # Codex 는 이 도우미 폴더의 로그인·설정만 본다
    $psi.EnvironmentVariables['NO_COLOR'] = '1'
    return [System.Diagnostics.Process]::Start($psi)
  }

  function Stop-Tree($p) {
    try { if (-not $p.HasExited) { & taskkill.exe /PID $p.Id /T /F 2>&1 | Out-Null } } catch { }
  }

  # 짧은 명령을 실행하고 출력을 받는다 (시간 넘으면 끔)
  function Invoke-Short([string]$exe, [string[]]$argv, [int]$ms) {
    $p = New-ClaudeProcess $exe $argv
    $p.StandardInput.Close()
    $out = $p.StandardOutput.ReadToEndAsync()
    $err = $p.StandardError.ReadToEndAsync()
    if (-not $p.WaitForExit($ms)) { Stop-Tree $p; return @{ code = -1; out = ''; err = 'timeout' } }
    $p.WaitForExit()
    return @{ code = $p.ExitCode; out = $out.Result; err = $err.Result }
  }

  $stream = $null
  $origin = $null
  function Send-Raw([byte[]]$b) { $stream.Write($b, 0, $b.Length); $stream.Flush() }
  function Send-Head([int]$code, [string]$reason, [hashtable]$h) {
    $lines = @("HTTP/1.1 $code $reason", 'Cache-Control: no-store', 'Connection: close', 'X-Content-Type-Options: nosniff')
    if ($origin) { $lines += "Access-Control-Allow-Origin: $origin"; $lines += 'Vary: Origin' }
    foreach ($k in $h.Keys) { $lines += "${k}: $($h[$k])" }
    Send-Raw ([System.Text.Encoding]::ASCII.GetBytes(($lines -join "`r`n") + "`r`n`r`n"))
  }
  function Send-Json([int]$code, $obj) {
    $body = $utf8.GetBytes((ConvertTo-Json -InputObject $obj -Compress -Depth 5))
    $reason = @{ 200 = 'OK'; 202 = 'Accepted'; 400 = 'Bad Request'; 403 = 'Forbidden'; 404 = 'Not Found'; 409 = 'Conflict'; 413 = 'Too Large'; 429 = 'Too Many'; 500 = 'Error'; 503 = 'Unavailable' }[$code]
    Send-Head $code $reason @{ 'Content-Type' = 'application/json; charset=utf-8'; 'Content-Length' = $body.Length }
    Send-Raw $body
  }

  # 로그인 프로세스의 새 출력만 모은다 (기다리지 않음)
  function Pump-Login {
    $L = $S.Login
    if (-not $L) { return }
    foreach ($k in @('OutTask', 'ErrTask')) {
      while ($L[$k] -and $L[$k].IsCompleted) {
        $line = $L[$k].Result
        if ($null -eq $line) { $L[$k] = $null; break }
        [void]$L.Text.AppendLine($line)
        if ($L.Text.Length -gt 8000) { $L.Text.Remove(0, $L.Text.Length - 8000) | Out-Null }
        $L[$k] = if ($k -eq 'OutTask') { $L.Proc.StandardOutput.ReadLineAsync() } else { $L.Proc.StandardError.ReadLineAsync() }
      }
    }
  }
  function Login-State([string]$want) {
    [System.Threading.Monitor]::Enter($S.Lock)
    try { Pump-Login } finally { [System.Threading.Monitor]::Exit($S.Lock) }
    $L = $S.Login
    if ($L -and $want -and $L.Kind -ne $want) { return @{ running = $false } }   # 다른 쪽(Claude↔ChatGPT) 로그인은 보이지 않음
    # 10분이 지나도 끝나지 않은 로그인(창을 닫음 등)은 끈다 → 다시 누르면 새로 시작
    if ($L -and -not $L.Proc.HasExited -and ((Get-Date) - $L.Started).TotalMinutes -gt 10) { Stop-Tree $L.Proc; [void]$L.Proc.WaitForExit(3000) }
    if (-not $L) { return @{ running = $false } }
    $text = $L.Text.ToString()
    $url = $null
    $m = [regex]::Match($text, 'https://[^\s"''<>]+')
    $okUrl = if ($L.Kind -eq 'codex') { '^https://([a-z0-9-]+\.)*(openai\.com|chatgpt\.com)/' } else { '^https://([a-z0-9-]+\.)*(claude\.ai|claude\.com|anthropic\.com)/' }
    if ($m.Success -and $m.Value -match $okUrl) { $url = $m.Value }
    $running = -not $L.Proc.HasExited
    $r = @{ running = $running; url = $url; kind = $L.Kind; tail = $text.Substring([Math]::Max(0, $text.Length - 600)) }
    if (-not $running) { $r.exitCode = $L.Proc.ExitCode }
    return $r
  }

  try {
    $Client.ReceiveTimeout = 15000
    $Client.SendTimeout = 15000
    $stream = $Client.GetStream()

    # ---- 머리 읽기 ----
    $buf = New-Object byte[] 8192
    $ms = New-Object System.IO.MemoryStream
    $headEnd = -1
    $t0 = Get-Date
    while ($headEnd -lt 0) {
      if (((Get-Date) - $t0).TotalSeconds -gt 10) { return }   # 머리를 조금씩 늦게 보내 자리를 차지하는 연결 끊기
      $n = $stream.Read($buf, 0, $buf.Length)
      if ($n -le 0) { return }
      $ms.Write($buf, 0, $n)
      $all = $ms.ToArray()
      for ($i = [Math]::Max(0, $all.Length - $n - 3); $i -le $all.Length - 4; $i++) {
        if ($all[$i] -eq 13 -and $all[$i + 1] -eq 10 -and $all[$i + 2] -eq 13 -and $all[$i + 3] -eq 10) { $headEnd = $i; break }
      }
      if ($headEnd -lt 0 -and $ms.Length -gt 16384) { return }
    }
    $head = [System.Text.Encoding]::ASCII.GetString($all, 0, $headEnd) -split "`r`n"
    $reqLine = $head[0] -split ' '
    if ($reqLine.Count -ne 3) { return }
    $method = $reqLine[0]
    $path = $reqLine[1]
    $hd = @{}
    foreach ($l in ($head | Select-Object -Skip 1)) {
      $c = $l.IndexOf(':')
      if ($c -gt 0) { $hd[$l.Substring(0, $c).Trim().ToLowerInvariant()] = $l.Substring($c + 1).Trim() }
    }

    # ---- 누가 보냈는지 확인 ----
    # Host: DNS 리바인딩(다른 주소 이름으로 127.0.0.1 에 닿기) 막기
    if (@("127.0.0.1:$($S.Port)", "localhost:$($S.Port)") -notcontains $hd['host']) { Send-Json 403 @{ error = 'host' }; return }
    # Origin: 대시보드 주소에서 온 것만. Origin 이 없는 요청(이미지 태그, 다른 프로그램의 단순 요청 등)도 거절
    if ($S.Allowed -notcontains $hd['origin']) { Send-Json 403 @{ error = 'origin' }; return }
    $origin = $hd['origin']

    if ($method -eq 'OPTIONS') {
      Send-Head 204 'No Content' @{
        'Access-Control-Allow-Methods' = 'GET, POST'
        'Access-Control-Allow-Headers' = 'Content-Type'
        'Access-Control-Allow-Private-Network' = 'true'
        'Access-Control-Max-Age' = '600'
        'Content-Length' = '0'
      }
      return
    }

    # ---- 본문 ----
    $len = 0
    if ($hd['content-length']) {
      if ($hd['content-length'] -notmatch '^\d{1,9}$') { Send-Json 400 @{ error = 'length' }; return }
      $len = [int]$hd['content-length']
    }
    if ($len -gt 300000) { Send-Json 413 @{ error = 'too large' }; return }
    $bodyMs = New-Object System.IO.MemoryStream
    $have = $all.Length - ($headEnd + 4)
    if ($have -gt 0) { $bodyMs.Write($all, $headEnd + 4, [Math]::Min($have, $len)) }
    while ($bodyMs.Length -lt $len) {
      if (((Get-Date) - $t0).TotalSeconds -gt 30) { return }
      $n = $stream.Read($buf, 0, [Math]::Min($buf.Length, $len - $bodyMs.Length))
      if ($n -le 0) { return }
      $bodyMs.Write($buf, 0, $n)
    }
    $body = $null
    if ($len -gt 0) {
      try { $body = ConvertFrom-Json ($utf8.GetString($bodyMs.ToArray())) } catch { Send-Json 400 @{ error = 'json' }; return }
    }

    $claude = Find-Claude
    # /v1/codex/… 는 같은 일을 Codex(ChatGPT 구독)로. 물음표 뒤는 보지 않는다
    $path = ($path -split '\?', 2)[0]
    $kind = 'claude'
    if ($path -like '/v1/codex/*') { $kind = 'codex'; $path = '/v1/' + $path.Substring(10) }
    $codex = if (Test-Path -LiteralPath $S.CodexExe) { $S.CodexExe } else { $null }
    $exe = if ($kind -eq 'codex') { $codex } else { $claude }
    $noExe = if ($kind -eq 'codex') { 'no-codex' } else { 'no-claude' }

    # ---- 상태: 도우미 판, Claude Code 설치·로그인 여부 ----
    if ($method -eq 'GET' -and $path -eq '/v1/status') {
      # 몇 초 안에 또 물으면 claude 를 다시 띄우지 않고 앞의 답을 준다 (로그인·로그아웃 뒤에는 비움)
      $c = $S.StatusCache
      if ($c -and ((Get-Date) - $c.At).TotalSeconds -lt 5) { Send-Json 200 $c.R; return }
      $gen = $S.StatusGen
      $r = @{ helper = $S.Version; claude = [bool]$claude; loggedIn = $false; codex = [bool]$codex; codexLoggedIn = $false }
      if ($codex) {
        $cs = Invoke-Short $codex @('login', 'status') 20000
        $r.codexLoggedIn = ($cs.code -eq 0) -and (($cs.out + $cs.err) -match 'Logged in')
        if ($r.codexLoggedIn) { $acc = Codex-Account; if ($acc) { $r.codexEmail = $acc.email; $r.codexPlan = $acc.plan } }
      }
      if ($claude) {
        $v = Invoke-Short $claude @('--version') 20000
        $r.version = ($v.out -split "`n")[0].Trim()
        $a = Invoke-Short $claude @('auth', 'status', '--json') 20000
        try {
          $j = ConvertFrom-Json $a.out
          $r.loggedIn = [bool]$j.loggedIn
          $r.authMethod = [string]$j.authMethod
          $r.email = [string]$j.email
          $r.plan = [string]$j.subscriptionType
        } catch { $r.authError = ($a.err + $a.out).Trim() }
      }
      if ($S.StatusGen -eq $gen) { $S.StatusCache = @{ At = Get-Date; R = $r } }   # 그 사이 로그인·로그아웃이 있었으면 옛 값을 넣지 않음
      Send-Json 200 $r
      return
    }
    if ($path -like '/v1/log*') { $S.StatusGen++; $S.StatusCache = $null }

    # ---- 로그인: claude auth login 을 띄운다 (브라우저에 Claude 로그인 창이 열림) ----
    if ($path -eq '/v1/login') {
      if (-not $exe) { Send-Json 503 @{ error = $noExe }; return }
      if ($method -eq 'GET') { Send-Json 200 (Login-State $kind); return }
      if ($method -ne 'POST') { Send-Json 404 @{ error = 'not found' }; return }
      [System.Threading.Monitor]::Enter($S.Lock)
      try {
        $L = $S.Login
        if ($L -and -not $L.Proc.HasExited -and $L.Kind -ne $kind) { Stop-Tree $L.Proc; [void]$L.Proc.WaitForExit(3000); $L = $null }   # 다른 쪽 로그인 중이면 끄고
        if (-not $L -or $L.Proc.HasExited) {
          # Codex: 브라우저에 ChatGPT 로그인 창을 열고, 끝나면 이 PC(127.0.0.1:1455)로 돌아온다
          $largv = if ($kind -eq 'codex') { @('login') } else { @('auth', 'login', '--claudeai') }
          $p = New-ClaudeProcess $exe $largv
          $S.Login = @{
            Kind = $kind
            Proc = $p
            Text = New-Object System.Text.StringBuilder
            OutTask = $p.StandardOutput.ReadLineAsync()
            ErrTask = $p.StandardError.ReadLineAsync()
            Started = Get-Date
          }
          Log "login started ($kind)"
        }
      } finally { [System.Threading.Monitor]::Exit($S.Lock) }
      Start-Sleep -Milliseconds 1500
      Send-Json 202 (Login-State $kind)
      return
    }
    # 로그인 창이 "코드를 붙여넣으세요"를 물을 때 대시보드에서 받은 코드를 넘긴다
    if ($method -eq 'POST' -and $path -eq '/v1/login/code') {
      $L = $S.Login
      $code = [string]$body.code
      if (-not $L -or $L.Proc.HasExited -or $L.Kind -ne $kind) { Send-Json 409 @{ error = 'no-login' }; return }
      if ($code.Length -lt 4 -or $code.Length -gt 2000 -or $code -match '[\r\n]') { Send-Json 400 @{ error = 'code' }; return }
      $L.Proc.StandardInput.WriteLine($code)
      $L.Proc.StandardInput.Flush()
      Start-Sleep -Milliseconds 1500
      Send-Json 200 (Login-State $kind)
      return
    }
    if ($method -eq 'POST' -and $path -eq '/v1/login/cancel') {
      [System.Threading.Monitor]::Enter($S.Lock)
      try {
        $L = $S.Login
        if ($L -and $L.Kind -eq $kind) { Stop-Tree $L.Proc; [void]$L.Proc.WaitForExit(3000); $S.Login = $null }
      } finally { [System.Threading.Monitor]::Exit($S.Lock) }
      Send-Json 200 @{ ok = $true }
      return
    }
    # 대시보드에서 "지난 대화 모두 지우기"를 하면 Claude Code 가 PC 에 남긴 이 도우미의 대화 기록도 지운다
    if ($method -eq 'POST' -and $path -eq '/v1/forget') {
      $n = 0
      $root = Join-Path $env:USERPROFILE '.claude\projects'
      if (Test-Path $root) {
        Get-ChildItem -Path $root -Directory | Where-Object { $_.Name -like '*SchoolDashboardAI-work' } | ForEach-Object {
          Get-ChildItem -Path $_.FullName -Force | ForEach-Object { Remove-Item -Recurse -Force -LiteralPath $_.FullName -ErrorAction SilentlyContinue; $n++ }
        }
      }
      Send-Json 200 @{ ok = $true; removed = $n }
      return
    }
    if ($method -eq 'POST' -and $path -eq '/v1/logout') {
      if (-not $exe) { Send-Json 503 @{ error = $noExe }; return }
      $largv = if ($kind -eq 'codex') { @('logout') } else { @('auth', 'logout') }
      $r = Invoke-Short $exe $largv 20000
      Send-Json 200 @{ ok = ($r.code -eq 0) }
      return
    }

    # ---- 대화: 질문 하나를 넘기고, Claude Code 의 출력(stream-json 줄)을 그대로 흘려보낸다 ----
    if ($method -eq 'POST' -and $path -eq '/v1/chat') {
      if (-not $exe) { Send-Json 503 @{ error = $noExe }; return }
      $message = [string]$body.message
      $session = [string]$body.session
      $system = [string]$body.system
      $model = [string]$body.model
      if ($message.Trim().Length -eq 0 -or $message.Length -gt 100000) { Send-Json 400 @{ error = 'message' }; return }
      if ($session -and ($kind -eq 'codex' -or $session -notmatch '^[0-9a-fA-F-]{36}$')) { Send-Json 400 @{ error = 'session' }; return }
      if ($model -and $model -notmatch '^[a-z0-9][a-z0-9.\-\[\]]{0,60}$') { Send-Json 400 @{ error = 'model' }; return }
      if ($system.Length -gt 8000) { Send-Json 400 @{ error = 'system' }; return }

      $taken = $false
      [System.Threading.Monitor]::Enter($S.Lock)
      try { if ($S.Chats -lt 2) { $S.Chats++; $taken = $true } } finally { [System.Threading.Monitor]::Exit($S.Lock) }
      if (-not $taken) { Send-Json 429 @{ error = 'busy' }; return }
      $p = $null
      $headSent = $false
      try {
        if ($kind -eq 'codex') {
          # 명령 실행(셸·코드 모드)·앱·플러그인·브라우저·웹 검색 끔, 읽기 전용, 기록 남기지 않음 → 대화만.
          # 이어 묻기는 대시보드가 앞 대화를 글로 함께 보낸다. 지시문은 질문 앞에 붙인다 (exec 에는 따로 넣는 칸이 없음)
          $argv = @('exec', '--json', '--ephemeral', '--skip-git-repo-check', '--ignore-user-config', '--ignore-rules',
            '-s', 'read-only', '--color', 'never', '-C', $S.Work)
          $have = Codex-Features $exe
          # 명령을 실행하는 기능(셸·코드 모드)은 꼭 꺼야 한다: 목록을 못 읽었으면 그대로 넣어 본다
          foreach ($f in @('shell_tool', 'unified_exec', 'code_mode_host', 'code_mode', 'apps', 'plugins', 'browser_use', 'computer_use',
              'hooks', 'skill_search', 'tool_suggest', 'multi_agent', 'multi_agent_v2', 'goals', 'image_generation', 'memories')) {
            if ($have.Count -eq 0 -or $have.ContainsKey($f)) { $argv += @('--disable', $f) }
          }
          # 그림 보기 도구도 끈다 (파일을 읽을 수 있는 도구). 모르는 설정은 Codex 가 경고만 하고 넘어간다
          $argv += @('-c', 'web_search="disabled"', '-c', 'tools.view_image=false', '-c', 'model_reasoning_effort="low"', '-')
          if ($system) { $message = "[지시]`n$system`n`n[선생님 질문]`n$message" }
        } else {
          # 도구 없음(--tools ""), 이 PC 의 설정·MCP·명령 무시 → 대화만
          $argv = @('-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
            '--tools', '', '--setting-sources', '', '--strict-mcp-config', '--disable-slash-commands')
          if ($system) { $argv += @('--system-prompt', $system) }
          if ($session) { $argv += @('--resume', $session) }
          if ($model) { $argv += @('--model', $model) }
        }
        $p = New-ClaudeProcess $exe $argv
        $in = $utf8.GetBytes($message)
        $p.StandardInput.BaseStream.Write($in, 0, $in.Length)
        $p.StandardInput.Close()
        $errTask = $p.StandardError.ReadToEndAsync()

        Send-Head 200 'OK' @{ 'Content-Type' = 'application/x-ndjson; charset=utf-8' }
        $headSent = $true
        $started = Get-Date
        $sawResult = $false
        $task = $p.StandardOutput.ReadLineAsync()
        while ($true) {
          if (-not $task.Wait(1000)) {
            # 대시보드가 끊었거나(멈춤·창 닫기) 10분이 넘으면 끈다
            $gone = $Client.Client.Poll(0, [System.Net.Sockets.SelectMode]::SelectRead) -and $Client.Available -eq 0
            if ($gone -or ((Get-Date) - $started).TotalMinutes -gt 10) { Stop-Tree $p; return }
            continue
          }
          $line = $task.Result
          if ($null -eq $line) { break }
          if (((Get-Date) - $started).TotalMinutes -gt 10) { Stop-Tree $p; return }
          if ($line -match '^\{"type":"(result|turn\.completed|turn\.failed)"') { $sawResult = $true }
          Send-Raw ($utf8.GetBytes($line + "`n"))
          $task = $p.StandardOutput.ReadLineAsync()
        }
        [void]$p.WaitForExit(5000)
        if (-not $sawResult) {
          $err = ''
          if ($errTask.Wait(2000)) { $err = $errTask.Result }
          if ($err.Length -gt 2000) { $err = $err.Substring($err.Length - 2000) }
          $code = $null
          if ($p.HasExited) { $code = $p.ExitCode }
          Send-Raw ($utf8.GetBytes((ConvertTo-Json -InputObject @{ type = 'helper_error'; exitCode = $code; stderr = $err } -Compress) + "`n"))
        }
      } catch {
        Log ('chat: ' + $_.Exception.Message)
        if ($p) { Stop-Tree $p }
        try {
          $who = if ($kind -eq 'codex') { 'Codex' } else { 'Claude Code' }
          $e = (ConvertTo-Json -InputObject @{ type = 'helper_error'; stderr = ("도우미가 $who 를 실행하지 못했어요: " + $_.Exception.Message) } -Compress) + "`n"
          if (-not $headSent) { Send-Head 200 'OK' @{ 'Content-Type' = 'application/x-ndjson; charset=utf-8' } }
          Send-Raw ($utf8.GetBytes($e))
        } catch { }
      } finally {
        if ($p) {
          if (-not $p.HasExited) { Stop-Tree $p; [void]$p.WaitForExit(3000) }
          $p.Dispose()
        }
        [System.Threading.Monitor]::Enter($S.Lock)
        try { $S.Chats-- } finally { [System.Threading.Monitor]::Exit($S.Lock) }
      }
      return
    }

    Send-Json 404 @{ error = 'not found' }
  } catch {
    Log ('error: ' + $_.Exception.Message)
  } finally {
    try { $Client.Close() } catch { }
  }
}

# ---- 듣기 ----
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.ExclusiveAddressUse = $true
try { $listener.Start() } catch {
  Write-Log "port $Port busy (already running?)"
  exit 0
}
Write-Log "helper v$HelperVersion listening on 127.0.0.1:$Port"

$pool = [runspacefactory]::CreateRunspacePool(1, 12)
$pool.Open()
$jobs = New-Object System.Collections.ArrayList
while ($true) {
  try {
    $client = $listener.AcceptTcpClient()
    # 끝난 일 치우기
    for ($i = $jobs.Count - 1; $i -ge 0; $i--) {
      $j = $jobs[$i]
      if ($j.H.IsCompleted) {
        try { [void]$j.PS.EndInvoke($j.H) } catch { Write-Log ('job: ' + $_.Exception.Message) }
        $j.PS.Dispose()
        $jobs.RemoveAt($i)
      }
    }
    # 처리 중인 연결이 너무 많으면 새 연결은 바로 닫음
    if ($jobs.Count -ge 40) { $client.Close(); continue }
    $ps = [powershell]::Create()
    $ps.RunspacePool = $pool
    [void]$ps.AddScript($Handler).AddArgument($client).AddArgument($S)
    [void]$jobs.Add(@{ PS = $ps; H = $ps.BeginInvoke() })
  } catch {
    Write-Log ('accept: ' + $_.Exception.Message)
    Start-Sleep -Milliseconds 500
  }
}
