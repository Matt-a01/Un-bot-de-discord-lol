import { BotClient } from '../types/BotClient';
import { registerInteractionCreateEvent } from './interactionCreate';
import { registerMessageCreateEvent } from './messageCreate';
import { registerReadyEvent } from './ready';
import { registerVoiceStateUpdateEvent } from './voiceStateUpdate';

export function loadEvents(client: BotClient): void {
  registerReadyEvent(client);
  registerInteractionCreateEvent(client);
  registerMessageCreateEvent(client);
  registerVoiceStateUpdateEvent(client);
  console.log('[Eventos] Manejadores de eventos registrados correctamente.');
}
