let looped = 0

const x = setInterval(() => {
  console.log('The post work loop', looped, new Date())
  looped++
  if (looped > 6) {
    console.log('end the post work loop')
    clearInterval(x)
    process.exit(0)
  }
}, 900)
