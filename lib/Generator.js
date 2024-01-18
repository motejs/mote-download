/*
 * @Author: Jovy
 * @Date: 2024-01-03 15:37:56
 * @LastEditTime: 2024-01-18 18:08:56
 * @LastEditors: Jovy
 * @Description: 项目生成器
 * @FilePath: \mote-download\lib\Generator.js
 * ==雁过留声，码过留名。==
 */
const downloadGitRepo = require("download-git-repo");
const { getRepoList, getTagList } = require("./http");
const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");

// 1. 写一个Generator类，接收参数name和targetDir
// 2. 在Generator类中写一个async getRepo()方法，用于获取用户选择的模板
// 3. 在Generator类中写一个async getTag()方法，用于获取用户选择的版本
// 4. 在Generator类中写一个async download()方法，用于下载模板
// 5. 在Generator类中写一个async create()方法，用于创建项目

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;

    // 远程下载
    this.downloadGitRepo = downloadGitRepo;
  }

  // 获取模板名称
  async getRepo(options) {
    const spinner = ora("fetching template ....").start();
    const repos = await getRepoList(options);
    spinner.succeed();
    if (!repos) return;

    // 过滤我们需要的模板名称
    const repoNames = [];
    if (options.prefix) {
      repos.forEach((item) => {
        if (item.name.startsWith(options.prefix)) {
          repoNames.push(item.name);
        }
      });
    } else {
      repos.forEach((item) => {
        repoNames.push(item.name);
      });
    }

    // 询问用户选择哪个模板
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "repo",
        message: "Please select a template to create the project",
        choices: repoNames,
      },
    ]);

    return answers.repo;
  }

  // 获取版本信息
  async getTag(options, repo) {
    const spinner = ora("fetching tag ....").start();
    const tags = await getTagList({ ...options, repo });
    spinner.succeed();
    if (!tags) return;

    // 过滤我们需要的版本名称
    const tagNames = tags.map((item) => item.name);
    // console.log('tagNames', tagNames);
    if (!tagNames?.length) {
      // console.log('No tag found');
      return undefined;
    }
    // 询问用户选择哪个版本
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "tag",
        message: "Please select a version to create the project",
        choices: tagNames,
      },
    ]);

    return answers.tag;
  }

  // 从GitHub下载函数
  download(options, repo, tag) {
    let api = `${options?.owner}/${repo}`,
      opts = {};
    if (options.clone) {
      // 通过git clone下载模板
      opts = {
        clone: true,
        checkout: tag,
      };
    } else {
      api += tag ? `#${tag}` : "";
    }
    // console.log('api', api);
    let spinner = ora("downloading ....").start();
    this.downloadGitRepo(api, this.targetDir, opts, (err) => {
      if (err) {
        // http下载失败, 自动重试git clone方式下载
        opts = {
          clone: true,
          checkout: tag,
        };

        this.downloadGitRepo(api, this.targetDir, opts, (err) => {
          if (err) {
            console.log(
              `\r\n${chalk.red(
                `下载失败，请检查github是否可以访问或者稍后重试`
              )}\r\n`
            );
            return;
          } else {
            spinner.succeed();
          }
        });
      } else {
        spinner.succeed();
      }
    });
  }

  async create(options) {
    // console.log('options', options);
    // 1. 获取模板名称
    const repo = await this.getRepo(options);
    // 2. 获取版本信息
    const tag = await this.getTag(options, repo);
    // console.log(repo, tag);
    // 3. 下载模板到模板目录
    // await this.download('facebook/create-react-app', 'v5.0.1');
    this.download(options, repo, tag);
  }
}

module.exports = Generator;
