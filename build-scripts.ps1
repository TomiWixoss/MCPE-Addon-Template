# Build TypeScript (chạy ở project root)
Set-Location ../..
npm run build

# Copy compiled scripts vào packs/BP/scripts
$sourcePath = "./dist/scripts"
$destPath = "./packs/BP/scripts"

if (Test-Path $sourcePath) {
    # Xóa thư mục cũ nếu có
    if (Test-Path $destPath) {
        Remove-Item -Path $destPath -Recurse -Force
    }
    
    # Copy thư mục scripts
    Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
    Write-Host "Scripts copied successfully from $sourcePath to $destPath"
} else {
    Write-Error "Source path $sourcePath not found!"
    exit 1
}
