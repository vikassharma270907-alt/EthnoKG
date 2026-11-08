# ========================================================
# EthnoKG: Automatic GitHub Repository Synchronizer
# Usage: powershell -ExecutionPolicy Bypass -File scripts\sync-repo.ps1 [commit_message]
# ========================================================

param(
    [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔄 [EthnoKG Auto-Sync] Checking repository state..." -ForegroundColor Cyan

# Ensure in git repo
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "✅ Working directory clean. Checking for unpushed commits..." -ForegroundColor Green
    git push origin main
    Write-Host "🚀 Everything is up to date on origin/main!" -ForegroundColor Green
    exit 0
}

Write-Host "📦 Found pending modifications / additions. Staging all changes..." -ForegroundColor Yellow
git add -A

if (-not $CommitMessage) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $CommitMessage = "chore: sync project files and data ($timestamp)"
}

Write-Host "💾 Committing changes: '$CommitMessage'..." -ForegroundColor Yellow
git commit -m "$CommitMessage"

Write-Host "🚀 Pushing to GitHub (origin/main)..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Successfully synchronized all data and files to GitHub!" -ForegroundColor Green
Write-Host "🔗 https://github.com/vikassharma270907-alt/EthnoKG`n" -ForegroundColor DarkCyan
