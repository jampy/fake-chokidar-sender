# fake-chokidar-sender

event sender for [fake-chokidar](https://github.com/jampy/fake-chokidar)

## How to use

First, follow the instructions for [fake-chokidar](https://github.com/jampy/fake-chokidar).

Then, download the [current release](https://github.com/jampy/fake-chokidar-sender/releases)
of the `fake-chokidar-sender` executable. You might also build your own from
source or just call `node` directly, but it's unnecessary.

Run the executable like so:

```
fake-chokidar-sender --port 12345 path\to\windows-dir,/my-source
```

- `--port 12345` specifies the same UDP port you configured for `fake-chokidar`
  when calling `inject()`

- `path\to\host-dir,/my-source` is a pair that you should read as
  `path\to\host-dir` , `/my-source`. It means that the process should watch
  for file changes in the directory `path\to\host-dir` (a Windows path in this
  case). Of course you can specify any directory here. Normally this should be
  the name of the directory of your shared folder, as seen **by the host**.
  Likewise, `/my-source` is the name of the **equivalent folder** in the guest.

This will forward all Chokidar events for the given directory (and all
directories below) via UDP to the guest. Events for file `path\to\host-dir\foo\bar.txt`
will be seen by the guest as `/my-source/foo/bar.txt`.


## Options

Please run `fake-chokidar-sender --help`.


## Create your own binary

Just download the source and run

```
npm install
npm run package-win64
```