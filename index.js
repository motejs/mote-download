#! /usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");
const figlet = require("figlet");

program
  .name("mote-download")
  .description(
    "A simple cli for download template from github/gitlab/bitbucket"
  )
  .usage("<command> [option]")
  .version(`v${require("./package.json").version}`);

program
  .command("create [project-name]")
  .description("create a new project")
  .option("-f, --force", "overwrite target directory if it exist")
  .option("-c, --clone", "通过git clone下载模板")
  .option("-o, --owner <github owner>", "git owner name")
  .option("-t, --token [Personal access token]", "如果需要访问私人（private）仓库，请提供访问token，否则只能访问到公开（public）仓库")
  // 模板库名称前缀
  .option("-p, --prefix [template prefix]", "Template library name prefix, default is 'template-'")
  .action((name, options) => {
    require("./lib/create.js")(name, options);
  });

program.on("--help", () => {
  // 使用 figlet 绘制 Logo
  // console.log(
  //   "\r\n" +
  //     figlet.textSync("mote-DL", {
  //       font: "Ghost",
  //       horizontalLayout: "default",
  //       verticalLayout: "default",
  //       width: 80,
  //       whitespaceBreak: true,
  //     })
  // );
  // 新增说明信息
  console.log(
    `\r\nRun ${chalk.cyan(`mote-download <command> --help`)} show details\r\n`
  );
});

program.parse();
