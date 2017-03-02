var task = module.exports,
    path = require('path'),
    Q = null,
    shelljs = null,
    fs = null,
    utils = null,
    data = null,
    projectDir = null;

task.run = function run(cli, targetPath, projectData) {
  projectDir = targetPath;
  Q = cli.require('q');
  shelljs = cli.require('shelljs');
  fs = cli.require('fs');
  utils = cli.utils;
  data = {
    project: require(path.join(targetPath, 'cloudbridge.json'))
  };

  return Q()
    .then(copyDependencies);
};

function copyDependencies() {
  var src = path.join(__dirname, 'build', '*'),
      target = path.join(projectDir, 'build'),
      assets = path.join(target, 'ios', 'assets'),
      libPath = path.join(target, 'ios', 'libs'),
      extensions = /\.(ini)/,
      util_ = null,
      exec = null,
      shellsh = null;

  shelljs.mkdir('-p', target);
  shelljs.cp('-Rf', src, target);

  utils.copyTemplate(assets, assets, data, extensions);

  var files = shelljs.ls(path.join(libPath, '*.zip' ));
  
  util_ = cli.require('util');
  exec = cli.require('child_process').exec;
  var shPath = path.join(libPath, 'createlib.sh');
  shellsh = exec(shPath, function(error,stdout,stderr) {
    if (error) console.log(error);
  });
}
