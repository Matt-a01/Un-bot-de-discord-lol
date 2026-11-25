import {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Guild, VoiceBasedChannel } from 'discord.js';
import { config } from '../config';

export interface VoiceActionResult {
  success: boolean;
  message: string;
  channel?: VoiceBasedChannel;
  connection?: VoiceConnection;
}

/**
 * Mapa de servidores donde el bot debe permanecer conectado en el canal de voz
 * (guildId -> channelId) hasta que se use explícitamente el comando de salir (/leave).
 */
const persistentVoiceChannels = new Map<string, string>();

/**
 * Indica si el bot tiene activada la permanencia en un canal de voz del servidor.
 */
export function isStayingInVoiceChannel(guildId: string): boolean {
  return persistentVoiceChannels.has(guildId);
}

/**
 * Conecta al bot a un canal de voz específico y mantiene la conexión activa
 * para que no se salga de la llamada automáticamente.
 */
export async function connectAndStayInChannel(
  guild: Guild,
  voiceChannel: VoiceBasedChannel
): Promise<VoiceActionResult> {
  if (!voiceChannel.joinable) {
    return {
      success: false,
      message: `❌ No tengo permisos suficientes para unirme al canal **${voiceChannel.name}**.`,
    };
  }

  // Registrar que el bot debe quedarse en este canal de voz
  persistentVoiceChannels.set(guild.id, voiceChannel.id);

  const existingConnection = getVoiceConnection(guild.id);
  if (
    existingConnection &&
    existingConnection.joinConfig.channelId === voiceChannel.id &&
    existingConnection.state.status === VoiceConnectionStatus.Ready
  ) {
    return {
      success: true,
      channel: voiceChannel,
      connection: existingConnection,
      message: `🔊 Ya estoy conectado y permaneciendo en **${voiceChannel.name}**.`,
    };
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
  });

  // Mantener al bot en el VC ante caídas de red o reinicios de servidor de voz
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      const targetChannelId = persistentVoiceChannels.get(guild.id);

      // Si sigue en modo permanente, reconectar al canal en lugar de salirse
      if (targetChannelId) {
        try {
          connection.rejoin({
            channelId: targetChannelId,
            selfDeaf: true,
            selfMute: false,
          });
          await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
          return;
        } catch (rejoinError) {
          console.error('[VoiceService] Error al intentar reconectar al VC:', rejoinError);
        }
      }

      if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
        connection.destroy();
      }
    }
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

  return {
    success: true,
    channel: voiceChannel,
    connection,
    message: `✅ Conectado a **${voiceChannel.name}**. Me quedaré en el canal de voz hasta que uses \`/leave\`.`,
  };
}

/**
 * Busca el canal de voz donde está el Owner (OWNER_ID) dentro del servidor,
 * conecta el bot a dicho canal y hace que permanezca ahí.
 */
export async function connectToOwnerVoiceChannel(guild: Guild): Promise<VoiceActionResult> {
  try {
    // 1. Buscar primero en la caché de estados de voz (no requiere intents privilegiados)
    let voiceChannel: VoiceBasedChannel | null =
      guild.voiceStates.cache.get(config.ownerId)?.channel ?? null;

    // 2. Si no está en la caché de voz, intentar obtener el miembro directamente
    if (!voiceChannel) {
      const ownerMember = await guild.members.fetch(config.ownerId).catch(() => null);
      if (!ownerMember) {
        return {
          success: false,
          message: '❌ No se pudo encontrar al Owner en este servidor.',
        };
      }
      voiceChannel = ownerMember.voice.channel;
    }

    if (!voiceChannel) {
      return {
        success: false,
        message: '❌ No estás conectado a ningún canal de voz en este servidor.',
      };
    }

    return await connectAndStayInChannel(guild, voiceChannel);
  } catch (error) {
    console.error('[VoiceService] Error al conectar al canal del Owner:', error);
    return {
      success: false,
      message: '❌ Ocurrió un error al intentar conectar al canal de voz.',
    };
  }
}

/**
 * Desconecta al bot del canal de voz en el servidor indicado y desactiva la permanencia.
 */
export function disconnectFromVoiceChannel(guildId: string): VoiceActionResult {
  persistentVoiceChannels.delete(guildId);
  const connection = getVoiceConnection(guildId);

  if (!connection) {
    return {
      success: false,
      message: '❌ No estoy conectado a ningún canal de voz en este servidor.',
    };
  }

  connection.destroy();
  return {
    success: true,
    message: '👋 Me he desconectado del canal de voz.',
  };
}
