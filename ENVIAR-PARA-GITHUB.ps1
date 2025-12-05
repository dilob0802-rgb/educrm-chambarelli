# Script para enviar código para o GitHub
# Execute este arquivo no PowerShell

Write-Host "Enviando código para o GitHub..." -ForegroundColor Green

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - CRM Chambarelli"

# Adicionar repositório remoto
git remote add origin https://github.com/dilob0802-rgb/crm-chambarelli.git

# Renomear branch para main
git branch -M main

# Enviar para o GitHub
git push -u origin main

Write-Host ""
Write-Host "Código enviado com sucesso!" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
