// Copyright 2004-present Facebook. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.


var benchmark_results = new Array();
var benchmark_file_name = 'benchmark_results.json';
var results_to_keep = 10000;
var results_to_return = 20;

function benchmarkResult(time, result, browser, testData) {
  this.time = time;
  this.result = result;
  this.browser = browser;
  this.testData = testData;
}

function resultSorterByTopScore(a, b) {
  return b.result - a.result;
}

function resultSorterByNewest(a, b) {
  return b.time - a.time;
}

function processResult(result, browser, testData) {
  var time = new Date();
  var br = new benchmarkResult(time.valueOf(), result, browser, testData);
  benchmark_results.push(br);
  benchmark_results.sort(resultSorterByNewest);
  if (benchmark_results.length > results_to_keep) {
    benchmark_results.splice(results_to_keep, benchmark_results.length);
  }
}

function saveResults() {
  fs.writeFileSync(benchmark_file_name, JSON.stringify(benchmark_results));
  console.log('BenchmarkResult - saved '+benchmark_results.length+' results');
}

function loadResults() {
  var data;
  try {
    data = fs.readFileSync(benchmark_file_name);
  } catch(err) {
    return;
  }
  if (data.length > 0) {
    benchmark_results = JSON.parse(data);
  }
  console.log('BenchmarkResult - loaded '+benchmark_results.length+' results');
}

function init() {
  if (benchmark_results.length == 0)
    loadResults();
}

function getTopResults()
{
  var ret = benchmark_results;
  ret.sort(resultSorterByTopScore);
  //ret.splice(results_to_return, ret.length);

  // Convert results into something the client can use - strip out extra
  // headers bits, etc.
  var results = new Array();
  var total_results = Math.min(results_to_return, ret.length);
  for (var i=0; i<total_results; i++) {
    results[i] = {};
    if ("user-agent" in ret[i].browser) {
      results[i].browser = ret[i].browser["user-agent"];
    } else {
      results[i].browser = ret[i].browser;
    }
    results[i].time = ret[i].time;
    results[i].score = ret[i].result;
  }
  return results;
}

function testResults() {
  return;
  if (benchmark_results.length>5)
    return;
  processResult(Math.floor(Math.random()*50), "Chrome", "relja");
  processResult(Math.floor(Math.random()*50), "Chrome", "relja");
  processResult(Math.floor(Math.random()*50), "Chrome <script>foo!<script>i &bla=noway", "relja");
  processResult(Math.floor(Math.random()*50), "Chrome &bla=bla", "relja");
  processResult(Math.floor(Math.random()*50), "IE10", "relja");
}

exports.init = init;
exports.test = testResults;
exports.save = saveResults;
exports.getTopResults = getTopResults;
exports.processResult = processResult;
