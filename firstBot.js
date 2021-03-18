const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
	host: 'localhost',
	port: 55699,
	username: 'slurp'
})

const welcome = () => {
	bot.chat('HOWDY!')
}

bot.on('spawn', welcome)
