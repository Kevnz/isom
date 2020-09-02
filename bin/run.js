#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const chalk = require('chalk')
const { each, mapper } = require('@kev_nz/async-tools')
const spawned = require('../lib/spawn')

console.info(chalk.bgBlue.white.bold('ISOM Task Runner'))

const curDir = process.cwd()

const result = fs.readFileSync(path.join(curDir, 'tasks.json'), 'utf8')

const task = process.argv.length > 2 ? process.argv.pop() : 'start'

const tasks = JSON.parse(result)
const command = tasks[task]

const precommand = tasks[`pre${task}`]
const postcommand = tasks[`post${task}`]
const cleanupcommand = tasks[`cleanup${task}`]

const tryTask = async (taskCommand, taskName) => {
  try {
    if (taskCommand && Array.isArray(taskCommand)) {
      await each(taskCommand, spawned)
    } else if (taskCommand) {
      await spawned(taskCommand)
    } else {
      console.warn(`No ${taskName} found ${chalk.yellow('skipping')}`)
      return 0
    }
    console.info(`The ${taskName} task is ${chalk.green('done')}`)
    return 0
  } catch (taskErr) {
    console.error(
      `The ${chalk.bold(taskName)} task '${taskCommand}' failed with code`,
      taskErr
    )
    return taskErr
  }
}

const commandRunning = false
let sigIntCall = 0
process.on('SIGINT', function() {
  sigIntCall++
  if (commandRunning) {
    console.info('Wait for command to stop')
  }
  if (sigIntCall > 4) {
    console.warn('Multiple SIGINT calls, exiting process now')
    process.exit(0)
  }
})

const run = async () => {
  try {
    const preresult = await tryTask(precommand, `pre${task}`)
    if (preresult > 0) process.exit(preresult)
  } catch (error) {}
  const App = require('../lib/ui')(
    command,
    postcommand,
    cleanupcommand,
    tryTask
  )
}

run()
