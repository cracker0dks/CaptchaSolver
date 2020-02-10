tracking = {};
require('../trackingjs_fast');
require('../trackingjs_brief');
require('../trackingjs_img');
var Jimp = require('jimp'); //For image processing
var fs = require('fs');

var features = {}
var cnt = 0;
fs.readdir("./imgs", (err, files) => {
    files.forEach(file => {
        (function () {
            cnt++;
            Jimp.read('./imgs/' + file).then(image => {
                image = image.resize(130, 130)
                image.write('./out/' + file); // save
                image.getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    var gs = new Array(image.bitmap.width * image.bitmap.height);
                    var gs_index = 0;

                    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {

                        var color = image.getPixelColor(x, y);
                        var rgbColor = Jimp.intToRGBA(color);

                        var gray = parseInt(rgbColor["r"] * 0.3 + rgbColor["g"] * 0.6 + rgbColor["b"] * 0.11);
                        gs[gs_index++] = gray;
                        if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) { //Scan1 finished
                            //var gs = tracking.Image.grayscale(data, image.bitmap.width, image.bitmap.height);

                            var corners1 = tracking.Fast.findCorners(gs, image.bitmap.width, image.bitmap.height);
                            var descriptors1 = tracking.Brief.getDescriptors(gs, image.bitmap.width, corners1);
                            //console.log(file, descriptors1);

                            var ind = file.split(".")[0].split(" (")[0];
                            var rArr = Array.from(descriptors1);
                            var cArr = Array.from(corners1);

                            features[ind] = {};
                            features[ind]["desc"] = rArr;
                            features[ind]["corn"] = cArr;
                            checkFinish();
                        }
                    });
                });
            });
        })()
    });
});

function checkFinish() {
    cnt--;
    if (cnt == 0) {
        fs.writeFile("modDesc.js", 'desc=' + JSON.stringify(features), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
}