# jsgamebench

JSGameBench exists to explore HTML5’s game performance limits. For version 0.1, the focus is sprite performance a player is likely to see. Scoring is how many sprites are drawn, so large scores are better. Going forward, we want to collect peak and average scores for browsers across a range of hardware configurations. We hope JSGameBench helps the community improve game performance and we look forward to HTML5 game engine developers improving on our ideas and crushing these number!

For each render path, JSGameBench draws as many moving, animating sprites as possible at 30fps against a background with both axis-aligned and rotated sprites. We try both because significant performance differences between the two indicate flaws or oversights in current rendering techniques. More importantly, while animation can be used instead of sprite rotations, it is often an unacceptable trade off that game developers should not be forced to make.

The final score is the geometric mean of the axis aligned and rotated scores. Geometric mean is used to prevent a high axis aligned score from hiding the poor rotated performance.

# License

JSGameBench is licensed under the Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0) except as noted otherwise.

# How to run it

## install nodejs
Get the stable build of nodejs from http://nodejs.org/#download
    ./configure --prefix=~/local
    make;make install
    add ~/local/bin to your PATH

## npm
Install npm node package manager https://github.com/isaacs/npm
    curl http://npmjs.org/install.sh | sh
    install node socket.io package
    npm install socket.io

## run it (runs on port 8081 by default)

    node bin/jsgamebench


## Debugging
Install node-inspector for server debugging: (https://github.com/dannycoates/node-inspector)

  npm install node-inspector