@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-repo.ps1" %*
