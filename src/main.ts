import { importx } from '@discordx/importer';
import { IntentsBitField } from 'discord.js';
import { Client } from 'discordx';
import { container } from 'tsyringe';

import { env } from './env';

export class Main {
  private static _client: Client;

  static get client(): Client {
    return this._client;
  }

  static async start(): Promise<void> {
    this._client = new Client({
      // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildVoiceStates,
      ],
      silent: false,
      botGuilds: env.GUILD_ID ? [env.GUILD_ID] : undefined,
    });

    this._client.once('ready', async () => {
      // An example of how guild commands can be cleared
      //
      // await this._client.clearApplicationCommands(
      //   ...this._client.guilds.cache.map((guild) => guild.id)
      // );

      await this._client.clearApplicationCommands();
      await this._client.clearApplicationCommands(env.GUILD_ID);
      await this._client.initApplicationCommands();

      console.log(container);

      console.log('>> Bot started');
    });

    this._client.on('interactionCreate', (interaction) => {
      this._client.executeInteraction(interaction);
    });

    const dirPath = `${__dirname.replaceAll('\\', '/')}`;

    await importx(`${dirPath}/commands/**/*.{js,ts}`);
    await importx(`${dirPath}/events/**/*.{js,ts}`);

    // let's start the bot
    if (!env.BOT_TOKEN) {
      throw Error('Could not find BOT_TOKEN in your environment');
    }
    await this._client.login(env.BOT_TOKEN);
  }
}
