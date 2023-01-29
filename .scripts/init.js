
const shell = require("shelljs");

//检查控制台是否以运行`git `开头的命令
if (!shell.which("git")) {
  //在控制台输出内容
  shell.echo("Sorry, this script requires git");
  shell.exit(1);
}

shell.exec("git pull origin --tags");
shell.exec("node .scripts/version.js");
