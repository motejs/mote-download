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
  .description("create a new project from a template")
  .option("-f, --force", "如果目录存在，强制覆盖")
  .option("-c, --clone", "用'git clone'下载库")
  .option("-p, --private", "下载公开和私有库")
  .option("-lc, --lastConfig", "使用上次配置")
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
