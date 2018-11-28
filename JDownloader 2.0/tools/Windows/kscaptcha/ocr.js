var Tesseract = require('tesseract.js');
var Jimp = require('jimp');
var fs = require('fs');

var white = Jimp.rgbaToInt(255, 255, 255, 255);
var colorBuffer = {};
var bandColors = [];
var borderColors = {};
console.log("Running");
getText('input.gif', function(content) {
    console.log(content);
    fs.writeFile('result.txt', content["text"], (err) => {  
        if (err) throw err;
		
		fs.writeFile('log.txt', JSON.stringify(content), (err) => {  
			process.exit();
		});
    });
    
})

function getText(file, callback) {
    Jimp.read(file)
        .then(image => {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                var index = image.getPixelColor(x, y);
                if (!colorBuffer[index]) {
                    colorBuffer[index] = 1;
                } else {
                    colorBuffer[index]++;
                }

                //Take all border colors to remove them from the image (Removing lines)
                if (index != white && (y < 2 || image.bitmap.height - y < 10)) {
                    borderColors[index] = true;
                }

                if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) { //Scan1 finished
                    for (var k in borderColors) {
                        bandColors.push({ "color": k });
                    }
                    for (var i in colorBuffer) {
                        if (colorBuffer[i] < 100) { //Remove all colors witch are not very present in the img (<100 pixels in the image)
                            bandColors.push({ "color": i });
                        }
                    }

                    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                        var color = image.getPixelColor(x, y);
                        for (var k in bandColors) {
                            var clEntry = bandColors[k];

                            if (color == clEntry["color"]) {
                                image.setPixelColor(white, x, y);
                            }
                        }

                        if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                            fillGaps(image, function (image) {
                                fillGaps(image, function (image) {
                                    fillGaps(image, function (image) {
                                        resharp(image, function (image) {
                                            resharp(image, function (image) {
                                                image.write('temp.jpg', function () {
                                                    fs.readFile('temp.jpg', function (err, data) {
                                                        Tesseract.recognize(data).then(function (result) {
                                                            var text = result["text"].replace(/\W/g, '');
                                                            var confidence = result["confidence"];
                                                            callback({text : text, confidence : confidence});
                                                        })
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            })
                        }
                    });
                }
            });

        })
        .catch(err => {
            console.log(err);
            // Handle an exception.
        });

    function fillGaps(image, callback) {
        new Jimp(image.bitmap.width, image.bitmap.height, white, (err, newImage) => {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                var color = image.getPixelColor(x, y);
                if (color != white) {
                    newImage.setPixelColor(color, x - 1, y - 1);
                    newImage.setPixelColor(color, x, y - 1);
                    newImage.setPixelColor(color, x, y - 1);

                    newImage.setPixelColor(color, x - 1, y + 1);
                    newImage.setPixelColor(color, x, y + 1);
                    newImage.setPixelColor(color, x + 1, y + 1);

                    newImage.setPixelColor(color, x, y);
                    newImage.setPixelColor(color, x - 1, y);
                    newImage.setPixelColor(color, x + 1, y);
                }
                if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                    callback(newImage);
                }
            })
        });
    }
}

function resharp(image, callback) {
    new Jimp(image.bitmap.width, image.bitmap.height, white, (err, newImage) => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            var color = image.getPixelColor(x, y);
            if (color != white) {
                var l = image.getPixelColor(x - 1, y);
                var r = image.getPixelColor(x + 1, y);
                var t = image.getPixelColor(x, y + 1);
                var b = image.getPixelColor(x, y - 1);

                var lb = image.getPixelColor(x - 1, y - 1);
                var lt = image.getPixelColor(x - 1, y + 1);
                var rt = image.getPixelColor(x + 1, y + 1);
                var rb = image.getPixelColor(x + 1, y - 1);
                if (l == white || r == white || t == white || b == white || lb == white || lt == white || rt == white || rb == white) {
                    newImage.setPixelColor(white, x, y);
                } else {
                    newImage.setPixelColor(color, x, y);
                }
            }

            if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                callback(newImage);
            }
        })
    });
}

