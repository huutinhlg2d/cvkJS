import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import fs from 'fs';
import { injectable } from 'tsyringe';

import { Main } from '../main';

@Discord()
@injectable()
export class Minecraft {
  private logFilePath = 'C:/Minecraft Server Fabric/Minecraft Server/logs/latest.log';
  private logChannelId = '836258712763105330'; // test bot

  @Slash({ description: 'Log current minecraft status', name: 'log' })
  log(_interaction: CommandInteraction): void {
    fs.watchFile(this.logFilePath, () => {
      fs.readFile(this.logFilePath, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        const lines = data.trim().split('\n');
        const lastLine = lines.slice(-1)[0];

        // Send the last line to the Discord channel
        const channel = Main.client.channels.cache.get(this.logChannelId);
        if (channel?.isTextBased()) {
          channel.send(lastLine);
        }
      });
    });
  }
}
