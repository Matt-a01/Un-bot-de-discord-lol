import { Events, VoiceState } from 'discord.js';
import { connectToOwnerVoiceChannel } from '../services/voiceService';
import { BotClient } from '../types/BotClient';

export function registerVoiceStateUpdateEvent(client: BotClient): void {
  client.on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
    const userId = newState.id || oldState.id;

    // Solo reaccionar a cambios de canal de voz del Owner cuando autoFollowOwnerVoice está activo
    if (!client.isOwner(userId) || !client.autoFollowOwnerVoice) return;

    const guild = newState.guild;

    // Si el Owner entra a un canal de voz o se cambia a otro, el bot lo sigue y se queda en ese VC
    if (newState.channelId && oldState.channelId !== newState.channelId) {
      const result = await connectToOwnerVoiceChannel(guild);
      if (result.success) {
        console.log(
          `[AutoVoice] Conectado y permaneciendo con el Owner en el canal "${newState.channel?.name}".`
        );
      }
    }
    // Nota: Cuando el Owner sale de la llamada, el bot SE QUEDA en el canal de voz
    // hasta que el Owner use explícitamente /leave o !leave.
  });
}
