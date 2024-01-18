/*
 * @Author: Jovy
 * @Date: 2024-01-03 16:38:58
 * @LastEditTime: 2024-01-18 17:01:37
 * @LastEditors: Jovy
 * @Description: 获取远程模板和版本信息
 * @FilePath: \mote-download\lib\http.js
 * ==雁过留声，码过留名。==
 */
const { Octokit } = require("@octokit/core");
const fetch = require("node-fetch");

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// const octokit = new Octokit({
//   auth: "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", // 你的token
//   request: {
//     fetch,
//   },
// });

async function getRepoList({ owner, token }) {
  let octokit = new Octokit({
    auth: token,
    request: {
      fetch,
    },
  });
  const response = await octokit.request("GET /orgs/{owner}/repos", {
    owner,
  });

  // console.log(response.data);
  return response.data;
}

async function getTagList({ owner, token, repo }) {
  let octokit = new Octokit({
    auth: token,
    request: {
      fetch,
    },
  });
  const response = await octokit.request("GET /repos/{owner}/{repo}/tags", {
    owner,
    repo,
  });
  return response.data;
}

module.exports = {
  getRepoList,
  getTagList,
};
