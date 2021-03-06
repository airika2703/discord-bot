const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    NoSubscriberBehavior,
    AudioPlayerStatus 
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const playlist = new Map();

class Queue {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.player = null;
        this.songs = [];
        this.volume = 100;
        this.playing = true;
        this.repeat = false;
    }

    
    // Volume
    setVolume(val) {
        this.volume = val;
    }

    // Set playing
    setPlaying(bool) {
        this.playing = bool;
    }

    // Set loop
    setLoop(bool) {
        this.repeat = bool;
    }
}

class Song {
    constructor(title, url, length) {
        this.title = title;
        this.url = url;
        this.length = length;
    }
}

const ytMusic = {
    loadMusic: async function (config, args, message) {
        const command = args[0].toLowerCase();
        let serverQueue = playlist.get(message.guild.id);
        if (command === 'play') {
            let voiceChannel = message.member.voice.channel;
            // let permissions = voiceChannel.permissionsFor(message.client.user);
            let url = args.slice(1).join(' ');
            if (!voiceChannel || voiceChannel.name !== config.musicChannelName) {
                message.reply('Vào kênh `🎶' + config.musicChannelName + '🎶` để có thể nghe nhạc!');
                return false;
            }

            // for (var value of config.musicChannelPerms) {
            //     if (!permissions.has(value)) {
            //         message.reply('Chưa cấp quyền `' + value + '` vào kênh phát này!');
            //         return false;
            //     }
            // }

            try {
                await ytdl.getInfo(url);
            } catch(error) {
                message.reply('ID / URL không tồn tại');
                return false;
            }

            let { videoDetails } = await ytdl.getInfo(url);
            const song = new Song(videoDetails.title, videoDetails.video_url, videoDetails.lengthSeconds);
            if (!serverQueue) {
                let queue = new Queue(voiceChannel);
                playlist.set(message.guild.id, queue);
                queue.songs.push(song);
                let connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator
                })
                queue.connection = connection;
                let player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });
                queue.player = player;
                const play = playSong(message);
                if (play) {
                    await message.reply(':headphones: Đang phát: ' + song.title + ' :headphones: (' + song.length + ' giây)');
                }
                return true;
            }
            serverQueue.songs.push(song);
            message.reply('🎶 **Đã yêu cầu:** __' + song.title + '__ 🎶');
        }
        if (command === 'clear') {
            if (!serverQueue) return false;
            serverQueue.songs = [];
            serverQueue.player.stop();
        }

        if (command === 'next') {
            if (!serverQueue) return false;
            serverQueue.player.stop();
        }

        if (command === 'pause') {
            if (!serverQueue) return false;
            serverQueue.player.pause();
        }

        if (command === 'resume') {
            if (!serverQueue) return false;
            serverQueue.player.unpause();
        }

        if (command === 'loop') {
            if (!serverQueue) return false;
            if (serverQueue.repeat) {
                serverQueue.setLoop(false);
                message.reply(':loop: Tắt lặp: ' + serverQueue.songs[0].title + ' :loop:');
                return true;
            }
            serverQueue.setLoop(true);
            message.reply(':loop: Bật lặp: ' + serverQueue.songs[0].title + ' :loop:');
        }

        if (command === 'playlist') {
            if (!serverQueue) return false;
            let result = serverQueue.songs.map((song, i) => {
                return `${(i == 0) ? `\n🎧 **Đang phát:** __` : `🎧 **${i}.** __`} ${song.title}__ 🎧 ** ${song.length} giây)** `
            }).join('\n');
            message.reply(result);
        }

        

        
    }
}
async function playSong(message) {
    const serverQueue = playlist.get(message.guild.id);

    if (!serverQueue) return;

    if (serverQueue.songs.length < 1) {
        serverQueue.connection.destroy();
        playlist.delete(message.guild.id);
        message.reply(":stop_button: Hết dữ liệu yêu cầu :stop_button:");
        return false;
    }

    let song = serverQueue.songs[0];
    let audio = ytdl(song.url, {
        quality: 'highestaudio',
        highWaterMark: 1024 * 1024 * 12,
        dlChunkSize: 0
    });

    const resource = createAudioResource(audio, { inlineVolume: true });
    resource.volume.setVolume(serverQueue.volume / 70);

    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
    serverQueue.player.on(AudioPlayerStatus.Idle, async function () {
        if (!serverQueue.repeat) serverQueue.songs.shift();
        playSong(message);
        return true;
    });

    return true;
}
module.exports = ytMusic;
