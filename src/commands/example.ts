import { CommandInteraction } from 'discord.js'
import { Discord, DIService, Slash } from 'discordx'
import { container, injectable } from 'tsyringe'

import { Database } from '../database'

@Discord()
@injectable()
export class Example {
  constructor(private _database: Database) {
    // TODO
  }

  @Slash({ description: 'tsyringe', name: 'tsyringe' })
  tsyringe(interaction: CommandInteraction): void {
    if (DIService.instance) {
      try {
        // resolve class
        const clazz = container.resolve(Example)
        // respond with class test
        interaction.reply(`${clazz._database.query()}, same class: ${clazz === this}`)
        // interaction.reply(new Date().toUTCString())
      } catch (error) {
        console.log(error)
      }
    } else {
      // warn: TSyringe is not used
      interaction.reply('Not using TSyringe')
    }
  }
}
