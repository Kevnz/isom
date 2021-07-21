import React, {
  useRef,
  useEffect,
  useContext,
  createContext,
  useState,
} from 'react'
import blessed from 'blessed'
import { each } from '@kev_nz/async-tools'
import { createBlessedRenderer } from 'react-blessed'

const render = createBlessedRenderer(blessed)
const useSpawn = require('./use-spawn')

const initialState = {
  tasks: [],
  finished: 0,
}
const runningTasks = []
const AppContext = createContext(initialState)

const AppProvider = ({ children, totalTasks, onEnd }) => {
  const [tasksComplete, setTaskComplete] = useState(0)

  useEffect(() => {
    if (totalTasks === tasksComplete) {
      onEnd()
    }
  }, [tasksComplete])

  return (
    <AppContext.Provider
      value={{
        onEnd: () => {},
        totalTasks: totalTasks,
        tasksComplete,
        completeTask: () => {
          setTaskComplete(tasksComplete + 1)
        },
      }}
      onEnd={() => {}}
      totalTasks={totalTasks}
      completeTask={() => {
        setTaskComplete(tasksComplete + 1)
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const stylesheet = {
  bordered: {
    border: {
      type: 'line',
    },
    hover: {
      bg: 'green',
    },
    style: {
      border: {
        fg: 'blue',
      },
    },
  },
}

const Job = ({ label, command, index, ...props }) => {
  const boxRef = useRef(null)
  const context = useContext(AppContext)

  const [message, finished, killTask] = useSpawn(command, index)

  if (boxRef.current) {
    boxRef.current.setScrollPerc(100)
  }
  useEffect(() => {
    runningTasks.push(killTask)
  }, [])
  useEffect(() => {
    if (finished) {
      context.completeTask()
    }
    return () => {
      console.log('clean up task')
    }
  }, [finished])

  return (
    <log
      ref={boxRef}
      label={label}
      keys={true}
      mouse={true}
      scrollable={true}
      tags={true}
      // eslint-disable-next-line react/no-unknown-property
      class={[stylesheet.bordered]}
      {...props}
    >
      {message}
    </log>
  )
}

// Rendering a simple centered box
const App = ({ tasks, end }) => {
  const totalTasks = tasks.length
  const percent = 100 / totalTasks
  const jobs = tasks.map((task, index) => {
    return (
      <Job
        index={index}
        key={`task-${task}-${index}`}
        command={task}
        label={`Task - ${task}`}
        width={`${percent}%`}
        height="100%"
        top="0"
        left={`${index * percent}%`}
      ></Job>
    )
  })

  return (
    <AppProvider totalTasks={totalTasks} onEnd={end}>
      <element>{jobs}</element>
    </AppProvider>
  )
}

module.exports = (tasksToRun, postcommand, cleanupcommand, tryTask) => {
  const screen = blessed.screen({
    terminal: 'xterm-256color',
    autoPadding: true,
    smartCSR: true,
    title: 'Isom Task Runner',
  })
  let isCleanup = false

  const finish = async () => {
    if (isCleanup) return
    isCleanup = true
    const postResult = await tryTask(postcommand, `post`)
    console.info(`Finished running the post task`, postResult)
    const cleanupResult = await tryTask(cleanupcommand, `cleanup`)
    console.info(`Finished running the cleanup task`, cleanupResult)
    console.info(`Finished running the task`)
    return process.exit(0)
  }
  const endWork = async () => {
    screen.destroy()
    await finish()
  }

  screen.key(['escape', 'q', 'C-c'], async function(ch, key) {
    await each(runningTasks, async killTask => {
      try {
        await killTask()
      } catch (err) {
        console.error('?', err)
      }
    })
    this.destroy()
    await finish()
  })
  console.info('starting main task')
  render(<App tasks={tasksToRun} end={endWork} />, screen)
}
