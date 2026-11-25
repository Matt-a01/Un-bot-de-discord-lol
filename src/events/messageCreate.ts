import { Events, Message } from 'discord.js';
import { config } from '../config';
import { BotClient } from '../types/BotClient';

export function registerMessageCreateEvent(client: BotClient): void {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    const botMentionPrefix = client.user ? new RegExp(`^<@!?${client.user.id}>\\s*`) : null;
    let contentWithoutPrefix: string | null = null;

    if (message.content.startsWith(config.prefix)) {
      contentWithoutPrefix = message.content.slice(config.prefix.length).trim();
    } else if (botMentionPrefix && botMentionPrefix.test(message.content)) {
      // Permite usar "@TuBot join" incluso si Message Content Intent está desactivado
      contentWithoutPrefix = message.content.replace(botMentionPrefix, '').trim();
    }

    if (!contentWithoutPrefix) return;

    const args = contentWithoutPrefix.split(/\s+/);
    const rawCommandName = args.shift()?.toLowerCase();

    if (!rawCommandName) return;

    const resolvedName = client.commands.has(rawCommandName)
      ? rawCommandName
      : client.aliases.get(rawCommandName);

    if (!resolvedName) return;

    const command = client.commands.get(resolvedName);
    if (!command) return;

    // Verificar restricción exclusiva para el Owner
    if (command.ownerOnly && !client.isOwner(message.author.id)) {
      await message.reply(
        '⛔ Acceso denegado: Este comando es de uso exclusivo del **Owner** del bot.'
      );
      return;
    }

    try {
      await command.executePrefix(message, args, client);
    } catch (error) {
      console.error(`[Prefix Error] Error en comando ${config.prefix}${resolvedName}:`, error);
      await message.reply('❌ Ocurrió un error al ejecutar este comando.');
    }
  });
}
