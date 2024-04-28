/*
 * @Author: Jovy
 * @Date: 2024-01-02 13:53:28
 * @LastEditTime: 2024-02-08 13:42:20
 * @LastEditors: Jovy
 * @Description: 简要描述该文件
 * @FilePath: \mote-download\lib\create.js
 * ==雁过留声，码过留名。==
 */
const os = require("node:os");
const path = require("node:path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const Generator = require("./Generator");

module.exports = async function (options) {
  let projectName = options.name;
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
  const configPath = path.join(
    os.homedir(),
    ".motejs",
    "mote-download.config.json"
  );

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
          default: true,
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

  // 根据新输入的owner和token，重新生成配置文件
  let configOptions = {};
  if (options.owner) {
    // 写入owner，下次直接读取使用
    configOptions.owner = options.owner;
  }
  if (options.token) {
    // 写入token，下次直接读取使用
    configOptions.token = options.token;
  }
  if (Object.keys(configOptions).length > 0) {
    fs.outputJsonSync(configPath, configOptions);
  }

  if (fs.existsSync(configPath) && (!options.owner || !options.token)) {
    // 配置文件存在，并且本次没有输入新的owner和token，则合并参数
    const configOptions = fs.readJsonSync(configPath);
    options = {
      ...options,
      ...configOptions,
    };
  }

  if (!options.owner) {
    // owner是必填项，如果没有输入则提示输入
    let prompts = [
      {
        type: "input",
        name: "owner",
        message: "请输入模板库所属账号（Owner）",
        default: "motejs",
      },
    ];
  
    const answers = await inquirer.prompt(prompts);
    options = {
      ...options,
      ...answers,
    };
  }
  console.log(options);
  // 创建项目
  const generator = new Generator({ projectName, targetDir, ...options });
  generator.create();
};
