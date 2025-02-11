const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');
const { exec } = require('child_process');

const wss = new WebSocketServer({ port: 9967 });
const watchCallbacks = [];

chokidar.watch('./posts').on('change', (post) => {
  watchCallbacks.forEach((cb) => cb(post));
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  watchCallbacks.push(onChange);
  ws.on('close', function close() {
    const idx = watchCallbacks.findIndex(onChange);
    watchCallbacks.splice(idx, 1);
  });

  function onChange(post) {
    ws.send(JSON.stringify({ cmd: 'refresh', body: post }));

    exec('npm run generate', (err, stdout, stderr) => {
      if (err) {
        console.error(`Failed to execute script: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
});
