"use strict";

const {
  spawn
} = require('child_process');

module.exports = async command => new Promise((resolve, reject) => {
  const cmd = spawn(command, {
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit'
  });
  cmd.on('exit', code => {
    if (code === 0) return resolve(code);
    return reject(code);
  });
});