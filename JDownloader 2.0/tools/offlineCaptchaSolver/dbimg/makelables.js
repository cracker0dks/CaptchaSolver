var Jimp = require('jimp'); //For image processing
var fs = require('fs');

fs.readdir("./out", (err, files) => {
    var fileList = [];
    var cnt = 0;
    files.forEach(file => {
        (function () {
            var ccc = file.split(".")[0];
            fileList.push(ccc);
            var acnt = cnt++;
            Jimp.read('./out/' + file).then(image => {
                image.getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    var minX = 100;
                    var maxX = 0;
                    var minY = 100;
                    var maxY = 0;
                    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {

                        var color = image.getPixelColor(x, y);
                        var rgbColor = Jimp.intToRGBA(color);

                        if (isntWhite(rgbColor)) {
                            minX = x < minX ? x - 3 : minX;
                            maxX = x > maxX ? x + 3 : maxX;

                            minY = y < minY ? y - 3 : minY;
                            maxY = y > maxY ? y + 3 : maxY;
                        }

                        if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) { //Scan1 finished
                            var midX = (minX+maxX)/2;
                            var midXRel = getRounding(midX/130);

                            var midY = (minY+maxY)/2;
                            var midYRel = getRounding(midY/130);

                            var width = getRounding((maxX - minX)/130);
                            var height = getRounding((maxY - minY)/130);

                            var c = acnt + ' ' + midXRel + ' ' + midYRel + ' ' + width + ' ' + height;
                            fs.writeFile("./labels/" + ccc + '.txt', c, function (err) {
                                if (err) {
                                    return console.log(err);
                                }

                            });

                            image.write("./obj/" + ccc + '.jpg', function () {
                                if (err) {
                                    return console.log(err);
                                }
                            });
                        }
                    });
                });
            });
        })()
        
    });
    fs.writeFile("./obj.names", fileList.join("\n"), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    var train = "";
    for(var i in fileList) {
        if(train != "") {
            train+="\n";
        }
        train+="data/obj/"+fileList[i]+".jpg";
    }
    fs.writeFile("./train.txt", train, function (err) {
        if (err) {
            return console.log(err);
        }
    });
});

function getRounding(nr) {
    return Math.round(nr*1000000)/1000000;
}
function isntWhite(rgbColor) {
    return rgbColor["r"] < 253 && rgbColor["g"] < 253 && rgbColor["b"] < 253
}