import { table } from "console";
import { Activity, ActivityOptions, Client, GuildMember, Message, MessageReaction, PartialUser, PresenceManager, ReactionEmoji, ReactionManager, Role, TextChannel, User, VoiceState } from "discord.js";
import { BombMSG } from "./bombmsg";
import { getIP } from "./iputils";
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const Discord = require('discord.js');
const client: Client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

let member_role: Role;
let a_role: Role;
let b_role: Role;
let c_role: Role;
let d_role: Role;
let voice_role: Role;


client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const f: ActivityOptions = { type: "PLAYING", name: "lvk.sh/ictbot" };
  const r = await client.user.setActivity(f);
  console.log('Activity Set');

  client.guilds.cache.forEach(async (g) => {

    await g.roles.fetch();
    member_role = g.roles.cache.filter((a) => { return a.id == '758253026913419265'; }).first();
    a_role = g.roles.cache.filter((a) => { return a.id == '757968122077773896' }).first();
    b_role = g.roles.cache.filter((a) => { return a.id == '757968245474066523' }).first();
    c_role = g.roles.cache.filter((a) => { return a.id == '757968282841120788' }).first();
    d_role = g.roles.cache.filter((a) => { return a.id == '757968318685642833' }).first();
    voice_role = g.roles.cache.filter((a) => { return a.id == '762799243521294358' }).first();

    // g.roles.cache.forEach((r) => {
    //   // TODO: DEBUG REMOVE
    //   console.log(r.id + " " + r.name);
    // });

    g.channels.cache.filter((a) => {
      return a instanceof TextChannel;
    }).filter((a) => {
      return a.name.toLowerCase().includes('bot');
    }).forEach(async (ch: TextChannel) => {
      await ch.messages.fetch();
      ch.messages.cache.forEach((m) => {
        m.delete();
      });
    });
  });
});

function rand(opts: string[]) {
  return opts[Math.floor(Math.random() * opts.length)];
}

