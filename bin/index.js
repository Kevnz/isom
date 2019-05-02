#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const chalk = require('chalk')
const { each, mapper } = require('@kev_nz/async-tools')
const spawned = require('../src/spawn')

console.info(chalk.bgBlue.white.bold('ISOM Task Runner'))

const curDir = process.cwd()

fs.readFile(path.join(curDir, 'tasks.json'), 'utf8', async (err, result) => {
  if (err && err.code === 'ENOENT') {
    console.info(chalk.yellow('No tasks.json file'))
    const pkg = require(path.join(curDir, 'package.json'))
    await fse.writeFile('tasks.json', JSON.stringify(pkg.scripts, null, 2))

    console.info(chalk.bold('A tasks.json file has been created'))
    process.exit(0)
  } else if (err) {
    console.error(chalk.red('Error reading tasks.json file'))
    console.error(err)
    process.exit(1)
  }

  const task = process.argv.length > 2 ? process.argv.pop() : 'start'

  const tasks = JSON.parse(result)
  const command = tasks[task]

  const precommand = tasks[`pre${task}`]
  const postcommand = tasks[`post${task}`]
  const cleanupcommand = tasks[`cleanup${task}`]

  let commandRunning = false
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
  const tryMainTask = async taskCommand => {
    try {
      if (Array.isArray(taskCommand)) {
        await mapper(taskCommand, spawned)
      } else {
        await spawned(taskCommand)
      }
      return 0
    } catch (taskErr) {
      console.error(`The Task ${taskCommand} failed with code`, taskErr)
      return taskErr
    }
  }
  try {
    commandRunning = true
    const preresult = await tryTask(precommand, `pre${task}`)
    commandRunning = false

    if (preresult > 0) process.exit(preresult)

    commandRunning = true
    const result = await tryMainTask(command)

    console.info(`The ${task} task is ${chalk.green('done')}`)
    commandRunning = false

    if (result > 0) {
      console.warn(`Task ${command} failed`)
    }
    const postResult =
      result === 0 ? await tryTask(postcommand, `post${task}`) : result

    const cleanupResult = await tryTask(cleanupcommand, `cleanup${task}`)

    console.info(`Finished running the task ${chalk.bold(task)}`)
    process.exit(preresult + result + postResult + cleanupResult)
  } catch (error) {
    console.error(error)
    console.error(`\r\nError running task ${chalk.bold(task)}`)
    if (error > 0) {
      process.exit(error)
    }
    process.exit(1)
  }
})
