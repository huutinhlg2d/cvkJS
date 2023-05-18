import { randomInt } from 'crypto'
import { ArgsOf, Discord, On } from 'discordx'

import { getEmoji } from '../utils/emoji'
import { isHappenWithProbality } from '../utils/math'

const emojis = ['856610361603260436', '🫡', '🗿', '🤓', '💀', '🤯']

@Discord()
export class onMessage {
  @On({ event: 'messageCreate' })
  onMessage([message]: ArgsOf<'messageCreate'>) {
    if (isHappenWithProbality(0.2)) message.react(this.getRandomEmoji())
  }
  getRandomEmoji() {
    const randomEmoji = getEmoji(emojis[randomInt(emojis.length)])
    return randomEmoji.toString()
  }
}
