const chalk = require('chalk')
let looped = 0

const id = Date.now()
const x = setInterval(() => {
  console.log(`The second loop ${chalk.greenBright(id)}`, looped, new Date())
  looped++
  if (looped > 50) {
    console.log(`kill the loop ${id}`)
    clearInterval(x)
  }
}, 900)
