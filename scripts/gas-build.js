// scripts/gas-build.js - V11 Build Integration Script
// Base64 encoding solution to prevent GAS :// comment stripping
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CRM V11 Build Pipeline Starting...\n');

// Step 1: Build Frontend
console.log('📦 Step 1/4: Building Frontend (Vite)...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build complete\n');
} catch (error) {
  console.error('❌ Frontend build failed');
  process.exit(1);
}

// Step 2: Build Backend
console.log('📦 Step 2/4: Building Backend (Webpack)...');
try {
  execSync('npx webpack', { stdio: 'inherit' });

  // Bridge Injection for GAS
  console.log('🌉 Injecting GAS Bridge...');
  execSync('node scripts/inject-stubs.js', { stdio: 'inherit' });

  console.log('✅ Backend build complete\n');
} catch (error) {
  console.error('❌ Backend build failed');
  process.exit(1);
}

// Step 3: Integrate Frontend Assets into HTML
console.log('🔗 Step 3/4: Integrating Frontend Assets...');
try {
  const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
  const distDir = path.join(__dirname, '..', 'dist');

  const jsPath = path.join(assetsDir, 'main.js');
  const cssPath = path.join(assetsDir, 'main.css');

  if (!fs.existsSync(jsPath)) {
    throw new Error('main.js not found in dist/assets');
  }

  const jsContent = fs.readFileSync(jsPath, 'utf8');
  let cssContent = '';
  if (fs.existsSync(cssPath)) {
    cssContent = fs.readFileSync(cssPath, 'utf8');
  } else {
    // Fallback: look for any .css file in assets
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
    }
  }

  // ============================================================
  // CRITICAL FIX: Base64 Encoding for GAS Compatibility
  // ============================================================
  // GAS HtmlService processes :// patterns even in createHtmlOutputFromFile
  // and treats them as JavaScript comments, stripping everything after.
  // To avoid this, we encode the JavaScript as Base64 and decode it at runtime.
  // ============================================================

  // Encode JavaScript content as Base64
  const jsBase64 = Buffer.from(jsContent, 'utf8').toString('base64');

  // Create a bootstrap script that decodes and executes the Base64 content
  // Using a self-executing function to avoid polluting global scope
  const jsTemplate = `<script>
(function() {
  var encoded = "${jsBase64}";
  var decoded = atob(encoded);
  var script = document.createElement('script');
  script.textContent = decoded;
  document.head.appendChild(script);
})();
</script>`;
  fs.writeFileSync(path.join(distDir, 'javascript.html'), jsTemplate, 'utf8');
  console.log(`✅ Generated javascript.html (Base64 encoded, ${jsTemplate.length} bytes)`);

  // stylesheet.html
  const cssTemplate = `<style>\n${cssContent}\n</style>`;
  fs.writeFileSync(path.join(distDir, 'stylesheet.html'), cssTemplate, 'utf8');
  console.log(`✅ Generated stylesheet.html (${cssTemplate.length} bytes)`);

  // index.html - Note: doGet in main.ts builds HTML directly to avoid scriptlet issues
  const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM V11</title>
  <?!= include('stylesheet'); ?>
</head>
<body>
  <div id="root"></div>
  <?!= include('javascript'); ?>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), htmlTemplate, 'utf8');
  console.log(`✅ Generated index.html (${htmlTemplate.length} bytes)`);
  console.log('✅ Frontend assets integrated\n');

} catch (error) {
  console.error('❌ Asset integration failed:', error.message);
  process.exit(1);
}

// Step 4: Copy appsscript.json and cleanup
console.log('🧹 Step 4/4: Finalizing build...');
try {
  const appsscriptSrc = path.join(__dirname, '..', 'appsscript.json');
  const appsscriptDest = path.join(__dirname, '..', 'dist', 'appsscript.json');

  if (fs.existsSync(appsscriptSrc)) {
    fs.copyFileSync(appsscriptSrc, appsscriptDest);
    console.log('✅ Copied appsscript.json');
  } else {
    console.warn('⚠️ appsscript.json not found in root, skipping copy.');
  }

  // Clean up assets directory (no longer needed after integration)
  const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    try {
      fs.rmSync(assetsDir, { recursive: true, force: true });
      console.log('✅ Cleaned up dist/assets directory');
    } catch (e) {
      console.warn('⚠️ Could not remove assets directory: ' + e.message);
    }
  }

  console.log('✅ Build finalized\n');

  // Show final dist contents
  const distDir = path.join(__dirname, '..', 'dist');
  const distFiles = fs.readdirSync(distDir);
  console.log('📁 dist/ contents:');
  distFiles.forEach(f => {
    const stats = fs.statSync(path.join(distDir, f));
    console.log(`   - ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  });
  console.log('\n✨ CRM V11 Build Complete! Ready for deployment.\n');

} catch (error) {
  console.error('❌ Finalization failed:', error.message);
  process.exit(1);
}
