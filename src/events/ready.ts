import { Events } from 'discord.js';
import { deploySlashCommands } from '../commands';
import { config } from '../config';
import { connectToOwnerVoiceChannel } from '../services/voiceService';
import { BotClient } from '../types/BotClient';

export function registerReadyEvent(client: BotClient): void {
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`====================================================`);
    console.log(`🤖 Bot conectado como: ${readyClient.user.tag}`);
    console.log(`👑 Owner ID configurado: ${config.ownerId}`);
    console.log(`⌨️  Prefijo activo: "${config.prefix}"`);
    console.log(
      `🎧 Auto-seguimiento de voz al Owner: ${client.autoFollowOwnerVoice ? 'ACTIVADO' : 'DESACTIVADO'}`
    );
    console.log(`====================================================`);

    // Registrar Slash Commands automáticamente al iniciar
    await deploySlashCommands();

    // Si el seguimiento automático está activo al arrancar, buscar si el Owner ya está en llamada
    if (client.autoFollowOwnerVoice) {
      for (const guild of client.guilds.cache.values()) {
        const result = await connectToOwnerVoiceChannel(guild);
        if (result.success) {
          console.log(`[AutoVoice] Conectado inicialmente en ${guild.name}: ${result.message}`);
        }
      }
    }
  });
}
