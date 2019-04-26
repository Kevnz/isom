# Isom

Take your task runner further

If you have a `tasks.json` file running `isom` or `npx isom` will run the task you pass in or the start task.

## Example

The `tasks.json` file

```json
{
  "prebuild": ["npx eslint ./src", "npx jest", "rm -rf dist"],
  "build": "npx webpack --config ./src/webpack/prod.config.js --mode production",
  "postbuild": ["npm publish", "npx publisher", "node ./src/tasks/announce.js"]
}
```

Then from the command line you can either run `npx isom build` or if installed globally `isom build`

You can use it within your `scripts` so in your `package.json`

```json
{
  "build": "isom build"
}
```

