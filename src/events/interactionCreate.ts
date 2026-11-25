import { Events, Interaction, MessageFlags } from 'discord.js';
import { connectToOwnerVoiceChannel } from '../services/voiceService';
import { BotClient } from '../types/BotClient';

export function registerInteractionCreateEvent(client: BotClient): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Verificar restricción exclusiva para el Owner
    if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
      await interaction.reply({
        content: '⛔ Acceso denegado: Este comando es de uso exclusivo del **Owner** del bot.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Si el Owner invoca al bot mediante un Slash Command (distinto de /leave y /join),
    // hacer que el bot se una automáticamente a su canal de voz y se quede ahí.
    if (
      interaction.guild &&
      client.isOwner(interaction.user.id) &&
      interaction.commandName !== 'leave' &&
      interaction.commandName !== 'join' &&
      interaction.commandName !== 'autovoice'
    ) {
      connectToOwnerVoiceChannel(interaction.guild).catch(() => null);
    }

    try {
      await command.executeSlash(interaction, client);
    } catch (error) {
      console.error(`[Slash Error] Error en comando /${interaction.commandName}:`, error);
      const errorMessage = '❌ Ocurrió un error al ejecutar este comando.';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      }
    }
  });
}
