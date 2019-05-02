# Isom

Take your task runner further

If you have a `tasks.json` file running `isom` or `npx isom` will run the task you pass in or the start task.

## Lifecyle

For every task you can define you can also have a `pre` `post` as well as a `cleanup` associated with it.

* `pre` runs before the main command.
* `command` runs if the `pre` command is successful
* `post` runs if the `command` was successful
* `clean` runs regardless of the success or failure of the other tasks

## Example

The `tasks.json` file

```json
{
  "prebuild": ["npx eslint ./src", "npx jest", "rm -rf dist"],
  "build": "npx webpack --config ./src/webpack/prod.config.js --mode production",
  "postbuild": ["npm publish", "npx publisher", "node ./src/tasks/announce.js"],
  "cleanupbuild": "rm -rf dist"
}
```

Then from the command line you can either run `npx isom build` or if installed globally `isom build`

You can use it within your `scripts` so in your `package.json`

```json
{
  "build": "isom build"
}
```

## Parallel Tasks

In addition to single items, a task can be an array of items. If the array is a pretask they execute in a series, however if the array is the main task to run, the tasks run in parallel.

### Example

```json
{
  "predev": [
    "docker-compose -f ./docker/docker-compose.yml up --detach",
    "node ./src/scripts/delay.js",
    "npx knex migrate:latest",
    "npx knex seed:run"
  ],
  "dev": [
    "nodemon ./src/server/index.js",
    "webpack-dev-server --config ./src/webpack/dev.config.js --mode development"
  ]
}
```

Then from command line

```bash
isom dev
```

Then the `predev` tasks run in order then then `dev` task executes both tasks at the same time.
