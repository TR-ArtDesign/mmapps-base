# 🧠 MMAPPS — Contexto e Regras do Projeto

Este arquivo contém as diretrizes mestras para o desenvolvimento do ecossistema MMAPPS. Ele deve ser lido por qualquer agente de IA antes de iniciar as tarefas.

---

## 🛠️ Auto-Cura de Ambiente (Self-Healing)

**Regra de Ouro:** Se um comando falhar por falta de dependências de sistema (Java, Android SDK, Bun, etc.), o agente tem permissão para:

1. Executar o script `./scripts/setup-environment.ps1` automaticamente.
2. Retentar a tarefa original após o setup.

---

## 📂 Organização do Repositório

* `/apps`: Contém os mini-apps individuais (ex: `aktion-tap`). Cada app possui seu próprio Roadmap.
* `/scripts`: Automações globais do projeto.
* `/base`: Templates e componentes compartilhados.

---

## 🧪 Fluxo de Testes (MuMu Player)

O emulador padrão utilizado é o **MuMu Player**.

* Sempre tente conectar via ADB na porta `7555` (ou as portas de incremento do MuMu 12 se necessário) antes de reportar falha de conexão com dispositivo.

---

## 📜 Regras de Execução

1. Priorizar o uso do **Bun** em vez do NPM para instalações e execuções de scripts.
2. Manter os Roadmaps de cada app atualizados após cada Sprint concluída.
