import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { BotClient, Command } from '../types/BotClient';

export const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra la latencia actual del bot.'),
  aliases: ['latencia', 'pong'],
  ownerOnly: false,

  async executeSlash(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const sent = await interaction.reply({
      content: '🏓 Calculando ping...',
      fetchReply: true,
    });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `🏓 **Pong!**\n📡 Latencia de mensajes: \`${roundtrip}ms\`\n💓 WebSocket API: \`${client.ws.ping}ms\``
    );
  },

  async executePrefix(message: Message, _args: string[], client: BotClient): Promise<void> {
    const sent = await message.reply('🏓 Calculando ping...');
    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit(
      `🏓 **Pong!**\n📡 Latencia de mensajes: \`${roundtrip}ms\`\n💓 WebSocket API: \`${client.ws.ping}ms\``
    );
  },
};
