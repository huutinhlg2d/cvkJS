import { Node, VoiceServerUpdate, VoiceStateUpdate, WRawEventType } from '@discordx/lava-player';
import { ApplicationCommandOptionType, CommandInteraction, GatewayDispatchEvents, GuildMember } from 'discord.js';
import { ArgsOf, Client, Discord, Once, Slash, SlashOption } from 'discordx';

@Discord()
export class Example {
  // @Slash({ description: 'join', name: 'join' })
  // join(interaction: CommandInteraction): void {
  //   const bot = interaction.client.user
  //   const botMember = interaction.guild?.members.cache.get(bot.id)
  //   const botChannel = botMember?.voice.channel
  //   const member = interaction.member as GuildMember | null
  //   const channel = member?.voice.channel

  //   if (!channel) interaction.reply('You must join a channel first')
  //   else if (botChannel && botChannel.id === channel.id)
  //     interaction.reply('I already in the same voice channel with you')
  //   else {
  //     console.log('joining...')

  //     const connection = joinVoiceChannel({
  //       adapterCreator: channel.guild.voiceAdapterCreator,
  //       channelId: channel.id,
  //       guildId: channel.guildId,
  //     })

  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
  //       try {
  //         await Promise.race([
  //           entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
  //           entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
  //         ])
  //         // Seems to be reconnecting to a new channel - ignore disconnect
  //       } catch (error) {
  //         // Seems to be a real disconnect which SHOULDN'T be recovered from
  //         connection.destroy()
  //       }
  //     })

  //     if (connection) {
  //       console.log(`${channel.name} joined`)

  //       interaction.reply(`I have joined \`${channel.name}\``)
  //     }
  //   }
  // }

  node: Node | undefined;

  @Once()
  ready(_: ArgsOf<'ready'>, client: Client): void {
    const nodeX = new Node({
      host: {
        address: process.env.LAVA_HOST ?? 'localhost',
        connectionOptions: { resumeKey: 'discordx', resumeTimeout: 15 },
        port: process.env.LAVA_PORT ? Number(process.env.LAVA_PORT) : 2333,
      },

      // your Lavalink password
      password: process.env.LAVA_PASSWORD ?? '',

      send(guildId, packet) {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          guild.shard.send(packet);
        }
      },
      shardCount: 0, // the total number of shards that your bot is running (optional, useful if you're load balancing)
      userId: client.user?.id ?? '', // the user id of your bot
    });

    nodeX.connection.ws.on('message', (data) => {
      const raw = JSON.parse(data.toString()) as WRawEventType;
      console.log('ws>>', raw);
    });

    nodeX.on('error', (e) => {
      console.log(e);
    });

    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data: VoiceStateUpdate) => {
      nodeX.voiceStateUpdate(data);
    });

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data: VoiceServerUpdate) => {
      nodeX.voiceServerUpdate(data);
    });

    this.node = nodeX;
  }

  @Slash({ description: 'bot will join your music channel' })
  async join(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    if (!(interaction.member instanceof GuildMember) || !interaction.guildId) {
      interaction.followUp('could not process this command, try again');
      return;
    }

    if (!this.node) {
      interaction.followUp('lavalink player is not ready');
      return;
    }

    if (!interaction.member.voice.channelId) {
      interaction.followUp('please join a voice channel first');
      return;
    }

    const player = this.node.players.get(interaction.guildId);
    await player.join(interaction.member.voice.channelId, { deaf: true });

    interaction.followUp('I am ready to rock :smile:');

    return;
  }

  @Slash({ description: 'play a song' })
  async play(
    @SlashOption({
      description: 'song url or title',
      name: 'song',
      type: ApplicationCommandOptionType.String,
    })
    song: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.deferReply();

    if (!(interaction.member instanceof GuildMember) || !interaction.guildId) {
      interaction.followUp('could not process this command, try again');
      return;
    }

    if (!this.node) {
      interaction.followUp('lavalink player is not ready');
      return;
    }

    if (!interaction.member.voice.channelId) {
      interaction.followUp('please join a voice channel first');
      return;
    }

    const player = this.node.players.get(interaction.guildId);

    if (!player.voiceServer) {
      await player.join(interaction.member.voice.channelId, { deaf: true });
    }

    const res = await this.node.load(`ytsearch:${song}`);
    const track = res.tracks[0];

    if (track) {
      await player.play(track);
      await interaction.followUp(`playing ${track.info.title}`);
    } else {
      await interaction.followUp('Song not found with given input');
    }

    return;
  }
}
