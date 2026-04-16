# 🛠️ MMAPPS — Guia de Ambiente

Este documento descreve as ferramentas necessárias para desenvolver e testar os mini-apps deste projeto.

## 🚀 Setup Rápido

Para configurar ou atualizar todas as ferramentas necessárias (Java, ADB, Bun), execute o script de automação via PowerShell:

```powershell
./scripts/setup-environment.ps1
```

---

## 📦 Gerenciador de Pacotes (Scoop)

Utilizamos o **Scoop** para gerenciar dependências de sistema sem precisar de permissões de Administrador.

### Comandos Úteis do Scoop:
*   `scoop update *` : Atualiza todos os programas instalados.
*   `scoop install <app>` : Instala um novo programa.
*   `scoop search <app>` : Busca programas disponíveis.

---

## 📱 Emulador (MuMu Player)

Para testar os apps no MuMu Player, você precisa garantir que o ADB esteja conectado:

### Conectar ao MuMu:
1. Abra o MuMu Player.
2. No PowerShell, execute:
   ```powershell
   adb connect 127.0.0.1:7555
   ```
   *(Nota: Se usar o MuMu 12, verifique a porta nas configurações de desenvolvedor do emulador).*

3. Verifique a conexão:
   ```powershell
   adb devices
   ```

---

## ☕ Java (Red Hat / OpenJDK)

O projeto utiliza o **OpenJDK 21**. 
*   **JAVA_HOME**: Deve apontar para a pasta do JDK instalado pelo scoop (geralmente em `~/scoop/apps/openjdk21/current`).
