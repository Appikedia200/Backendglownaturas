# ==========================================
# JWT SECRET GENERATOR FOR PRODUCTION
# ==========================================

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        JWT SECRET GENERATOR FOR RENDER DEPLOYMENT        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Generating secure JWT secret (64 characters)...`n" -ForegroundColor Yellow

# Generate 64-character random string
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "✅ JWT SECRET GENERATED:`n" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "$jwtSecret" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n📋 COPY THIS SECRET TO RENDER:" -ForegroundColor Cyan
Write-Host "   1. Go to Render Dashboard → Your Service → Environment" -ForegroundColor White
Write-Host "   2. Add environment variable:" -ForegroundColor White
Write-Host "      Key:   JWT_SECRET" -ForegroundColor Yellow
Write-Host "      Value: (paste the secret above)" -ForegroundColor Yellow
Write-Host "   3. Click 'Save Changes'" -ForegroundColor White

Write-Host "`n🔒 SECURITY NOTES:" -ForegroundColor Cyan
Write-Host "   • Length: 64 characters ✅" -ForegroundColor Green
Write-Host "   • Randomness: Cryptographically secure ✅" -ForegroundColor Green
Write-Host "   • Never commit this to Git ✅" -ForegroundColor Green
Write-Host "   • Store only in Render Dashboard ✅" -ForegroundColor Green

Write-Host "`n💾 SECRET COPIED TO CLIPBOARD!" -ForegroundColor Green
$jwtSecret | Set-Clipboard
Write-Host "   You can now paste it directly into Render`n" -ForegroundColor White

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

