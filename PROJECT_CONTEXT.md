# 🧠 MMAPPS — Contexto e Regras do Projeto

Este arquivo contém as diretrizes mestras para o desenvolvimento do ecossistema MMAPPS. Ele deve ser lido por qualquer agente de IA antes de iniciar as tarefas.

---

## 🛠️ Auto-Cura de Ambiente (Self-Healing)

**Regra de Ouro:** Se um comando falhar por falta de dependências de sistema (Java, Android SDK, Bun, etc.), o agente tem permissão para:

1. Executar o script `./scripts/setup-environment.ps1` automaticamente (use o argumento `repair "caminho/do/app"` se o erro for no Gradle ou Keystore).
2. Retentar a tarefa original após o setup.

---

## 📂 Organização do Repositório

* `/apps`: Contém os mini-apps individuais (ex: `aktion-tap`). Cada app possui seu próprio Roadmap.
* `/scripts`: Automações globais do projeto.
* `/base`: Templates e componentes compartilhados.

---

## 🧪 Fluxo de Testes (Emuladores)

Os emuladores padrão utilizados podem ser o **MuMu Player** ou o **ReDroid**, dependendo da máquina (workspace) atual.

* **MuMu Player**: Sempre tente conectar via ADB na porta `127.0.0.1:7555` (ou nas portas de incremento do MuMu 12 se necessário).
* **ReDroid**: Tente conectar via ADB no IP remoto apropriado (ex: `10.10.0.52:5555`).

Sempre verifique com `adb devices` para garantir que o respectivo emulador está conectado antes de reportar falha de conexão.

---

## 📜 Regras de Execução

1. Priorizar o uso do **Bun** em vez do NPM para instalações e execuções de scripts.
2. Manter os Roadmaps de cada app atualizados após cada Sprint concluída.
