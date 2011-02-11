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

[64,128,256].each do |size|
#[256].each do |size|
  smaller = size/2
  smaller = smaller.to_i
  files = Dir.glob("*#{size}*png");
#  files = Dir.glob("*png");

  files.each do |file|
    name = file.split('.')[0];
    name =~ /([\w\d_]+)#{size}([_\d]+)/
#    name =~ /([a-zA-Z\_]+)([_\d]+)/
    res = "convert #{name}.png -resize #{smaller}x#{smaller}\! #{$1}#{smaller}#{$2}.png"
#    res = "convert #{name}.png -resize #{smaller}x#{smaller}\! #{$1}#{smaller}_#{$2}.png"
    puts res
    system res
  end
end

