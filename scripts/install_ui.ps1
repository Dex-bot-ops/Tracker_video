Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath
Set-Location $scriptDir

$form = New-Object System.Windows.Forms.Form
$form.Text = "Tracker Video - Installation"
$form.Size = New-Object System.Drawing.Size(450,200)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $False
$form.MinimizeBox = $False
$form.BackColor = [System.Drawing.Color]::White

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "Installation des dependances IA et video..."
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$lblTitle.AutoSize = $True
$lblTitle.Location = New-Object System.Drawing.Point(20,20)
$form.Controls.Add($lblTitle)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(20,60)
$progressBar.Size = New-Object System.Drawing.Size(390,20)
$progressBar.Style = "Marquee"
$form.Controls.Add($progressBar)

$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "Veuillez patienter pendant la configuration (cela peut prendre quelques minutes)..."
$lblStatus.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$lblStatus.AutoSize = $True
$lblStatus.Location = New-Object System.Drawing.Point(20,90)
$form.Controls.Add($lblStatus)

$btnLaunch = New-Object System.Windows.Forms.Button
$btnLaunch.Text = "Lancer l'application"
$btnLaunch.Size = New-Object System.Drawing.Size(150,30)
$btnLaunch.Location = New-Object System.Drawing.Point(140,120)
$btnLaunch.Visible = $False
$btnLaunch.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$btnLaunch.ForeColor = [System.Drawing.Color]::White
$btnLaunch.FlatStyle = "Flat"
$btnLaunch.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($btnLaunch)

$btnLog = New-Object System.Windows.Forms.Button
$btnLog.Text = "Voir les erreurs"
$btnLog.Size = New-Object System.Drawing.Size(150,30)
$btnLog.Location = New-Object System.Drawing.Point(140,120)
$btnLog.Visible = $False
$btnLog.BackColor = [System.Drawing.Color]::DarkRed
$btnLog.ForeColor = [System.Drawing.Color]::White
$btnLog.FlatStyle = "Flat"
$btnLog.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($btnLog)

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1000

$process = $null

$timer.Add_Tick({
    if ($process -ne $null -and $process.HasExited) {
        $timer.Stop()
        $progressBar.Style = "Blocks"
        $progressBar.Value = 100
        
        $fastapiDir = Join-Path $scriptDir "python\Lib\site-packages\fastapi"
        
        if ($process.ExitCode -eq 0 -and (Test-Path $fastapiDir)) {
            $lblStatus.Text = "Installation terminee avec succes !"
            $btnLaunch.Visible = $True
        } else {
            $lblStatus.Text = "Une erreur est survenue lors de l'installation."
            $lblStatus.ForeColor = [System.Drawing.Color]::Red
            $btnLog.Visible = $True
        }
    }
})

$form.Add_Shown({
    $installBat = Join-Path $scriptDir "install_silent.bat"
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $installBat
    $psi.UseShellExecute = $False
    $psi.CreateNoWindow = $True
    
    $global:process = [System.Diagnostics.Process]::Start($psi)
    $timer.Start()
})

$btnLaunch.Add_Click({
    $form.Close()
    $vbsPath = Join-Path $scriptDir "Lancer_app.vbs"
    Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`""
})

$btnLog.Add_Click({
    $logPath = Join-Path $scriptDir "install.log"
    if (Test-Path $logPath) {
        Start-Process "notepad.exe" -ArgumentList "`"$logPath`""
    }
})

[System.Windows.Forms.Application]::Run($form)
