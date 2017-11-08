require('dotenv').config()
const request = require('request');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

console.log('Welcome to the GitHub Avatar Downloader!');

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

function downloadImageByURL(url, filePath) {
  ensureDirectoryExistence(filePath);
  request.get(url)
         .on('error', function (err) {
            throw err;
          })
         .pipe(fs.createWriteStream(filePath));
}

getRepoContributors(args[0], args[1], function(err, result) {
  // checks to ensure the correct number of arguements are inputed from the command line
  if (args.length !== 2) {
    console.log("Invalid number of required inputs, please submit the repo-owner and repo-name only and in that order.");
    return;
  }
  // checks to see if the repo called exisits
  if (result.message === 'Not Found') {
    console.log('Incorrect repo information.');
    return;
  }

  // checks to see if the .env exists, if it does it checks to see if it contains an api token, finally throws an error if the api token doesnt work
  if (fs.existsSync('.env')) {
    if (process.env.GITHUB_API_TOKEN === undefined) {
      console.log('No GitHub token found in the .env');
      return;
    } else if (result.message === 'Bad credentials') {
      console.log('Incorrect GitHub API Token in the .env file.');
      return;
    }
  } else {
    console.log('No .env file found');
    return;
  }
  for (let i = 0; i < result.length; i++) {
    downloadImageByURL(result[i].avatar_url, `avatars/${result[i].login}.jpg`);
    // Avatars are saved on the server as either .jpg OR .png, can't figure out how to determine which type they are to save them as the proper extension so I decided its better to hard code in .jpg as the assignment requires a file extension in the filename.
    // Mac OS doesn't care, it will display images that have the incorrect file extension, Ubuntu however will throw up an error if you try to load a .png that has been saved as a .jpg
    // Don't know if this was meant to be in the scope of the assignment or if I was completely overthinking the requirements
  }
});



// STRETCH GOALS:
// the folder to store images to does not exist
// added function so that it makes the folder

// an incorrect number of arguments given to program (0, 1, 3, etc.)
// now return a message telling the user what the correct inputs should be

// the provided owner/repo does not exist
// Will message that the repo information is incorrect

// the .env file is missing
// will throw message if no .env in host directory

// the .env file is missing information
// Will throw an error message if .env doesn't have a github token

// the .env file contains incorrect credentials
// with throw an error message if the token isn't good