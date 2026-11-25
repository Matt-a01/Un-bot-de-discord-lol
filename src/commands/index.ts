import { REST, Routes } from 'discord.js';
import { config } from '../config';
import { BotClient, Command } from '../types/BotClient';
import { autoVoiceCommand } from './autovoice';
import { joinCommand } from './join';
import { leaveCommand } from './leave';
import { pingCommand } from './ping';

export const commandList: Command[] = [
  pingCommand,
  joinCommand,
  leaveCommand,
  autoVoiceCommand,
];

/**
 * Carga todos los comandos y sus alias en la instancia del cliente.
 */
export function loadCommands(client: BotClient): void {
  for (const command of commandList) {
    const commandName = command.data.name;
    client.commands.set(commandName, command);

    if (command.aliases) {
      for (const alias of command.aliases) {
        client.aliases.set(alias.toLowerCase(), commandName);
      }
    }
  }
  console.log(`[Comandos] Cargados ${client.commands.size} comandos (Slash + Prefix).`);
}

/**
 * Registra los Slash Commands en la API de Discord (por Guild si GUILD_ID existe, o Global).
 */
export async function deploySlashCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = commandList.map((cmd) => cmd.data.toJSON());

  try {
    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body,
      });
      console.log(
        `[Slash Commands] Registrados ${body.length} comandos en el servidor (${config.guildId}).`
      );
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), {
        body,
      });
      console.log(`[Slash Commands] Registrados ${body.length} comandos globalmente.`);
    }
  } catch (error) {
    console.error('[Slash Commands] Error al registrar los comandos en Discord:', error);
  }
}
