"use strict";

const {
  exec
} = require('child_process');

module.exports = async command => new Promise((resolve, reject) => {
  return exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      console.error(stderr);
      reject(err);
    }

    console.info(stdout.toString());
    console.info('Done');
    resolve();
  });
});