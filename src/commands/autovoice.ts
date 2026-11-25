import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { connectToOwnerVoiceChannel } from '../services/voiceService';
import { BotClient, Command } from '../types/BotClient';

export const autoVoiceCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('autovoice')
    .setDescription(
      'Activa o desactiva que el bot te siga a tus llamadas y se quede en el VC (Solo Owner).'
    )
    .addBooleanOption((option) =>
      option
        .setName('estado')
        .setDescription('Activar (true) o desactivar (false). Si se omite, alterna el estado actual.')
        .setRequired(false)
    ),
  aliases: ['seguirme', 'autofollow'],
  ownerOnly: true,

  async executeSlash(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    await interaction.deferReply();

    const requestedState = interaction.options.getBoolean('estado');
    client.autoFollowOwnerVoice =
      requestedState !== null ? requestedState : !client.autoFollowOwnerVoice;

    const statusText = client.autoFollowOwnerVoice ? '🟢 **ACTIVADO**' : '🔴 **DESACTIVADO**';
    let replyMsg = `🎧 Modo seguimiento automático y permanencia en VC: ${statusText}`;

    // Al ser invocado con el Slash Command, si el Owner está en un VC se une y se queda ahí
    if (interaction.guild) {
      const joinResult = await connectToOwnerVoiceChannel(interaction.guild);
      if (joinResult.success) {
        replyMsg += `\n${joinResult.message}`;
      }
    }

    await interaction.editReply(replyMsg);
  },

  async executePrefix(message: Message, args: string[], client: BotClient): Promise<void> {
    const arg = args[0]?.toLowerCase();
    if (arg === 'on' || arg === 'true' || arg === 'activar') {
      client.autoFollowOwnerVoice = true;
    } else if (arg === 'off' || arg === 'false' || arg === 'desactivar') {
      client.autoFollowOwnerVoice = false;
    } else {
      client.autoFollowOwnerVoice = !client.autoFollowOwnerVoice;
    }

    const statusText = client.autoFollowOwnerVoice ? '🟢 **ACTIVADO**' : '🔴 **DESACTIVADO**';
    let replyMsg = `🎧 Modo seguimiento automático y permanencia en VC: ${statusText}`;

    if (client.autoFollowOwnerVoice && message.guild) {
      const joinResult = await connectToOwnerVoiceChannel(message.guild);
      if (joinResult.success) {
        replyMsg += `\n${joinResult.message}`;
      }
    }

    await message.reply(replyMsg);
  },
};
