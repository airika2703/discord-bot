const { MessageActionRow,
        MessageButton, 
        Client, Intents, 
        Interaction, 
        MessageEmbed, 
        Webhook, 
        WebhookClient , 
        Permissions} = require('discord.js');
require("dotenv").config();
const {loadMusic} = require('../musicYTB/music');
const config = require('../config.json');
const client = new Client({
  partials: ['MESSAGE', 'REACTION'] ,
  intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES
  ] 
});

// client.on('messageCreate', async message => {
//     if (message.content == 'ping') {
//         await message.reply('Hello');
//     }
// });

client.on('messageCreate', async message => {

	if (message.content === 'ping') {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Primary')
					.setStyle('PRIMARY'),
			);

		await message.reply({ content: 'Pong!', components: [row] });
	} 
  else if (message.content === 'infor') {
		const embed = new MessageEmbed()
			.setColor('#379c6f')
			.setTitle('Facebook: Khang Lê')
			.setURL('https://www.facebook.com/khangle.1627')
			.setDescription('Infor me');

		await message.reply({ content: 'Here!', embeds: [embed] , ephemeral: true });
};

});
/* ===========Kick ban annouce==================  */

const webhookClient = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN  });

// const webhookClient = new WebhookClient(
//   process.env.WEBHOOK_ID,
//   process.env.WEBHOOK_TOKEN,
// );

const PREFIX = "/";


client.on('messageCreate', async message => {
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
      if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS))
        return false;
      if (args.length === 0)
        return message.reply('Hãy nhập ID');
      const member = message.guild.members.cache.get(args[0]);
      if (member) {
        member
          .kick()
          .then((member) => message.channel.send(`${member} đã bị đuổi.`))
          .catch((err) => message.reply(`${author} không cho phép tôi làm điều này :'()`));
      } else {
        message.reply('Người dùng không tồn tại');
      }
    } else if (CMD_NAME === 'ban') {
      if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
        return false;
      if (args.length === 0) return message.reply("Hãy nhập ID");
      try {
        const user = await message.guild.members.ban(args[0]);
        message.channel.send('Người dùng đã bị cấm vĩnh viễn');
      } catch (err) {
        // console.log(err);
        message.reply('Đã có lỗi hoặc tôi chưa được phép làm điều này!');
      }
    } else if (CMD_NAME === 'tb') {
      console.log(args);
      const msg = args.join(' ');
      console.log(msg);
      webhookClient.send({ content: msg });
    }
  }
});



client.on('ready', () => {
  console.log(`${client.user.tag} đã đăng nhập.`);
});


client.login(process.env.BOT_TOKEN);
