/*
 * @Author: Jovy
 * @Date: 2024-01-25 20:06:05
 * @LastEditTime: 2024-02-04 18:15:52
 * @LastEditors: Jovy
 * @Description: Github请求类
 * @FilePath: \mote-download\lib\GithubRequest.js
 * ==雁过留声，码过留名。==
 */

const { Octokit } = require("@octokit/core");
const fetch = require("node-fetch");

class GithubRequest {
  constructor({ owner, token  }) {
    this.octokit = new Octokit({
      auth: token,
      request: {
        fetch,
      },
    });
    this.owner = owner;
  }

  async getRepoList() {
    const response = await this.octokit.request("GET /orgs/{owner}/repos", {
      owner: this.owner,
    });
    return response.data;
  }

  async getTagList(repo) {
    const response = await this.octokit.request(
      "GET /repos/{owner}/{repo}/tags",
      {
        owner: this.owner,
        repo,
      }
    );
    return response.data;
  }
}

module.exports = GithubRequest;
