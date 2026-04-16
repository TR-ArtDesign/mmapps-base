# MMApps - Mobile Framework

Framework modular para criacao de jogos e aplicativos mobile focados em retencao e monetizacao offline-first.

## Estrutura do Projeto

- base/template-app: O esqueleto padrao para novos aplicativos.
- apps/: Onde residem os aplicativos finais (ex: aktion-tap).
- scripts/: Utilitarios de automacao.

## Como Criar um Novo App

### 1. Clonar o Template
Copie a pasta base para o diretorio de apps:
Copy-Item -Recurse base/template-app apps/nome-do-seu-app

### 2. Inicializacao Automatica (Flexivel)
Execute o script de setup passando o nome do app e, opcionalmente, a categoria (default: games):
node scripts/setup-app.js nome-do-seu-app [categoria]

Exemplos:
- node scripts/setup-app.js aktion-tap games
- node scripts/setup-app.js focus-timer tools
- node scripts/setup-app.js bible-verse spiritual

## Execucao
cd apps/nome-do-seu-app
npx react-native run-android

