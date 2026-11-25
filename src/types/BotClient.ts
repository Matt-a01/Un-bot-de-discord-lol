import {
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  Collection,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { config } from '../config';

export interface Command {
  /** Constructor del Slash Command para el registro en Discord */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  /** Alias adicionales para usar con prefijo (ej: !vc, !unirse) */
  aliases?: string[];
  /** Si es true, solo el usuario con OWNER_ID puede ejecutar el comando */
  ownerOnly?: boolean;
  /** Lógica al ejecutar mediante Slash Command (/) */
  executeSlash: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
  /** Lógica al ejecutar mediante comando con Prefijo (!) */
  executePrefix: (message: Message, args: string[], client: BotClient) => Promise<void>;
}

export class BotClient extends Client {
  public commands: Collection<string, Command> = new Collection();
  public aliases: Collection<string, string> = new Collection();
  public autoFollowOwnerVoice: boolean;

  constructor(options: ClientOptions) {
    super(options);
    this.autoFollowOwnerVoice = config.autoFollowOwnerVoice;
  }

  public isOwner(userId: string): boolean {
    return userId === config.ownerId;
  }
}
