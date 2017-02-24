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
      spawn = null,
      shellunzip = null,
      shelllibtool = null,
      shellrm = null;

  shelljs.mkdir('-p', target);
  shelljs.cp('-Rf', src, target);

  utils.copyTemplate(assets, assets, data, extensions);

  var files = shelljs.ls(path.join(libPath, '*.zip' ));
  
  util_ = cli.require('util');
  spawn = cli.require('child_process').spawn;

  for (var i = 0; i < files.length; i++) 
  {
    shellunzip = spawn('unzip', [ files[i], '-d', libPath ]);
    shellrm = spawn('rm', [ files[i] ]);
    // shellunzip.stdout.on('data', function (data) {
    //   console.log('stdout: ' + data);
    // });
    // shellunzip.stderr.on('data', function (data) {
    //   console.log('stderr: ' + data);
    // });
    // shellunzip.on('exit', function (code) {
    //   console.log('unzip exited with code ' + code);
    // });
  }
  files = shelljs.ls(path.join(libPath, '*.a' ));
  shelllibtool = spawn('libtool', ['-static', files[0], files[1], '-o', path.join(libPath,'libcloudbridge.a')]);
  shelllibtool.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  shelllibtool.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  shelllibtool.on('exit', function (code) {
    console.log('exit: ' + code);
  });
//  shellrm = spawn('rm' , files );

}
