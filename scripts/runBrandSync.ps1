# Brand Sync Script
# Run this ONCE after deployment to sync brands from products

Write-Host "🔐 Please enter your admin credentials:" -ForegroundColor Cyan
$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host "`n🔐 Logging in..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod -Uri "https://backendglownaturas.onrender.com/api/auth/login" -Method POST -Body (@{email=$email; password=$passwordPlain} | ConvertTo-Json) -ContentType "application/json"
    $token = $login.data.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Running Brand Sync..." -ForegroundColor Yellow
try {
    $sync = Invoke-RestMethod -Uri "https://backendglownaturas.onrender.com/api/brands/sync" -Method POST -Headers @{Authorization="Bearer $token"} -ContentType "application/json"
    
    Write-Host "`n✅ BRAND SYNC SUCCESSFUL!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Message: $($sync.data.message)" -ForegroundColor Cyan
    Write-Host "Created: $($sync.data.created) brands" -ForegroundColor Cyan
    Write-Host "Updated: $($sync.data.updated) brands" -ForegroundColor Cyan
    Write-Host "Total: $($sync.data.total) brands" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    Write-Host "`n📊 Fetching brands list..." -ForegroundColor Yellow
    $brands = Invoke-RestMethod -Uri "https://backendglownaturas.onrender.com/api/brands?limit=20" -Method GET
    
    Write-Host "`n✅ Total brands in database: $($brands.data.total)" -ForegroundColor Green
    
    Write-Host "`n📋 Sample brands:" -ForegroundColor Cyan
    $brands.data.brands | Select-Object -First 10 | ForEach-Object {
        Write-Host "  • $($_.name) - $($_.productCount) products [Letter: $($_.firstLetter)]" -ForegroundColor White
    }
    
    if ($brands.data.brandsByLetter) {
        Write-Host "`n🔤 Brands by letter:" -ForegroundColor Cyan
        $brands.data.brandsByLetter.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value.Count) brands" -ForegroundColor White
        }
    }
    
    Write-Host "`n🎉 Brand system is now fully operational!" -ForegroundColor Green
    Write-Host "Frontend can now use: GET /api/brands" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Brand sync failed: $_" -ForegroundColor Red
    exit 1
}

