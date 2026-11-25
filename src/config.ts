import dotenv from 'dotenv';

dotenv.config();

export interface BotConfig {
  token: string;
  clientId: string;
  ownerId: string;
  prefix: string;
  guildId?: string;
  autoFollowOwnerVoice: boolean;
}

export const config: BotConfig = {
  token: process.env.DISCORD_TOKEN?.trim() || '',
  clientId: process.env.CLIENT_ID?.trim() || '',
  ownerId: process.env.OWNER_ID?.trim() || '',
  prefix: process.env.PREFIX?.trim() || '!',
  guildId: process.env.GUILD_ID?.trim() || undefined,
  autoFollowOwnerVoice: process.env.AUTO_FOLLOW_OWNER_VOICE?.toLowerCase() === 'true',
};

export function validateConfig(): void {
  const missing: string[] = [];

  if (!config.token) missing.push('DISCORD_TOKEN');
  if (!config.clientId) missing.push('CLIENT_ID');
  if (!config.ownerId) missing.push('OWNER_ID');

  if (missing.length > 0) {
    console.error(
      `[Config Error] Faltan variables de entorno requeridas en tu archivo .env: ${missing.join(', ')}`
    );
    process.exit(1);
  }
}
