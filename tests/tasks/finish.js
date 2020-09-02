let looped = 0

const x = setInterval(() => {
  console.log('The work that will finish', looped, new Date())
  looped++
  if (looped > 6) {
    console.log('Finish Work')
    clearInterval(x)
    process.exit(0)
  }
}, 900)
