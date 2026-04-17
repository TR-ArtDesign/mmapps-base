# 🛠️ MMAPPS — Guia de Ambiente

Este documento descreve as ferramentas necessárias para desenvolver e testar os mini-apps deste projeto.

## 🚀 Setup Rápido

Para configurar ou atualizar todas as ferramentas necessárias (Java, ADB, Bun), execute o script de automação via PowerShell:

```powershell
./scripts/setup-environment.ps1
```

### 🔧 Reparar Binários Corrompidos (Git/Windows)
Se o app falhar ao compilar Android devido a arquivos `.jar` ou `.keystore` corrompidos após um `git pull`:
```powershell
./scripts/setup-environment.ps1 repair "apps/aktion-tap"
```
---

## 📦 Gerenciador de Pacotes (Scoop)

Utilizamos o **Scoop** para gerenciar dependências de sistema sem precisar de permissões de Administrador.

### Comandos Úteis do Scoop:
*   `scoop update *` : Atualiza todos os programas instalados.
*   `scoop install <app>` : Instala um novo programa.
*   `scoop search <app>` : Busca programas disponíveis.

---

## 📱 Emuladores (MuMu Player ou ReDroid)

Para testar os apps, você pode utilizar o **MuMu Player** ou o **ReDroid** (que estiver rodando na sua máquina atual). Garanta que o ADB esteja conectado ao respectivo emulador.

### Conectar ao MuMu Player:
1. Abra o MuMu Player.
2. No PowerShell, execute:
   ```powershell
   adb connect 127.0.0.1:7555
   ```
   *(Nota: Se usar o MuMu 12, verifique a porta nas configurações de desenvolvedor do emulador).*

### Conectar ao ReDroid (Atual):
1. Verifique se a instância do ReDroid (ex.: `redroid12_x86_64_only`) está rodando/espelhada via `scrcpy`.
2. No PowerShell, conecte via IP:
   ```powershell
   adb connect 10.10.0.52:5555
   ```

### Verificação Comum:
Independente de qual emulador estiver usando, você pode verificar a conexão com:
```powershell
adb devices
```

---

## ☕ Java (Red Hat / OpenJDK)

O projeto utiliza o **OpenJDK 21**. 
*   **JAVA_HOME**: Deve apontar para a pasta do JDK instalado pelo scoop (geralmente em `~/scoop/apps/openjdk21/current`).
