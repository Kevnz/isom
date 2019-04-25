#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { each } = require('@kev_nz/async-tools')
const spawned = require('../src/spawn')

console.info(chalk.blue.bold('ISOM'))
const curDir = process.cwd()

const example = {
  start: 'node ./src/index.js',
}

fs.readFile(path.join(curDir, 'tasks.json'), 'utf8', async (err, result) => {
  if (err && err.code === 'ENOENT') {
    console.error('No tasks.json file')
    // write example file
    return
  } else if (err) {
    console.error('Error reading tasks.json file')
    console.error(err)
    return
  }

  const task = process.argv.length > 2 ? process.argv.pop() : 'start'

  const tasks = JSON.parse(result)
  const command = tasks[task]

  const precommand = tasks[`pre${task}`]
  const postcommand = tasks[`post${task}`]
  try {
    if (precommand && Array.isArray(precommand)) {
      await each(precommand, spawned)
    } else if (precommand) {
      await spawned(precommand)
    }

    await spawned(command)

    if (postcommand && Array.isArray(postcommand)) {
      await each(postcommand, spawned)
    } else if (postcommand) {
      await spawned(postcommand)
    }
    process.exit(0)
  } catch (error) {
    console.error(`\r\nError running task ${chalk.bold(task)}`)
    if (error > 0) {
      process.exit(error)
    }
    process.exit(1)
  }
})
