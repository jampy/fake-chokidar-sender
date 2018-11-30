const chokidar = require("chokidar");
const dgram = require('dgram');
const relative = require("path").relative;


let port = 49494;
let host = "127.0.0.1";


const netClient = dgram.createSocket('udp4');


function monitor(localPath, sharePath) {

  console.log("monitor", {localPath, sharePath});

  const handle = chokidar.watch(localPath, {
    ignoreInitial: true,
  });

  handle.on("all", (event, path) => {

    path = relative(localPath, path).split("\\").join("/");

    console.log(event, path);

    sendMessage({
      event,
      path: sharePath + "/" + path,
    });

  });


}


function sendMessage(payload) {

  const msg = new Buffer(JSON.stringify(payload));

  netClient.send(msg, 0, msg.length, port, host, function(err, bytes) {
    if (err)
      console.log("Failed to send UDP message:", err);
    else
      console.log('UDP message sent to ' + host +':'+ port);
  });

}


function showUsageAndExit() {

  console.log("Usage:");
  console.log("  " , process.argv[1], "[--host <host>] [--port <port>]" +
    " local-dir:remote-dir ...");

  process.exit(1);

}


function parseCommandLine() {

  let args = process.argv.slice(2);

  const pop = () => {

    if (args.length) {
      return args.shift();
    } else {
      showUsageAndExit();
    }

  };

  while (args.length && args[0].substr(0, 2) === "--") {

    switch (pop()) {

      case "--host":
        host = pop();
        break;

      case "--port":
        port = parseInt(pop(), 10);
        if (!port || port < 1 || port > 65535)
          showUsageAndExit();
        break;

      default:
        showUsageAndExit();

    }

  }


  if (!args.length)
    showUsageAndExit();


  while (args.length) {

    let parts = args.shift().split(":");

    if (parts.length !== 2)
      showUsageAndExit();

    monitor(parts[0], parts[1]);

  }

}

parseCommandLine();

console.log("Ready.");
