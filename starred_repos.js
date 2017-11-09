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

function objectToArray(obj) {
  // This will take an object {a:b} and return an array of arrays [[a,b]]
  return Object.keys(obj)
     .map(function (key) {
        return [key, obj[key]];
      });

}


getRepoContributors(args[0], args[1], function(err, result) {
  let counter = 0;
  for (let i = 0; i < result.length; i++) {
    userNames.push(result[i].login);
  }
  for (let i = 0; i < userNames.length; i++) {
    getStarredRepos(userNames[i], function(err2, result2) {
      counter++;
      for (let entry in result2) {
        let repoName = result2[entry].full_name;
        allRepos.push(repoName);
      }
      if (counter === userNames.length) {
        sortAndPrintContributors(allRepos);
      }
      // console.log(counter, userNames.length);
    });
  }

});


function sortAndPrintContributors(contributors){
    let repoCounter = {};
    let arr = [];

    for (let j = 0; j < contributors.length; j++) {
        if(contributors[j] in repoCounter) {
          repoCounter[contributors[j]]++;
        } else {
          repoCounter[contributors[j]] = 1;
        }
    }

    arr = objectToArray(repoCounter);

    arr.sort(function(a, b){return b[1]-a[1]});


    for (let k = 0; k < 5; k++) {
      let stars = arr[k][1];
      console.log(`[${stars} stars] ${arr[k][0]}`);
    }
  }