client.on('messageReactionAdd', async (a: MessageReaction, b: User | PartialUser) => {
  if (a.partial) {
    try {
      await a.fetch();
    } catch (err) {
      console.error(err);
      return;
    }
  }
  if (b.partial) {
    try {
      await b.fetch();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  if (a.message.channel instanceof TextChannel) {
    const t = a.message.channel as TextChannel;
    if (t.name.toLowerCase().includes('roles')) {
      // console.log(a.emoji.name);
      await a.message.guild.members.fetch();
      const u: GuildMember = a.message.guild.member(b as User);

      let roles = [];
      for (let f of [a_role, b_role, c_role, d_role] as Role[]) {
        if (u.roles.cache.some((a) => { return a.id == f.id })) {
          console.log('user has ' + f.name);
          roles.push(f);
        }
      }

      let map = {
        "🇦": a_role,
        "🇧": b_role,
        "🇨": c_role,
        "🇩": d_role
      }

      for (let ark of Object.keys(map)) {
        if (a.emoji.name == ark) {
          roles.push(map[ark]);
          u.roles.add(map[ark]);
        }
      }

      if (roles.length > 0) {
        u.roles.add(member_role);
      } else {
        u.roles.remove(member_role);
      }
    }
  }
});
client.on('messageReactionRemove', async (a: MessageReaction, b: User | PartialUser) => {
  if (a.partial) {
    try {
      await a.fetch();
    } catch (err) {
      console.error(err);
      return;
    }
  }
  if (b.partial) {
    try {
      await b.fetch();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  if (a.message.channel instanceof TextChannel) {
    const t = a.message.channel as TextChannel;
    if (t.name.toLowerCase().includes('roles')) {
      // console.log(a.emoji.name);
      await a.message.guild.members.fetch();
      const u: GuildMember = a.message.guild.member(b as User);

      let roles = [];
      for (let f of [a_role, b_role, c_role, d_role] as Role[]) {
        if (u.roles.cache.some((a) => { return a.id == f.id })) {
          console.log('user has ' + f.name);
          roles.push(f);
        }
      }

      let map = {
        "🇦": a_role,
        "🇧": b_role,
        "🇨": c_role,
        "🇩": d_role
      }

      for (let ark of Object.keys(map)) {
        if (a.emoji.name == ark) {
          roles = roles.filter((afr: Role) => { return afr.id != map[ark].id });
          u.roles.remove(map[ark]);
        }
      }

      if (roles.length > 0) {
        u.roles.add(member_role);
      } else {
        u.roles.remove(member_role);
      }
    }
  }
});

const userSounds = {
  '597812443057750016': 'yup.mp3', // yous
  '434749785518505984': 'house.mp3', // robbe
  '389006437613043712': 'sans.mp3', // luc
  '758631774154391572': 'yup.mp3', // mr.stupid
  '322045906449072129': 'ahri.mp3', // daan
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.member.user.bot)
      return;
    

  if (oldState.channel == null && newState.channel != null) {
    newState.member.roles.add([voice_role]);
    console.log(newState.member.displayName + " " + newState.member.user.id);

    // const f = newState.connection.receiver.createStream(newState.member.user, {mode: "opus"});


    // insert code hier
    if (userSounds[newState.member.user.id] != null) {
      // RICK ROLL
      const a = await newState.channel.join();
      const str = a.play(fs.createReadStream(path.join(__dirname, '../assets/' + userSounds[newState.member.user.id])))
      str.on('finish', async () => {
        await a.disconnect();
      });
    }
  }
  if (oldState.channel != null && newState.channel == null) {
    newState.member.roles.remove(voice_role);
  }
});

client.on('message', async (msg: Message) => {
  if (!(msg.channel instanceof TextChannel))
    return;
  if (msg.author.bot)
    return;

  if (msg.content === '!help') {
    BombMSG.send({ channel: msg.channel, msg: 'List of Commands ```javascript\n!invite // Laat de invite link zien\n!ping // Ping!\n!ip // Laat uw IP-Address zien```Self Destructs in %s', alsoDelete: [msg], timeUntilDeletion: 20, timeUntilUpdate: 5 });
    return;
  }
  if (msg.content === '!aot') {
    BombMSG.send({ channel: msg.channel, msg: 'Shinzou wo Sasageyo```Self Destructs in %s', alsoDelete: [msg], timeUntilDeletion: 20, timeUntilUpdate: 5 });
    return;
  }
  if (msg.content === '!invite') {
    BombMSG.send({ channel: msg.channel, msg: 'INVITE LINK: https://lvk.sh/ict\n\nThis message self destructs in %s seconds!', timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1 })
    // const m = await BombMSG.send(msg.channel, 'INVITE LINK: https://lvk.sh/ict\n\nThis message self destructs in %s seconds!', 5, [msg]);
    return;
  }
  if (msg.content === '!links') {
    BombMSG.send({ channel: msg.channel, msg: '\nFacebook WINAK group: <https://www.facebook.com/groups/787046402121728\>\nWINAK website: <https://www.winak.be/>\nDiscord invite link: <https://lvk.sh/ict>\nBlackboard: <https://blackboard.uantwerpen.be/>\nCSA: <http://msdl.cs.mcgill.ca/people/hv/teaching/ComputerSystemsArchitecture/>\nGAS: <https://app.perusall.com/courses/gegevensabstractie-en-structuren/_/dashboard/startup>\nIP (Inginious): <https://inginious.uantwerpen.be/course/IP2021>', timeUntilDeletion: 60, alsoDelete: [msg], timeUntilUpdate: 1 })
    // msg.channel.send('\nFacebook WINAK group: <https://www.facebook.com/groups/787046402121728\>\nWINAK website: <https://www.winak.be/>\nDiscord invite link: <https://lvk.sh/ict>\nBlackboard: <https://blackboard.uantwerpen.be/>\nFree hacking tools: <https://zws.im/‍‌‌‌‌‌‌‍‍‍> \n');
    return;
  }
  if (msg.content.startsWith('!ip')) {
    let m = 'Your IP Address is ``' + getIP(msg.author.id);

    if (msg.mentions.users.size) {
      m = '<@' + msg.mentions.users.first().id + '>\'s ip is ``' + getIP(msg.mentions.users.first().id);
    }

    if (!msg.channel.name.toLowerCase().includes('bot')) {
      msg.reply(m + '``\n\nThis message does not self destruct!');
    } else {
      BombMSG.send({ channel: msg.channel, msg: m + '``\n\nThis message self destructs in %s seconds!', timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1 })
    }
    return;
  }
  if (msg.content === '!ping') {
    // msg.reply('Pong!');
    msg.react('😄');
    BombMSG.send({
      channel: msg.channel, msg: '<@' + msg.author.id + '> ' + rand([
        'NO U',
        'Eugh, PONG!, happy now?',
        'NO! JUST NO!',
        'DONT TOUCH ME LIKE THAT'
      ]), timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1
    })
    return;
  }
  if (msg.cleanContent.includes('kill me')) {
    BombMSG.send({
      channel: msg.channel, msg: '<@' + msg.author.id + '> ' + rand([
        'Yeah, that sounds like a good idea',
        'How about no',
        'Maybe not',
        'OK NOU OPHOUWE HE!',
        'BRUH WTF',
        'CHILL HOMIE',
        'HMMMM Meh'
      ]), timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1
    })
    return;
  }
  if (msg.cleanContent.includes('senpai')) {

    BombMSG.send({
      channel: msg.channel, msg: '<@' + msg.author.id + '> ' + rand([
        'NOTICE ME SENPAIIII',
        'LOL OK'
      ]), timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1
    })
    return;
  }

  if (msg.channel.name.toLowerCase().includes('bot')) {
    msg.delete();
    BombMSG.send({ channel: msg.channel, msg: '``' + msg.cleanContent + '`` was not recognized as a command, try ``!help`` for a list of commands.', timeUntilDeletion: 5, alsoDelete: [msg], timeUntilUpdate: 1 })
  }
});

client.login(process.env.TOKEN);
