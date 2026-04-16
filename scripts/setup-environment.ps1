# MMAPPS Environment Setup Script
# Use este script para inicializar ou atualizar as ferramentas de desenvolvimento globais.

function Show-Step($Message) {
    Write-Host "`n--- $Message ---" -ForegroundColor Cyan
}

# 1. Verificar/Instalar Scoop
Show-Step "Verificando Scoop (Gerenciador de Pacotes)"
if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
    Write-Host "Scoop não encontrado. Instalando..."
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    iex (Invoke-RestMethod get.scoop.sh)
} else {
    Write-Host "Scoop já está instalado."
}

# Adicionar scoop ao path da sessão atual para garantir que os próximos comandos funcionem
$env:PATH += ";$env:USERPROFILE\scoop\shims"

# 2. Adicionar Buckets Necessários
Show-Step "Atualizando Repositórios (Buckets)"
scoop bucket add java 2>$null
scoop bucket add extras 2>$null
scoop update

# 3. Instalar/Atualizar Ferramentas Essenciais
Show-Step "Instalando/Atualizando Ferramentas"
$tools = @("openjdk21", "adb", "bun")
foreach ($tool in $tools) {
    if (!(scoop list $tool | Select-String $tool)) {
        Write-Host "Instalando $tool..."
        scoop install $tool
    } else {
        Write-Host "$tool já está instalado. Verificando atualizações..."
        scoop update $tool
    }
}

# 4. Configuração de Variáveis de Ambiente (Sessão)
Show-Step "Configurando Variáveis de Ambiente"
$javaPath = scoop prefix openjdk21
$env:JAVA_HOME = $javaPath
Write-Host "JAVA_HOME configurado temporariamente para: $javaPath"

Show-Step "Setup Concluído!"
Write-Host "Recomenda-se reiniciar o terminal para aplicar todas as mudanças permanentemente." -ForegroundColor Green
Write-Host "Comandos agora disponíveis: scoop, java, adb, bun"
