require('dotenv').config()
const request = require('request');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

console.log('Welcome to the GitHub Starred Repo Counter!');

// when the function is called it will check if the directory exists, if it doesnt it makes the directory
function ensureDirectoryExistence(filePath) {
  let dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function getRepoContributors(repoOwner, repoName, cb) {
  let options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization' : "token " + process.env.GITHUB_API_TOKEN
    }
  };


  request(options, function(err, res, body) {
    let results = JSON.parse(body);
    cb(err, results);
  });
}

const userNames = [];

function getStarredRepos(userName, cb) {
  let options = {
    url: `https://api.github.com/users/${userName}/starred`,
    headers: {
      'User-Agent': 'request',
      'Authorization' : "token " + process.env.GITHUB_API_TOKEN
    }
  };


  request(options, function(err, res, body) {
    let results = JSON.parse(body);
    cb(err, results);
  });
}

const allRepos = [];
const repoCounter = {};

function justLogInfo(something) {
   console.log(something);
}

getRepoContributors(args[0], args[1], function(err, result) {

  for (let i = 0; i < result.length; i++) {
    userNames.push(result[i].login);
  }
  // console.log(userNames);
  for (let i = 0; i < userNames.length; i++) {
    getStarredRepos(userNames[i], function(err, result) {
      for (let entry in result) {
        let repoName = result[entry].full_name;
        allRepos.push(repoName);
      }
    });
  }
  setTimeout(function(){ // using the setTimeout is a complete hack at dealing with the async data stream and is absolutely the wrong with to do this. I'm a bad programmer and deserve to be punished. It does however work.
    for (let j = 0; j < allRepos.length; j++) {
        if(allRepos[j] in repoCounter) {
          repoCounter[allRepos[j]]++;
        } else {
          repoCounter[allRepos[j]] = 1;
        }
    }


    var arr = Object.keys(repoCounter)
      .map(function (key) {
        return [key, repoCounter[key]];
      });

    arr.sort(function(a, b){return b[1]-a[1]});


    for (let k = 0; k < 5; k++) {
      let stars = arr[k][1];
      console.log(`[${stars} stars] ${arr[k][0]}`);
    }


  }, 3000);
});



