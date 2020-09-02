let looped = 0
const chalk = require('chalk')
const label = process.argv.length > 2 ? process.argv.pop() : 'No Label'
const id = Date.now()
console.log('PROCESS ENV', process.env)
const x = setInterval(() => {
  console.log(`The ${label} ${chalk.greenBright(id)}`, looped, new Date())
  looped++
  if (looped > 46) {
    console.log(`Finished ${label} ${id}`)
    clearInterval(x)
    process.exit(0)
  }
}, 900)
