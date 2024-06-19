# Test MFE container application

## How to run the app + MFE remote

```
// in host project
npm run dev

// in remote
Terminal 1: npm run build:watch
Terminal 2: npm run preview
```

This is needed as `run dev` is bundle-less, and therefore the host will not find the remoteEntry.js (it's a bit strange as when you hit in the browser, the URL does seem to work, however it's a 404 from inside the host app).

Hot reloading does not work, you will need to manually reload the host app.
