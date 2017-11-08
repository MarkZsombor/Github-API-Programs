require('dotenv').config()
var request = require('request');
var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);

console.log('Welcome to the GitHub Avatar Downloader!');

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization' : "token " + process.env.GITHUB_API_TOKEN
    }
  };


  request(options, function(err, res, body) {
    var results = JSON.parse(body);
    cb(err, results);
  });
}

getRepoContributors(args[0], args[1], function(err, result) {
  if (args.length !== 2) {
    console.log("Invalid number of required inputs, please submit the repo-owner and repo-name only and in that order.");
    return;
  }
  for (var i = 0; i < result.length; i++) {
    downloadImageByURL(result[i].avatar_url, `avatars/${result[i].login}.jpg`);
    // Avatars are saved on the server as either .jpg OR .png, can't figure out how to determine which type they are to save them as the proper extension so I decided its better to hard code in .jpg as the assignment requires a file extension in the filename.
    // Mac OS doesn't care, it will display images that have the incorrect file extension, Ubuntu however will throw up an error if you try to load a .png that has been saved as a .jpg
    // Don't know if this was meant to be in the scope of the assignment or if I was completely overthinking the requirements
  }
});

function downloadImageByURL(url, filePath) {
  ensureDirectoryExistence(filePath);
  request.get(url)
         .on('error', function (err) {
            throw err;
          })
         .pipe(fs.createWriteStream(filePath));
}