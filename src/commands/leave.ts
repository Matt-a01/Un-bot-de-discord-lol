import {
  ChatInputCommandInteraction,
  Message,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { disconnectFromVoiceChannel } from '../services/voiceService';
import { BotClient, Command } from '../types/BotClient';

export const leaveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Desconecta el bot del canal de voz actual (Solo Owner).'),
  aliases: ['salir', 'dc', 'desconectar'],
  ownerOnly: true,

  async executeSlash(interaction: ChatInputCommandInteraction, _client: BotClient): Promise<void> {
    if (!interaction.guildId) {
      await interaction.reply({
        content: '❌ Este comando solo se puede usar dentro de un servidor.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const result = disconnectFromVoiceChannel(interaction.guildId);
    await interaction.reply({
      content: result.message,
      flags: MessageFlags.Ephemeral,
    });
  },

  async executePrefix(message: Message, _args: string[], _client: BotClient): Promise<void> {
    if (!message.guildId) {
      await message.reply('❌ Este comando solo se puede usar dentro de un servidor.');
      return;
    }

    const result = disconnectFromVoiceChannel(message.guildId);
    await message.reply(result.message);
  },
};
