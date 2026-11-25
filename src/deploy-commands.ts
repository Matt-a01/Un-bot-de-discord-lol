import { deploySlashCommands } from './commands';
import { validateConfig } from './config';

async function main(): Promise<void> {
  validateConfig();
  await deploySlashCommands();
}

main().catch((error) => {
  console.error('Error al desplegar comandos:', error);
  process.exit(1);
});
