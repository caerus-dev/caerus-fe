const { execSync } = require("child_process");

try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  
  if (branch !== "main") {
    console.error(`\x1b[31m[ERROR] Solo se permite desplegar a producción desde la rama 'main'.\x1b[0m`);
    console.error(`\x1b[31mEstás actualmente en la rama: '${branch}'\x1b[0m`);
    process.exit(1);
  }
  
  console.log(`\x1b[32m[OK] Rama 'main' verificada. Iniciando despliegue a producción en Vercel...\x1b[0m`);
  execSync("vercel --prod", { stdio: "inherit" });
} catch (error) {
  // Si ocurre un error al ejecutar comandos de git o vercel, terminamos con error
  process.exit(1);
}
