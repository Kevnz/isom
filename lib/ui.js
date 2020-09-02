"use strict";

var _react = _interopRequireWildcard(require("react"));

var _blessed = _interopRequireDefault(require("blessed"));

var _reactBlessed = require("react-blessed");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const render = (0, _reactBlessed.createBlessedRenderer)(_blessed.default);

const useSpawn = require('./use-spawn');

const initialState = {
  tasks: [],
  finished: 0
};
const runningTasks = [];
const AppContext = /*#__PURE__*/(0, _react.createContext)(initialState);

const AppProvider = ({
  children,
  totalTasks,
  onEnd
}) => {
  const [tasksComplete, setTaskComplete] = (0, _react.useState)(0);
  (0, _react.useEffect)(() => {
    if (totalTasks === tasksComplete) {
      onEnd();
    }
  }, [tasksComplete]);
  return /*#__PURE__*/_react.default.createElement(AppContext.Provider, {
    value: {
      onEnd: () => {},
      totalTasks: totalTasks,
      tasksComplete,
      completeTask: () => {
        setTaskComplete(tasksComplete + 1);
      }
    },
    onEnd: () => {},
    totalTasks: totalTasks,
    completeTask: () => {
      setTaskComplete(tasksComplete + 1);
    }
  }, children);
};

const stylesheet = {
  bordered: {
    border: {
      type: 'line'
    },
    hover: {
      bg: 'green'
    },
    style: {
      border: {
        fg: 'blue'
      }
    }
  }
};

const Job = ({
  label,
  command,
  index,
  ...props
}) => {
  const boxRef = (0, _react.useRef)(null);
  const context = (0, _react.useContext)(AppContext);
  const [message, finished, killTask] = useSpawn(command, index);

  if (boxRef.current) {
    boxRef.current.setScrollPerc(100);
  }

  (0, _react.useEffect)(() => {
    runningTasks.push(killTask);
  }, []);
  (0, _react.useEffect)(() => {
    if (finished) {
      context.completeTask();
    }

    return () => {
      console.log('clean up task');
    };
  }, [finished]);
  return /*#__PURE__*/_react.default.createElement("log", _extends({
    ref: boxRef,
    label: label,
    scrollable: true,
    tags: true // eslint-disable-next-line react/no-unknown-property
    ,
    class: [stylesheet.bordered]
  }, props), message);
}; // Rendering a simple centered box


const App = ({
  tasks,
  end
}) => {
  const totalTasks = tasks.length;
  const percent = 100 / totalTasks;
  const jobs = tasks.map((task, index) => {
    return /*#__PURE__*/_react.default.createElement(Job, {
      index: index,
      key: `task-${task}-${index}`,
      command: task,
      label: `Task - ${task} - ${percent}`,
      width: `${percent}%`,
      height: "100%",
      top: "0",
      left: `${index * percent}%`
    });
  });
  return /*#__PURE__*/_react.default.createElement(AppProvider, {
    totalTasks: totalTasks,
    onEnd: end
  }, /*#__PURE__*/_react.default.createElement("element", null, jobs));
};

module.exports = (tasksToRun, postcommand, cleanupcommand, tryTask) => {
  const screen = _blessed.default.screen({
    terminal: 'xterm-256color',
    autoPadding: true,
    smartCSR: true,
    title: 'Isom Task Runner'
  });

  let isCleanup = false;

  const finish = async () => {
    if (isCleanup) return;
    isCleanup = true;
    const postResult = await tryTask(postcommand, `post`);
    console.info(`Finished running the post task`, postResult);
    const cleanupResult = await tryTask(cleanupcommand, `cleanup`);
    console.info(`Finished running the cleanup task`, cleanupResult);
    console.info(`Finished running the task`);
    return process.exit(0);
  };

  const endWork = async () => {
    screen.destroy();
    await finish();
  };

  screen.key(['escape', 'q', 'C-c'], async function (ch, key) {
    runningTasks.forEach(killTask => {
      try {
        killTask();
      } catch (err) {
        console.error('?', err);
      }
    });
    this.destroy();
    await finish();
  });
  console.info('starting main task');
  render( /*#__PURE__*/_react.default.createElement(App, {
    tasks: tasksToRun,
    end: endWork
  }), screen);
};