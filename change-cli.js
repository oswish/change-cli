/* global require process*/

const sh = require("shelljs");
const fs = require("fs");

const logs = sh.exec("git log -50").stdout.split("\n");
const output = [];
const file = sh
  .exec("ls")
  .stdout.split("\n")
  .filter((itm) =>
    itm.match(/.*[C,c][H,h][A,a][N,n][G,g][E,e].*[L,l][O,o][G,g].*\.y.*ml/)
  )
  .pop();
const normalize = (line) =>
  line.replace(/\[c\]/, "").replace(/\[C\]/, "").trim().replace(/ {2}/g, " ");

logs.forEach((log) => {
  const changeMatch = log.match(/\[c\]/) || log.match(/\[C\]/);

  if (changeMatch) {
    const normalizedLog = normalize(log);

    if (output.indexOf(normalizedLog) === -1) {
      output.push(normalize(log));
    }
  }
});

const changeLog = sh.exec(`cat ${file}`).stdout;
const changeLogLines = changeLog.split("\n");

if (changeLogLines[0].indexOf("master:") !== -1) {
  changeLogLines.shift();
}

output.forEach((o) => {
  if (changeLog.indexOf(o) === -1) {
    changeLogLines.unshift(`  - '${o}'`);
  }
});

changeLogLines.unshift("master:");

const update = changeLogLines.join("\n");
const changed = update !== changeLog;

if (changed) {
  fs.writeFile(file, update, (err) => {
    /* eslint-disable no-console */
    if (err) {
      console.error(err);

      process.exit(1);
      throw err;
    }

    console.info("\nsuccess update change log");
    /* eslint-enable */
  });
}
