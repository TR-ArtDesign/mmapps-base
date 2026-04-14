# Template App - MMApps

Base project for generating casual retention-focused mobile apps.

## Features
- Zustand state management
- Offline-first structure
- Modular architecture
- Ready for AdMob integration

## Usage

Copy this template to create new apps:

PowerShell:
Copy-Item -Recurse template-app ../apps/new-app
## ?? Execução e Troubleshooting

### Se estiver usando Android:
`powershell
npx react-native run-android
``n
### Se der erro de dependência (ou para configurar iOS):
`powershell
npx pod-install
``
