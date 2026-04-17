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
    Invoke-Expression (Invoke-RestMethod get.scoop.sh)
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
$javaPath = (scoop prefix openjdk21 2>$null)
if ($javaPath) {
    $env:JAVA_HOME = $javaPath
    Write-Host "JAVA_HOME configurado temporariamente para: $javaPath"
}

# 5. Reparo Automático de Binários (Corrupção de Git no Windows)
function Repair-AppEnv($AppPath, $GradleVersion = "8.0.1") {
    Show-Step "Reparando Ambiente em: $AppPath"
    
    # Corrigir Gradle Wrapper JAR
    $wrapperPath = "$AppPath\android\gradle\wrapper"
    if (Test-Path $wrapperPath) {
        Write-Host "Limpando e recuperando Gradle Wrapper ($GradleVersion)..."
        Remove-Item -Force "$wrapperPath\gradle-wrapper.jar" -ErrorAction SilentlyContinue
        $url = "https://raw.githubusercontent.com/gradle/gradle/v$GradleVersion/gradle/wrapper/gradle-wrapper.jar"
        Invoke-WebRequest -Uri $url -OutFile "$wrapperPath\gradle-wrapper.jar"
    }

    # Corrigir Keystore Corrompida
    $keystorePath = "$AppPath\android\app\debug.keystore"
    Write-Host "Verificando integridade da Keystore..."
    try {
        # Tenta listar para ver se está corrompido
        keytool -list -keystore $keystorePath -storepass android -alias androiddebugkey 2>$null
        if ($LASTEXITCODE -ne 0) { throw "Corrupt" }
    } catch {
        Write-Host "Keystore ausente ou corrompida. Regenerando..." -ForegroundColor Yellow
        Remove-Item -Force $keystorePath -ErrorAction SilentlyContinue
        keytool -genkey -v -keystore $keystorePath -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    }
}

# Se o script for chamado com um argumento de caminho, executa o reparo
if ($args[0] -eq "repair" -and $args[1]) {
    Repair-AppEnv $args[1]
}

Show-Step "Setup Concluído!"
Write-Host "Recomenda-se reiniciar o terminal para aplicar todas as mudanças permanentemente." -ForegroundColor Green
Write-Host "Comandos agora disponíveis: scoop, java, adb, bun"
