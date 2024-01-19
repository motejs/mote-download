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
  .option("-c, --clone", "git clone to download template")
  .option("-p, --private", "download public and private repository")
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
