const chokidar = require("chokidar");
const dgram = require('dgram');
const relative = require("path").relative;


let port = 49494;
let host = "127.0.0.1";


const netClient = dgram.createSocket('udp4');


function monitor(localPath, sharePath, ignored) {

  console.log("monitor", {localPath, sharePath});

  const handle = chokidar.watch(localPath, {
    ignoreInitial: true,
    ignored,
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

  const msg = Buffer.from(JSON.stringify(payload));

  netClient.send(msg, 0, msg.length, port, host, function(err, bytes) {
    if (err)
      console.log("Failed to send UDP message:", err);
    else
      console.log('UDP message sent to ' + host +':'+ port);
  });

}


function showUsageAndExit() {

  console.log("Usage:");
  console.log("  " , process.argv[1], "[option]... local-dir:remote-dir ...");
  console.log("");
  console.log("Options:");
  console.log("  --host <host>     Send UDP messages to <host> (default: 127.0.0.1)");
  console.log("  --port <port>     Send UDP messages to thi sport (default: 49494)");
  console.log("  --ignore-std      Activate typical ignores (dotted files and node_modules)");
  console.log("  --ignore <str>    Ignore files named <str>");
  console.log("  --ignore-re <exp> Ignore regular expression <exp>");

  process.exit(1);

}


function parseCommandLine() {

  let args = process.argv.slice(2);
  let ignored = [];

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

      case "--ignore-std":
        // ignore files beginning with a dot, except file/dir names that
        // begin with two dots (to allow "../foo")
        ignored.push(/(^|[\/\\])\.[^.]/);

        // ignore node_modules dir
        ignored.push(/(^|[\/\\])node_modules/);
        break;

      case "--ignore":
        ignored.push(pop());
        break;

      case "--ignore-re":
        ignored.push(new RegExp(pop()));
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

    monitor(parts[0], parts[1], ignored);

  }

}

parseCommandLine();

console.log("Ready.");
