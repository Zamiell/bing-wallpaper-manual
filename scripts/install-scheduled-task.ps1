# Exit on errors and undefined.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ProjectPath = Split-Path -Parent $PSScriptRoot
$ProjectName = Split-Path $ProjectPath -Leaf

$TaskName = $ProjectName
# We use "cmd.exe" instead of invoking the executable directly to avoid having a black terminal
# window show on the screen. The first argument is the window title.
$Action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/C start /min `"$ProjectName`" `"$ProjectPath\dist\$ProjectName.exe`"" `
    -WorkingDirectory $ProjectPath
$Time = "3:05AM" # 5 minutes after the upstream rotation.
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -WakeToRun

# "-Force" overwrites the task if it already exists.
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Force `
    -ErrorAction "Stop"

Write-Host "Successfully installed scheduled task `"$TaskName`". It will run daily at: $Time"
