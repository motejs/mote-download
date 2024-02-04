/*
 * @Author: Jovy
 * @Date: 2024-01-02 13:53:28
 * @LastEditTime: 2024-02-02 18:05:37
 * @LastEditors: Jovy
 * @Description: 简要描述该文件
 * @FilePath: \mote-download\lib\create.js
 * ==雁过留声，码过留名。==
 */
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const Generator = require("./Generator");

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

  // console.log("tokenPath", tokenPath);
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

  let prompts = [
    {
      type: "input",
      name: "owner",
      message: "请输入模板库所属账号（Owner）",
      default: "motejs",
    },
    {
      type: "confirm",
      name: "needPrivate",
      message: `是否包含private库（访问需要提供token）？`,
      default: false,
      when: !options.private,
    },
    // 用上次输入的token（请确认没有过期）还是重新输入
    {
      type: "list",
      name: "tokenType",
      message: `请选择获取token方式`,
      choices: [
        {
          name: "上次输入的token（确认没有过期）",
          value: "last",
        },
        {
          name: "重新输入token",
          value: "new",
        },
      ],
      default: "last",
      when: (answers) => answers.needPrivate || options.private,
    },
    {
      type: "input",
      name: "token",
      message: `请输入token`,
      default: "",
      when: (answers) => answers.tokenType === "new",
    },
    {
      type: "confirm",
      name: "needFilter",
      message: `是否需要过滤模板库？`,
      default: false,
    },
    {
      type: "input",
      name: "keywords",
      message: `请输入模板库名称关键词`,
      default: "template-",
      when: (answers) => answers.needFilter,
    },
  ];

  const answers = await inquirer.prompt(prompts);
  // console.log('answers', answers);
  options = {
    ...options,
    ...answers,
  };

  if (answers.token) {
    // 写入token，下次直接读取使用
    fs.writeJsonSync(tokenPath, { githubToken: answers.token });
  }
  if (answers.tokenType === "last") {
    // 读取token
    options.token = fs.readJsonSync(tokenPath).githubToken;
  }
  // console.log("options", options);

  // 创建项目
  const generator = new Generator({ projectName, targetDir, ...options });
  generator.create();
};
