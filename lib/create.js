/*
 * @Author: Jovy
 * @Date: 2024-01-02 13:53:28
 * @LastEditTime: 2024-01-18 17:34:08
 * @LastEditors: Jovy
 * @Description: 简要描述该文件
 * @FilePath: \mote-download\lib\create.js
 * ==雁过留声，码过留名。==
 */
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const Generator = require("./Generator");

const defaultProjectName = "mote-project";

module.exports = async function (projectName, options) {
  if (!projectName) {
    const nameAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: `请输入项目名称`,
        default: "mote-project",
      },
    ]);
    projectName = nameAnswers.projectName;
  }

  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  const tokenPath = path.join(__dirname, "../token.json");
  const hasToken = fs.existsSync(tokenPath);

  console.log("tokenPath", tokenPath);
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      fs.removeSync(targetDir);
    } else {
      // 提示用户是否确定要覆盖
      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Target directory ${targetDir} already exists. Whould you like to overwrite it?`,
          default: false,
        },
      ]);

      if (answers.confirm) {
        fs.removeSync(targetDir);
      } else {
        return;
      }
    }
  }

  let questions = [];
  if (!options.owner) {
    questions.push({
      type: "input",
      name: "owner",
      message: `请输入git库的owner名称`,
      default: "motejs",
    });
  }

  if (!options.token && !hasToken) {
    questions.push({
      type: "confirm",
      name: "hasPrivate",
      message: `是否包含private库？`,
      default: false,
    });
    questions.push({
      type: "input",
      name: "token",
      message: `请输入token`,
      default: "",
      when: (answers) => answers.hasPrivate,
    });
  }


  if (!options.prefix) {
    questions.push({
      type: "confirm",
      name: "hasPrefix",
      message: `是否需要过滤模板库？`,
      default: false,
    });
    questions.push({
      type: "input",
      name: "prefix",
      message: `请输入模板库名称前缀`,
      default: "template-",
      when: (answers) => answers.hasPrefix,
    });
  }

  const answers = await inquirer.prompt(questions);
  // console.log('answers', answers);
  options = {
    ...options,
    ...answers,
  };

  if (options.token) {
    // 写入token，下次直接读取使用
    fs.writeJsonSync(tokenPath, { token: options.token });
  } else {
    // 读取token
    options.token = fs.readJsonSync(tokenPath).token;
  }
  console.log("options", options);

  // 创建项目
  const generator = new Generator(projectName, targetDir);
  generator.create(options);
};
