var fs = require('fs');

fs.readdir("./newTraining", (err, files) => {
    var fileList = [];
    var cnt = 0;
    files.forEach(file => {
        if (file.split(".")[1] == "jpg") {
            fileList.push(file.split(".")[0])
        }
    })

    var train = "";
    for (var i in fileList) {
        if (train != "") {
            train += "\n";
        }
        train += "data/obj/" + fileList[i] + ".jpg";
    }
    fs.writeFile("./train.txt", train, function (err) {
        if (err) {
            return console.log(err);
        }
    });

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var dataFile = "";
    for(var i=0;i<chars.length;i++) {
        dataFile = dataFile == "" ? chars[i] : dataFile+'\n'+chars[i]
    }
    fs.writeFile("./obj.names", dataFile, function (err) {
        if (err) {
            return console.log(err);
        }
    });
});