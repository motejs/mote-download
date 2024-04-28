#! /usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const create = require("./lib/create");

program
  .name("mote-download")
  .description("A simple cli for download template from github")
  .usage("[options] [project-name]")
  .version(`v${require("./package.json").version}`)

  .option("--name <name>", "工程目录名称")
  .option("-o, --owner <owner>", "模板库所属账号（Owner），会缓存到本地，再次输入会覆盖缓存的Owner")
  .option("-t, --token <token>", "账号Token，如果是私有库需要提供，会缓存到本地，再次输入会覆盖缓存的Token")
  .option("-k, --keywords <keywords>", "过滤模板库的名称关键字")
  .option("-r, --repo <repo>", "指定模板库名称")
  .option("-r, --tag <tag>", "指定模板库Tag版本")

  .option("-f, --force", "如果目录存在，强制覆盖")
  .option("-c, --clone", "指定用'git clone'方式下载库");

  // .command("create [project-name]")
  // .description("create a new project from a template")

  // .action((name, options) => {
  //   require("./lib/create.js")(name, options);
  // });

program.parse(process.argv);

const options = program.opts();
// console.log("options", options);

create(options)
