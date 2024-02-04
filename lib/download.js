/*
 * @Author: Jovy
 * @Date: 2024-01-24 10:33:20
 * @LastEditTime: 2024-02-04 16:40:09
 * @LastEditors: Jovy
 * @Description: 下载库
 * @FilePath: \mote-download\utils\download.js
 * ==雁过留声，码过留名。==
 */
const downloadUrl = require("download");
const gitclone = require("git-clone");
const rm = require("rimraf").sync;

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */

function download(
  dest,
  opts = {
    clone: false,
    checkout: "master",
    owner: "",
    repo: "",
  },
  fn
) {
  let url = `https://github.com/${opts?.owner}/${opts?.repo}`;
  if (opts.clone) {
    url += ".git";
  } else {
    url += "/archive/refs/tags/" + opts.checkout + ".zip";
  }

  if (opts.clone) {
    // 执行git clone下载库
    const cloneOptions = {
      checkout: opts.checkout,
      shallow: true, // 只下载最新的一次提交，对应命令：git clone --depth=1
    };
    gitclone(url, dest, cloneOptions, function (err) {
      if (err === undefined) {
        rm(dest + "/.git");
        fn();
      } else {
        fn(err);
      }
    });
  } else {
    // 执行下载zip包
    const downloadOptions = {
      extract: true, // 解压文件
      strip: 1, // 去除解压后的最外层文件夹
    };
    downloadUrl(url, dest, downloadOptions)
      .then(function (data) {
        fn();
      })
      .catch(function (err) {
        fn(err);
      });
  }
}

module.exports = download;
