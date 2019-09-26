# overlayer

A simple Electron app that starts a web server that lets you overlay an arbitrarily HTML content on your screen.

## Usage

### Setting up a secret key

To secure the application from being used by unauthorized clients, we need to generate a secret key first.
This will do, I guess:

```shell
node -p "crypto.randomBytes(20).toString('hex')"
```

Then, create a configuration file and put it at `$HOME/.overlayerrc.json`:

```json
{
  "key": "7d382308f2a4b8c2a1165bc801bd49ebc3751b3c"
}
```

When you run the app, it will say “Overlayer is ready” onscreen.
It will also bind a web server to localhost:29292.

### Displaying an overlay

You can run the following script to display some text on screen:

```js
fetch(
  'http://localhost:29292/overlayer/7d382308f2a4b8c2a1165bc801bd49ebc3751b3c',
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      overlays: {
        hello: `
          <div style="font: bold 200px sans-serif; color: white; text-shadow: 0 3px 16px black">
            Hello, world!
          </div>
        `
      },
    }),
  },
)
```

This creates an overlay with ID `hello` with the specified HTML content.

This application can display multiple overlays, identified by its ID.
This allows multiple applications and scripts to display an overlay on the screen without each application having to create its own window.

### Removing an overlay

To clear the overlay, just set its content to `null`:

```js
fetch(
  'http://localhost:29292/overlayer/7d382308f2a4b8c2a1165bc801bd49ebc3751b3c',
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      overlays: {
        hello: null
      },
    }),
  },
)
```

### Restarting the app

In case some overlays get stuck on the screen or made your system unusable,
you can restart the app, which clears all the overlays onscreen, by pressing Command+Option+Control+Shift+R.