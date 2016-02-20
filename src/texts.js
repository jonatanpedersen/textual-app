function getRepositoryNameFromRepositoryUrl (repositoryUrl) {
	return /https:\/\/github\.com\/(.*\.*).git/.exec(repositoryUrl)[1];
}

export function makeGetTextsFromGithub () {
  return async function getTextsFromGithub (github, repositoryUrl) {
		return new Promise((resolve, reject) => {
			let repositoryName = getRepositoryNameFromRepositoryUrl(repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';

			repo.read(branchName, filePath, (err, data) => {
				if (err) {
					return reject(err);
				}

				resolve(data);
			});
  	});
	};
}

export function makeWriteTextsToGithub () {
  return async function getTextsFromGithub (github, repositoryUrl) {
		return new Promise((resolve, reject) => {
			let repositoryName = getRepositoryNameFromRepositoryUrl(repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';

			repo.read(branchName, filePath, (err, data) => {
				if (err) {
					return reject(err);
				}

				var newData = JSON.stringify(data, null, 4);

				var message = "new article";
				var options = {
				  author: {name: 'Jonatan Pedersen', email: 'jp@jonatanpedersen.com'},
				  committer: {name: 'Jonatan Pedersen', email: 'jp@jonatanpedersen.com'},
				  encode: true
				}

				return repo.write(branchName, filePath, newData, message, options, err => {
					if (err) {
						return reject(err);
					}

					var options = {
					  title: message,
					  base: 'master',
					  head: branchName
					};

					return repo.createPullRequest(options, (err, pullRequest) => {
						if (err) {
							return callback(err);
						}

						return callback();
					});

				resolve(data);
			});
  	});
	};
}


//
//
// 'use strict';
//
// export function submitArticle(article, callback) {
// 	let repo = github.getRepo('jonatanpedersen', 'stopovervaagningnu');
//
// 	let timestamp = (new Date).getTime().toString();
// 	var branchName = `submission-${timestamp}`;
// 	var filePath = 'public/data/articles/_data.json';
//
// 	return repo.branch(branchName, err => {
// 		if (err) {
// 			return callback(err);
// 		}
//
// 	  return repo.read(branchName, filePath, (err, data) => {
// 			if (err) {
// 				return callback(err);
// 			}
//
// 			data.push(article);
//
// 			var newData = JSON.stringify(data, null, 4);
//
// 			var message = "new article";
// 			var options = {
// 			  author: {name: 'Jonatan Pedersen', email: 'jp@jonatanpedersen.com'},
// 			  committer: {name: 'Jonatan Pedersen', email: 'jp@jonatanpedersen.com'},
// 			  encode: true
// 			}
//
// 			return repo.write(branchName, filePath, newData, message, options, err => {
// 				if (err) {
// 					return callback(err);
// 				}
//
// 				var options = {
// 				  title: message,
// 				  base: 'master',
// 				  head: branchName
// 				};
//
// 				return repo.createPullRequest(options, (err, pullRequest) => {
// 					if (err) {
// 						return callback(err);
// 					}
//
// 					return callback();
// 				});
// 			});
// 	  });
//   });
// }
