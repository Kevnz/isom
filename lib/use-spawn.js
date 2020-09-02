"use strict";

const {
  spawn
} = require('child_process');

const {
  useEffect,
  useState
} = require('react');

const chalk = require('chalk');

const runningTasks = {};
let subTask = null;

module.exports = (command, index) => {
  const inputs = [];
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);

  const singleSpawn = command => {
    process.env.FORCE_COLOR = 'true';
    subTask = spawn(command, {
      cwd: process.cwd(),
      shell: true
    }, {
      env: {
        FORCE_COLOR: 'true'
      }
    });
    return subTask;
  };

  const killTask = () => {
    subTask.kill('SIGINT');
  };

  useEffect(() => {
    if (runningTasks[command] === index) {
      return;
    }

    runningTasks[command] = index;
    const cmd = singleSpawn(command);
    cmd.stdout.on('data', data => {
      inputs.push(data);
      setMessage(inputs.join(''));
    });
    cmd.stderr.on('data', data => {
      inputs.push(data);
      setMessage(inputs.join(''));
    });
    cmd.on('exit', code => {
      if (code === 0) {
        setFinished(true);
      }
    });
  }, []);
  return [message, finished, killTask];
};