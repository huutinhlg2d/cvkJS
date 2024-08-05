import { EmojiResolvable } from 'discord.js';

import { Main } from '../main';

export const getEmoji = (str: string): EmojiResolvable => {
  if (!str || str.length === 2) return str;

  return Main.client.emojis.cache.get(str) ?? str;
};
