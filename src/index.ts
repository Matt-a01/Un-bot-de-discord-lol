import { GatewayIntentBits } from 'discord.js';
import { loadCommands } from './commands';
import { config, validateConfig } from './config';
import { loadEvents } from './events';
import { BotClient } from './types/BotClient';

async function startClient(includeMessageContent: boolean): Promise<void> {
  const intents: GatewayIntentBits[] = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ];

  if (includeMessageContent) {
    intents.push(GatewayIntentBits.MessageContent);
  }

  const client = new BotClient({ intents });

  loadCommands(client);
  loadEvents(client);

  await client.login(config.token);
}

async function bootstrap(): Promise<void> {
  validateConfig();

  try {
    await startClient(true);
  } catch (error: unknown) {
    const isDisallowedIntents =
      error instanceof Error && error.message.includes('Used disallowed intents');

    if (isDisallowedIntents) {
      console.warn(
        '\n⚠️  [Aviso] El intent "Message Content Intent" no está activado en tu Discord Developer Portal.'
      );
      console.warn(
        '👉 Iniciando el bot en modo compatible (los Slash Commands /join, /leave, /autovoice, /ping y la conexión a VC funcionarán al 100%).'
      );
      console.warn(
        '💡 Para usar también el prefijo "' +
          config.prefix +
          '" sin mencionar al bot, activa "Message Content Intent" en: https://discord.com/developers/applications (Sección Bot -> Privileged Gateway Intents).\n'
      );

      await startClient(false);
      return;
    }

    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('[Fatal Error] No se pudo iniciar el bot:', error);
  process.exit(1);
});
