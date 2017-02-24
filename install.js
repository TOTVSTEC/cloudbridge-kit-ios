var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    Q = null,
    shelljs = null,
    utils = null,
    inquirer = null;

const OPTIONS_OVERWIRTE = 0,
      OPTIONS_RENAME = 1;

module.exports.run = function run(cli, targetPath, projectData) {
  var task = new InstallTask(cli, targetPath, projectData);

  return task.run();
};

class InstallTask {

  constructor(cli, targetPath, projectData) {
    this.cli = cli;
    this.projectDir = targetPath;
    this.projectData = projectData;

    Q = cli.require('q');
    shelljs = cli.require('shelljs');
    inquirer = cli.require('inquirer');
    utils = cli.utils;
  }

  run() {
    var self = this;

    return Q()
      .then(function() {
        return self.checkForExistingFiles();
      })
    .then(function(action) {
      var promise = null;

      if (action === OPTIONS_RENAME) {
        promise = self.renameSources();
      }
      else {
        promise = Q();
      }

    if (promise !== null) {
      return promise.then(function() {
        self.copySources();
      });
    }
    })
    .then(function() {
      var restoreTask = require('./restore');

      return restoreTask.run(self.cli, self.projectDir, self.projectData);
    });
  }

  copySources() {
    var kitSrc = path.join(__dirname, 'src'),
        projectSrc = path.join(this.projectDir, 'src'),
        tempFolder = path.join(os.tmpdir(), 'cloudbridge-' + new Date().getTime()),
        //packagePath = path.join.apply(path, this.projectData.id.split('.')),
        objcDir = path.join(tempFolder, 'src', 'ios', 'objc'),
        packagePath = objcDir,
        packageDir = path.join(objcDir, packagePath);

    shelljs.mkdir('-p', packageDir);
    shelljs.cp('-Rf', kitSrc, tempFolder);

    // var files = shelljs.ls(path.join(objcDir, '*.mm'));

    // for (var i = 0; i < files.length; i++) {
    //   var targetFile = path.join(packageDir, this.projectData.name + path.basename(files[i]));

    //   shelljs.mv('-f', files[i], targetFile);
    // }

    utils.copyTemplate(tempFolder, this.projectDir, {
      project: this.projectData
    }, /\.(xcodeproj|plist|mm)/);

    shelljs.rm('-rf', tempFolder);
  }

  checkForExistingFiles() {
    var deferred = Q.defer(),
        targetPath = path.join(this.projectDir, 'src', 'ios');

    if (fs.existsSync(targetPath)) {
      inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: ['The directory'.error.bold, targetPath, 'already exists.\n'.error.bold].join(' '),
        choices: [
      {
        name: 'Overwrite',
        value: OPTIONS_OVERWIRTE, //'overwrite',
        short: '\nOverwriting the existing files...'
      },
        {
          name: 'Rename',
        value: OPTIONS_RENAME,// 'rename',
        short: '\nRenaming the existing directory and copying the new files...'
        },
        new inquirer.Separator(' ')
        ],
        default: OPTIONS_RENAME //'rename'
      }]).then(function(answers) {
        deferred.resolve(answers.action);
      });
    }
    else {
      deferred.resolve({});
    }

    return deferred.promise;
  }

  renameSources() {
    var srcPath = path.join(this.projectDir, 'src', 'android'),
        targetPath = path.join(this.projectDir, 'src', 'android.old');

    if (fs.existsSync(targetPath)) {
      var count = 1;
      while (fs.existsSync(targetPath + '.' + count)) {
        count++;
      }

      targetPath += '.' + count;
    }

    shelljs.mv(srcPath, targetPath);

    return Q();
  }
}
