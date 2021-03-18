const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
	host: 'localhost',
	port: 55699,
	username: 'slurp'
})

const welcome = () => {
	bot.chat('wooow!')
}

bot.on('spawn', welcome)
//woof
