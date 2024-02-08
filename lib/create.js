/*
 * @Author: Jovy
 * @Date: 2024-01-02 13:53:28
 * @LastEditTime: 2024-02-08 13:42:20
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
  const configPath = path.join(__dirname, "../mote.config.json");

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
  /**
   * 1. 首先检测是否存在上次的配置文件
   * 2. 如果存在则询问是否使用上次的配置
   * 3. 如果不使用则提示输入owner
   * 4. 询问是否需要私有库
   * 5. 如果需要则询问是否需要重新输入token
   * 6. 如果不需要则直接读取上次的token
   * 7. 询问是否需要过滤模板库
   * 8. 如果需要则询问关键词
   * 9. 最后将所有的配置写入到mote.config.json文件中，下次直接读取使用
   * 10. 创建项目
   */
  // 检测是否存在上次的配置文件
  if (fs.existsSync(configPath) && !options.lastConfig) {
    const lastConfigAnswers = await inquirer.prompt([
      {
        type: "confirm",
        name: "lastConfig",
        message: "是否使用上次配置？",
        default: true,
      },
    ]);
    if (lastConfigAnswers.lastConfig) {
      // 使用上次配置
      const configOptions = fs.readJsonSync(configPath);
      options = {
        ...options,
        ...configOptions,
      };
      // 创建项目
      const generator = new Generator({ projectName, targetDir, ...options });
      generator.create();
      return;
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
  const configOptions = fs.readJsonSync(configPath) || {};

  if (answers.owner) {
    // 写入owner，下次直接读取使用
    fs.writeJsonSync(configPath, { owner: answers.owner, ...configOptions });
  }
  if (answers.token) {
    // 写入token，下次直接读取使用
    fs.writeJsonSync(configPath, { token: answers.token, ...configOptions });
  }
  if (answers.keywords) {
    // 写入keywords，下次直接读取使用
    fs.writeJsonSync(configPath, { keywords: answers.keywords, ...configOptions });
    
  }
  if (answers.tokenType === "last") {
    // 读取token
    options.token = fs.readJsonSync(configPath).token;
  }
  // console.log("options", options);
  options = {
    ...options,
    ...answers,
  };
  // 创建项目
  const generator = new Generator({ projectName, targetDir, ...options });
  generator.create();
};
