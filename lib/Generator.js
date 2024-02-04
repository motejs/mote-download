/*
 * @Author: Jovy
 * @Date: 2024-01-03 15:37:56
 * @LastEditTime: 2024-02-04 16:09:20
 * @LastEditors: Jovy
 * @Description: 项目生成器
 * @FilePath: \mote-download\lib\Generator.js
 * ==雁过留声，码过留名。==
 */

const inquirer = require("inquirer");
const ora = require("ora");
const chalk = require("chalk");
const GithubRequest = require("./GithubRequest");
const downloadGitRepo = require("./download");

// 1. 写一个Generator类，接收参数name和targetDir
// 2. 在Generator类中写一个async getRepo()方法，用于获取用户选择的模板
// 3. 在Generator类中写一个async getTag()方法，用于获取用户选择的版本
// 4. 在Generator类中写一个async download()方法，用于下载模板
// 5. 在Generator类中写一个async create()方法，用于创建项目

class Generator {
  constructor(opts) {
    // 目录名称
    this.name = opts.name;
    // 创建位置
    this.targetDir = opts.targetDir;
    this.opts = opts;

    this.service = new GithubRequest(opts);

    // 远程下载
    this.downloadGitRepo = downloadGitRepo;
  }

  // 获取模板名称
  async getRepo() {
    const spinner = ora("fetching template ....").start();
    const repos = await this.service.getRepoList();
    spinner.succeed();
    if (!repos?.length) {
      console.log(`\r\n${chalk.cyan("该账户下没有仓库（Response）")}\r\n`);
      return;
    }

    // 过滤我们需要的模板名称
    const repoNames = [];
    if (this.opts.keywords) {
      repos.forEach((item) => {
        if (item.name.indexOf(this.opts.keywords) !== -1) {
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
    // console.log("answers", answers);
    return answers.repo;
  }

  // 获取版本信息
  async getTag(repo) {
    if (!repo) {
      return;
    }
    const spinner = ora("fetching tag ....").start();
    const tags = await this.service.getTagList(repo);
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
  download(repo, tag) {
    let _opts = { ...this.opts, checkout: tag, repo };

    let spinner = ora("downloading ....").start();
    this.downloadGitRepo(this.targetDir, _opts, (err) => {
      if (err) {
        // http下载失败, 自动重试git clone方式下载
        _opts = {
          clone: true,
          checkout: tag,
        };

        this.downloadGitRepo(this.targetDir, _opts, (err) => {
          if (err) {
            console.log(
              `\r\n${chalk.red(
                `下载失败，请检查网络是否可以访问或者稍后重试`
              )}\r\n`
            );
            spinner.succeed();
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

  async create() {
    // 1. 获取模板名称
    const repo = await this.getRepo();
    if (!repo) return;
    // 2. 获取版本信息
    const tag = await this.getTag(repo);
    // 3. 下载模板到模板目录
    this.download(repo, tag);
  }
}

module.exports = Generator;
