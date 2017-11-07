var request = require('request');
var secrets = require('./secrets.js');
var fs = require('fs');


console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization' : "token " + secrets.GITHUB_TOKEN
    }
  };


  request(options, function(err, res, body) {
    var resultsJSON = JSON.parse(body);
    cb(err, resultsJSON);
  });
}

getRepoContributors("jquery", "jquery", function(err, result) {
  // console.log("Errors:", err);
  for (var i = 0; i < result.length; i++) {
    downloadImageByURL(result[i].avatar_url, `avatars/${result[i].login}.jpg`);
  }
});

function downloadImageByURL(url, filePath) {
  request.get(url)
         .on('error', function (err) {
            throw err;
          })
         // .on('response', function (response) {
         //    console.log(response.statusCode, response.statusMessage, response.headers['content-type']);
         //  })
         .pipe(fs.createWriteStream(filePath));
}