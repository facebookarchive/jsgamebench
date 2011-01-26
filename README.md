# jsgamebench

JSGameBench exists to explore HTML5’s game performance limits. For version 0.1, the focus is sprite performance a player is likely to see. Scoring is how many sprites are drawn, so large scores are better. Going forward, we want to collect peak and average scores for browsers across a range of hardware configurations. We hope JSGameBench helps the community improve game performance and we look forward to HTML5 game engine developers improving on our ideas and crushing these number!

For each render path, JSGameBench draws as many moving, animating sprites as possible at 30fps against a background with both axis-aligned and rotated sprites. We try both because significant performance differences between the two indicate flaws or oversights in current rendering techniques. More importantly, while animation can be used instead of sprite rotations, it is often an unacceptable trade off that game developers should not be forced to make.

The final score is the geometric mean of the axis aligned and rotated scores. Geometric mean is used to prevent a high axis aligned score from hiding the poor rotated performance.

# License

JSGameBench is licensed under the Apache 2.0 license

Copyright 2011 Facebook, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.

# How to use

# More info than you wanted