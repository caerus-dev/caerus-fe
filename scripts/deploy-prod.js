const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function run() {
  console.log(`\n\x1b[36m=== Iniciando verificación de Despliegue de Producción ===\x1b[0m\n`);

  // 1. Verificar si gh CLI y vercel CLI están instalados
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch (err) {
    console.error(`\x1b[31m[ERROR] Se requiere tener instalado el GitHub CLI (gh) para realizar lanzamientos.\x1b[0m`);
    console.error(`Puedes instalarlo ejecutando: \x1b[33mwinget install GitHub.cli\x1b[0m o desde https://cli.github.com/`);
    process.exit(1);
  }

  try {
    execSync("vercel --version", { stdio: "ignore" });
  } catch (err) {
    console.error(`\x1b[31m[ERROR] Se requiere tener instalado el Vercel CLI (vercel) para realizar lanzamientos.\x1b[0m`);
    console.error(`Puedes instalarlo ejecutando: \x1b[33mpnpm add -g vercel\x1b[0m o \x1b[33mnpm i -g vercel\x1b[0m`);
    process.exit(1);
  }

  // 2. Verificar que el repositorio Git esté limpio (sin cambios pendientes)
  const status = execSync("git status --porcelain").toString().trim();
  if (status) {
    console.error(`\x1b[31m[ERROR] Tienes cambios sin confirmar en tu repositorio local.\x1b[0m`);
    console.error(`Por favor, haz commit o descarta tus cambios antes de desplegar a producción:\n`);
    console.error(status);
    process.exit(1);
  }

  // 3. Verificar que estemos en la rama main
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  if (branch !== "main") {
    console.error(`\x1b[31m[ERROR] Solo se permite desplegar a producción desde la rama 'main'.\x1b[0m`);
    console.error(`Estás actualmente en la rama: '${branch}'`);
    process.exit(1);
  }

  // 4. Leer package.json para obtener versión actual
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const currentVersion = packageJson.version;

  console.log(`Versión actual del proyecto: \x1b[32mv${currentVersion}\x1b[0m`);
  console.log(`\n¿Qué tipo de incremento deseas aplicar?`);
  console.log(`1) \x1b[33mPatch\x1b[0m (Bugfix/Correcciones - ej: v${currentVersion} -> v${incrementVersion(currentVersion, 'patch')})`);
  console.log(`2) \x1b[33mMinor\x1b[0m (Nueva funcionalidad - ej: v${currentVersion} -> v${incrementVersion(currentVersion, 'minor')})`);
  console.log(`3) \x1b[33mMajor\x1b[0m (Cambio destructivo/Mayor - ej: v${currentVersion} -> v${incrementVersion(currentVersion, 'major')})`);
  console.log(`4) Cancelar despliegue`);

  const answer = await askQuestion(`\nSelecciona una opción (1-4): `);
  let releaseType = "";
  if (answer === "1") releaseType = "patch";
  else if (answer === "2") releaseType = "minor";
  else if (answer === "3") releaseType = "major";
  else {
    console.log(`\n\x1b[33mDespliegue cancelado.\x1b[0m`);
    process.exit(0);
  }

  const newVersion = incrementVersion(currentVersion, releaseType);
  console.log(`\nNueva versión a generar: \x1b[32mv${newVersion}\x1b[0m`);

  // 5. Generar Changelog automático basado en commits desde el último tag
  let changelog = "";
  try {
    const lastTagExists = execSync(`git tag -l v${currentVersion}`).toString().trim();
    if (lastTagExists) {
      changelog = execSync(`git log v${currentVersion}..HEAD --pretty=format:"- %s (%h)"`).toString().trim();
    } else {
      // Si no existe el tag de la versión anterior, listar commits desde el principio
      changelog = execSync(`git log --pretty=format:"- %s (%h)"`).toString().trim();
    }
  } catch (err) {
    changelog = "- Lanzamiento y actualizaciones de producción.";
  }

  if (!changelog) {
    changelog = "- Optimizaciones y mantenimiento general.";
  }

  console.log(`\n\x1b[36m=== Changelog Auto-Generado ===\x1b[0m`);
  console.log(changelog);
  console.log(`\x1b[36m================================\x1b[0m\n`);

  const confirm = await askQuestion(`¿Confirmas el lanzamiento de v${newVersion} con esta información? (s/n): `);
  if (confirm.toLowerCase() !== "s") {
    console.log(`\n\x1b[33mDespliegue cancelado.\x1b[0m`);
    process.exit(0);
  }

  // 6. Actualizar package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  console.log(`\n[1/6] package.json actualizado a v${newVersion}`);

  // 7. Crear el commit de la release
  execSync(`git add package.json`, { stdio: "ignore" });
  execSync(`git commit -m "chore(release): v${newVersion}"`, { stdio: "ignore" });
  console.log(`[2/6] Commit de la versión v${newVersion} creado con éxito.`);

  // 8. Hacer push a GitHub
  console.log(`[3/6] Subiendo commit a GitHub (rama main)...`);
  execSync(`git push origin main`, { stdio: "inherit" });

  // 9. Crear y subir el Tag de Git
  console.log(`[4/6] Creando y subiendo etiqueta v${newVersion}...`);
  execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: "ignore" });
  execSync(`git push origin v${newVersion}`, { stdio: "inherit" });

  // 10. Crear la Release en GitHub usando gh CLI
  console.log(`[5/6] Creando Release oficial en GitHub...`);
  try {
    // Escapar comillas para la consola
    const safeChangelog = changelog.replace(/"/g, '\\"');
    execSync(`gh release create v${newVersion} --title "v${newVersion}" --notes "${safeChangelog}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`\x1b[31m[ERROR] Hubo un problema al crear la release en GitHub con gh CLI. Deteniendo despliegue.\x1b[0m`);
    process.exit(1);
  }

  // 11. Ejecutar el despliegue final en Vercel
  console.log(`[6/6] Desplegando en Vercel Producción...`);
  execSync("vercel --prod", { stdio: "inherit" });

  console.log(`\n\x1b[32m✔ ¡Proceso completado con éxito! Versión v${newVersion} desplegada y publicada.\x1b[0m\n`);
  process.exit(0);
}

function incrementVersion(version, type) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3) return version;
  
  let [major, minor, patch] = parts;
  if (type === "patch") patch += 1;
  else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  }
  return `${major}.${minor}.${patch}`;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
