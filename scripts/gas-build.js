const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');

console.log('🚀 CRM V11 Build Process Starting...');

try {
  // Step 1: Build backend (Webpack)
  console.log('\n📦 Step 1: Building Backend (Webpack)...');
  execSync('npx webpack --mode production', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Backend build complete!');

  // Step 2: Build frontend (Vite)
  console.log('\n📦 Step 2: Building Frontend (Vite)...');
  execSync('npm run build', {
    cwd: path.resolve(__dirname, '../frontend'),
    stdio: 'inherit'
  });
  console.log('✅ Frontend build complete!');

  // Step 3: Generate 3-File Pattern
  console.log('\n📦 Step 3: Generating GAS 3-File Pattern...');

  // Check if assets exist
  if (!fs.existsSync(assetsDir)) {
    throw new Error('frontend/dist/assets directory not found. Did Vite build fail?');
  }

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  if (jsFiles.length === 0) throw new Error('No JS files found in frontend/dist/assets');

  // Combine all JS files
  let allJs = '';
  jsFiles.forEach(file => {
    console.log(`📖 Reading JS: ${file}`);
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    allJs += content + '\n';
  });

  // Combine all CSS files
  let allCss = '';
  cssFiles.forEach(file => {
    console.log(`📖 Reading CSS: ${file}`);
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    allCss += content + '\n';
  });

  // Generate javascript.html
  const javascriptHtml = `<script>\n${allJs}\n</script>`;
  fs.writeFileSync(path.join(distDir, 'javascript.html'), javascriptHtml);
  console.log(`✅ Generated javascript.html (${javascriptHtml.length} bytes)`);

  // Generate stylesheet.html
  const stylesheetHtml = `<style>\n${allCss}\n</style>`;
  fs.writeFileSync(path.join(distDir, 'stylesheet.html'), stylesheetHtml);
  console.log(`✅ Generated stylesheet.html (${stylesheetHtml.length} bytes)`);

  // Generate index.html template
  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM V11</title>
  <?!= include('stylesheet'); ?>

  <!-- Inject initial state from server for deep-linking -->
  <script>
    window.CRM_INITIAL_STATE = <?!= initialState ?>;
  </script>
</head>
<body>
  <div id="root"></div>
  <?!= include('javascript'); ?>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
  console.log(`✅ Generated index.html (${indexHtml.length} bytes)`);

  // Step 4: Copy appsscript.json
  console.log('\n📦 Step 4: Copying appsscript.json...');
  const appsscriptSrc = path.resolve(__dirname, '../appsscript.json');
  const appsscriptDst = path.join(distDir, 'appsscript.json');
  fs.copyFileSync(appsscriptSrc, appsscriptDst);
  console.log('✅ Copied appsscript.json');

  // Step 5: Run inject-stubs to add GAS function bridges
  console.log('\n📦 Step 5: Running inject-stubs...');
  const injectStubsPath = path.resolve(__dirname, 'inject-stubs.js');
  if (fs.existsSync(injectStubsPath)) {
    execSync(`node "${injectStubsPath}"`, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ Inject-stubs complete!');
  } else {
    console.log('⚠️ inject-stubs.js not found, skipping...');
  }

  // Final summary
  console.log('\n✨ CRM V11 Build Complete!');
  console.log('📁 Output directory: dist/');

  const distFiles = fs.readdirSync(distDir);
  console.log('📄 Files:');
  distFiles.forEach(f => {
    const stats = fs.statSync(path.join(distDir, f));
    console.log(`   - ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  });

} catch (e) {
  console.error('❌ Build Failed:', e.message);
  process.exit(1);
}
