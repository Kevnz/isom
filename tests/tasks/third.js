let looped = 0
const id = Date.now()
const x = setInterval(() => {
  console.log(`The third loop ${id}`, looped, new Date())
  looped++
  if (looped > 50) {
    console.log(`kill the loop ${id}`)
    clearInterval(x)
  }
}, 900)
