const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuração base da organização
const NAMESPACE_ROOT = 'com.mmapps';

const appName = process.argv[2];
const appType = process.argv[3] || 'games'; // Default para 'games' se não especificado

if (!appName) {
  console.error('Usage: node scripts/setup-app.js <app-name> [app-type]');
  console.error('Example: node scripts/setup-app.js aktion-tap games');
  process.exit(1);
}

const appPath = path.resolve(__dirname, '..', 'apps', appName);
const packageJsonPath = path.join(appPath, 'package.json');
const appJsonPath = path.join(appPath, 'app.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: package.json not found at ${packageJsonPath}`);
  console.error(`Make sure you copied the template to apps/${appName} first.`);
  process.exit(1);
}

function formatDisplayName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateBundleId(name, type) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Estrutura dinâmica: root.type.appname
  return `${NAMESPACE_ROOT}.${cleanType}.${cleanName}`;
}

console.log(`\n🚀 Initializing dynamic customization for: ${appName}`);
console.log(`📁 Namespace: ${NAMESPACE_ROOT}.${appType}`);
console.log(`--------------------------------------------------`);

try {
  // 1. Update package.json
  console.log(`📝 Updating package.json...`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = appName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Package name set to "${appName}"`);

  // 2. Update app.json
  if (fs.existsSync(appJsonPath)) {
    console.log(`📱 Updating app.json...`);
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const displayName = formatDisplayName(appName);
    const bundleId = generateBundleId(appName, appType);
    
    appJson.name = appName;
    appJson.displayName = displayName;
    
    // Configurações Mobile
    if (!appJson.android) appJson.android = {};
    if (!appJson.ios) appJson.ios = {};
    
    appJson.android.package = bundleId;
    appJson.ios.bundleIdentifier = bundleId;

    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log(`✅ Display Name: "${displayName}"`);
    console.log(`✅ Bundle ID: "${bundleId}"`);
  }

  // 3. Install dependencies
  console.log(`📦 Running npm install...`);
  execSync('npm install', { cwd: appPath, stdio: 'inherit' });
  console.log(`✅ Successful install.`);

  console.log(`\n✨ App "${appName}" is now a flexible part of the MMApps ecosystem!`);
  console.log(`--------------------------------------------------\n`);
} catch (error) {
  console.error(`\n❌ Error during setup: ${error.message}`);
  process.exit(1);
}

