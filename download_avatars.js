var request = require('request');
var secrets = require('./secrets.js');
var fs = require('fs');

var args = process.argv.slice(2);

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
    var results = JSON.parse(body);
    cb(err, results);
  });
}

getRepoContributors(args[0], args[1], function(err, result) {
  if (args.length < 2) {
    console.log("Invalid number of required inputs");
    return;
  }
  for (var i = 0; i < result.length; i++) {
    downloadImageByURL(result[i].avatar_url, `avatars/${result[i].login}.jpg`);
    // Avatars are saved on the server as either .jpg OR .png, can't figure out how to determine what they are to save them as the proper type so I decided its better to hard code in .jpg as the assignment requires a file extension in the filename.
    // Mac OS doesn't care, it will display images that have the incorrect file extension, Ubuntu however will throw up an error if you try to load a .png that has been saved as a .jpg
    // Don't know if this was meant to be in the scope of the assignment or if I was completely overthinking the requirements
  }
});

function downloadImageByURL(url, filePath) {
  request.get(url)
         .on('error', function (err) {
            throw err;
          })
         .pipe(fs.createWriteStream(filePath));
}