#! /usr/bin/env ruby

# Copyright 2004-present Facebook. All Rights Reserved.

# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

files = Dir.glob("Test_*.png");

states = {}

files.each do |file|
  name = file.split('.')[0];
  name =~ /Test_([\w\d_]+)_/
  type = $1
  states[type] = 0;
  name =~ /Test_([\w_]+)_(\d+)_(\d+)/
  states[type] = $2 if $2
end

states.each do |key,val|
  size = val != 0 ? val : 256
  res="montage -background 'transparent' -depth 8 -type TrueColorMatte 'Test_#{key}_000*.png' -geometry #{size}x#{size} -tile 8x8 -matte -transparent 'transparent' -type TrueColorMatte -depth 8 #{key.downcase}.png"
  puts res
  system res
end
