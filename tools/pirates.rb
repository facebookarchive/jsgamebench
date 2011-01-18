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

["Board", "Ninja", "Box", "Cannon"].each do |base|
  files = Dir.glob("#{base}_*.png");

  states = {}

  files.each do |file|
    name = file.split('.')[0];
    name =~ /_([\w\d_]+)_128/
    states[$1] = 1
  end

  states.each do |key,val|
    res="montage -background 'transparent' -depth 8 -type TrueColorMatte '#{base}_#{key}_128_00**.png' -geometry 128x128 -tile 8x3 -matte -transparent 'transparent' -type TrueColorMatte -depth 8 ../code/jsgamebench/images/#{base.downcase}_#{key.downcase}.png"
    puts res
    system res
  end
end

