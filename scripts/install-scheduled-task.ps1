# Exit on errors and undefined.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ProjectPath = Split-Path -Parent $PSScriptRoot
$ProjectName = Split-Path $ProjectPath -Leaf

$TaskName = $ProjectName
$Action = New-ScheduledTaskAction `
    -Execute "$ProjectPath\dist\$ProjectName.exe" `
    -WorkingDirectory $ProjectPath
$Time = "3:05AM"
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -WakeToRun

# "-Force" overwrites it if it already exists.
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Force

Write-Host "Successfully installed scheduled task `"$TaskName`". It will run daily at: $Time"
