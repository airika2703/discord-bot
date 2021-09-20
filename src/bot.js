require("dotenv").config();
const {loadMusic} = require('../musicYTB/music');
const config = require('../config.json');

const { Client, WebhookClient } = require('discord.js');

const client = new Client({
  partials: ['MESSAGE', 'REACTION']
});

const webhookClient = new WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN,
);

const PREFIX = "$";

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on('message', async (message) => {
  console.log(`[${message.author.tag}] : ${message.content}`)
  if (message.content === 'hello') {
    message.reply('Hello im here!');
  }
  if (message.content === 'bot ngu') {
    message.reply('Nghĩa ngu =))');
  }

  if (message.author.bot) return;
  if (message.content.startsWith(config.musicPrefix)) {
    const args = message.content
      .slice(config.musicPrefix.length)
      .trim()
      .split(/ +/);
    loadMusic(config, args, message);
}
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    if (CMD_NAME === 'kick') {
      if (!message.member.hasPermission('KICK_MEMBERS'))
        return false;
      if (args.length === 0)
        return message.reply('Hãy nhập ID');
      const member = message.guild.members.cache.get(args[0]);
      if (member) {
        member
          .kick()
          .then((member) => message.channel.send(`${member} đã bị đuổi.`))
          .catch((err) => message.channel.send(`${author} không cho phép tôi làm điều này :'()`));
      } else {
        message.channel.send('Người dùng không tồn tại');
      }
    } else if (CMD_NAME === 'ban') {
      if (!message.member.hasPermission('BAN_MEMBERS'))
        return false;
      if (args.length === 0) return message.reply("Hãy nhập ID");
      try {
        const user = await message.guild.members.ban(args[0]);
        message.channel.send('Người dùng đã bị cấm vĩnh viễn');
      } catch (err) {
        console.log(err);
        message.channel.send('Đã có lỗi hoặc tôi chưa được phép làm điều này!');
      }
    } else if (CMD_NAME === 'an') {
      console.log(args);
      const msg = args.join(' ');
      console.log(msg);
      webhookClient.send(msg);
    }
  }
});

// client.on('messageReactionAdd', (reaction, user) => {
//   const { name } = reaction.emoji;
//   const member = reaction.message.guild.members.cache.get(user.id);
//   if (reaction.message.id === '738666523408990258') {
//     switch (name) {
//       case '🍎':
//         member.roles.add('738664659103776818');
//         break;
//       case '🍌':
//         member.roles.add('738664632838782998');
//         break;
//       case '🍇':
//         member.roles.add('738664618511171634');
//         break;
//       case '🍑':
//         member.roles.add('738664590178779167');
//         break;
//     }
//   }
// });

// client.on('messageReactionRemove', (reaction, user) => {
//   const { name } = reaction.emoji;
//   const member = reaction.message.guild.members.cache.get(user.id);
//   if (reaction.message.id === '738666523408990258') {
//     switch (name) {
//       case '🍎':
//         member.roles.remove('738664659103776818');
//         break;
//       case '🍌':
//         member.roles.remove('738664632838782998');
//         break;
//       case '🍇':
//         member.roles.remove('738664618511171634');
//         break;
//       case '🍑':
//         member.roles.remove('738664590178779167');
//         break;
//     }
//   }
// });

client.login(process.env.BOT_TOKEN);

