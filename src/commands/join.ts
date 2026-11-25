import {
  ChannelType,
  ChatInputCommandInteraction,
  Message,
  MessageFlags,
  SlashCommandBuilder,
  VoiceBasedChannel,
} from 'discord.js';
import {
  connectAndStayInChannel,
  connectToOwnerVoiceChannel,
} from '../services/voiceService';
import { BotClient, Command } from '../types/BotClient';

export const joinCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription(
      'Conecta el bot a tu canal de voz y hace que se quede en la llamada (Solo Owner).'
    )
    .addChannelOption((option) =>
      option
        .setName('canal')
        .setDescription('Canal de voz opcional donde quieres que se quede (por defecto, el tuyo).')
        .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
        .setRequired(false)
    ),
  aliases: ['unirse', 'vc', 'conectar', 'stay', 'quedarse'],
  ownerOnly: true,

  async executeSlash(interaction: ChatInputCommandInteraction, _client: BotClient): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        content: '❌ Este comando solo se puede usar dentro de un servidor.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const selectedChannel = interaction.options.getChannel('canal') as VoiceBasedChannel | null;
    const result = selectedChannel
      ? await connectAndStayInChannel(interaction.guild, selectedChannel)
      : await connectToOwnerVoiceChannel(interaction.guild);

    await interaction.editReply(result.message);
  },

  async executePrefix(message: Message, _args: string[], _client: BotClient): Promise<void> {
    if (!message.guild) {
      await message.reply('❌ Este comando solo se puede usar dentro de un servidor.');
      return;
    }

    const result = await connectToOwnerVoiceChannel(message.guild);
    await message.reply(result.message);
  },
};
