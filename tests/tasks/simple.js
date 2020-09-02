const chalk = require('chalk')

const loopKey = Date.now()

setInterval(() => {
  console.log(chalk.bgBlue.greenBright.bold(`The loop ${loopKey}`), new Date())
}, 1500)
