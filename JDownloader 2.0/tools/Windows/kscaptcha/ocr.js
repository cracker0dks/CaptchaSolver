var Tesseract = require('tesseract.js');
var Jimp = require('jimp');
var fs = require('fs');

var what2Scan = process.argv[2] || "keep2share.cc"; //Start parameter
var white = Jimp.rgbaToInt(255, 255, 255, 255);
var black = Jimp.rgbaToInt(0, 0, 0, 255);
var gray = Jimp.rgbaToInt(200, 200, 200, 255);

var inputPic = 'input.gif';
//inputPic = 'xFQIX.jpg';
console.log("Running ->", what2Scan);

if (what2Scan == "keep2share.cc") {
	console.log("keep2share.cc");
    getKeep2shareSText(inputPic, function (content) {
        fs.writeFile('result.txt', content["text"], (err) => {
            if (err) throw err;

            fs.writeFile('log.txt', JSON.stringify(content), (err) => {
                process.exit();
            });
        });

    })
} else  if (what2Scan == "przeklej.org") {
    getPrzeklejText(inputPic, function (content) {
        fs.writeFile('result.txt', content["text"], (err) => {
            if (err) throw err;

            fs.writeFile('log.txt', JSON.stringify(content), (err) => {
                process.exit();
            });
        });

    })
} else {
    console.log("No function found for: ", what2Scan);
}

function getPrzeklejText(file, callback) {
    Jimp.read(file).then(image => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            var color = image.getPixelColor(x, y);
            var rgbColor = Jimp.intToRGBA(color);
            if(rgbColor["r"]>50) {
                image.setPixelColor(white, x, y);
            }
            if(x==0||y==0||x==image.bitmap.width-1||y==image.bitmap.height-1) {
                image.setPixelColor(white, x, y);
            }
            
            if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) { //Scan1 finished
                
                changeAllPresentPixelsToBlack(image, function (image) {
                    getImageSegmentsAsImgs(image, white, function(OrgImage, binArray, imgArray) {
                        // console.log(partIndexs);
                        var callBackCnt = 0;
                        var finalWordArray = [];
                        var endConfidents = "";
                        for(var i = 0; i<imgArray.length;i++) {
                            callBackCnt++;
                            (function() {
                                var index = i;
                                var newImage = imgArray[index]["img"];
                                newImage.resize( 200, Jimp.AUTO );
                                changeAllPresentPixelsToBlack(newImage, function (newImage) {
                                    fillGaps(newImage, 1, function (newImage) {
                                        thinOut(newImage, 2, function (newImage) {
                                            // newImage.write('temp'+index+'.jpg', function () { //Print all segments of the image
                
                                            // });
                                            newImage.getBuffer(Jimp.MIME_JPEG, function(err, data){
                                                Tesseract.recognize(data).then(function (result) {
                                                    var text = result["text"].replace(/\W/g, '');
                                                    var confidence = result["confidence"];
                                                    endConfidents += " Letter"+index+": "+text+" => "+confidence+"%";
                                                    finalWordArray[index] = text;
                                                    callBackCnt--;
                                                    if(callBackCnt<=0) {
                                                        var finalWord = finalWordArray.join("");
                                                        console.log(finalWord);
                                                        callback({ host : what2Scan, text: finalWord, confidence: endConfidents });
                                                    }
                                                })
                                            });
                                        });
                                    });
                                });
                            })();
                        }
                        
                        OrgImage.write('temp.jpg', function () {
                            //Save img without white noise just for fun
                        });
                    })
                });
            }
        });
    }).catch(err => {
        console.log(err);
        // Handle an exception.
    });
} 

function getKeep2shareSText(file, callback) {
    var colorBuffer = {};
    var bandColors = [];
    var borderColors = {};
    Jimp.read(file).then(image => {
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
                    var rgbColor = Jimp.intToRGBA(color);
                    if(!isColorVisableWellOnWhite(rgbColor)) { //remove colors that are barley seen
                        image.setPixelColor(white, x, y);
                    }

                    for (var k in bandColors) {
                        var clEntry = bandColors[k];

                        if (color == clEntry["color"]) {
                            image.setPixelColor(white, x, y);
                            break;
                        }
                    }

                    if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                        fillGaps(image, 3, function (image) {
                            thinOut(image, 2, function (image) {
                                changeAllPresentPixelsToBlack(image, function (image) {
                                    image.write('temp.jpg', function () {
                                        fs.readFile('temp.jpg', function (err, data) {
                                            Tesseract.recognize(data).then(function (result) {
                                                var text = result["text"].replace(/\W/g, '');
                                                var confidence = result["confidence"];
                                                callback({ host : what2Scan, text: text, confidence: confidence });
                                            })
                                        });
                                    });
                                });
                            });    
                        })
                    }
                });
            }
        });
    }).catch(err => {
        console.log(err);
        // Handle an exception.
    });
}

function getImageSegmentsAsImgs(image, backGroundColor, callback) {
    var binArray = [];
    var matchObj = {};
    var sgmntCnt = 1;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var color = image.getPixelColor(x, y);
        if(!binArray[y]) {
            binArray[y] = [];
        }
        if(color != backGroundColor) {
            //Image segmentation as shown in https://www.youtube.com/watch?v=ticZclUYy88
            if(y-1 >= 0 && binArray[y-1] && binArray[y-1][x]) {
                binArray[y][x] = binArray[y-1][x];
                if(x-1 >=0 && binArray[y] && binArray[y][x-1] >0 && binArray[y][x-1] != binArray[y][x]) {
                    if(!matchObj[binArray[y][x-1]]) {
                        matchObj[binArray[y][x-1]] = {};
                    }
                    if(binArray[y][x-1] > binArray[y][x]) {
                        matchObj[binArray[y][x-1]][binArray[y][x]] = binArray[y][x];
                    } else {
                        if(!matchObj[binArray[y][x]]) {
                            matchObj[binArray[y][x]] = {};
                        }
                       matchObj[binArray[y][x]][binArray[y][x-1]] = binArray[y][x-1];
                    }
                   
                }

            } else if(x-1 >=0 && binArray[y] && binArray[y][x-1]) {
                binArray[y][x] = binArray[y][x-1];
            } else if(y-1 >= 0 && x-1 >=0 && binArray[y-1] && binArray[y-1][x-1]) {
                binArray[y][x] = binArray[y-1][x-1];
            } else {
                binArray[y][x] = sgmntCnt;
                sgmntCnt++;
            }
        } else {
            binArray[y][x] = 0;
        }
        if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
            var partIndexs = {};
            for(var y=0;y<binArray.length;y++) {
                for(var x=0; x<binArray[y].length;x++) {
                    if(binArray[y][x] > 0 && matchObj[binArray[y][x]]) {
                        binArray[y][x] = getLastChainElement(matchObj, binArray[y][x]);
                        
                        partIndexs[binArray[y][x]] = binArray[y][x];
                    }
                }
            }
            
            var callBackCnt = 0;
            var imgObj = {};
            for(var i in partIndexs) {
                callBackCnt++;
                (function() {
                    var index = i;
                    imgObj[index] = {};
                    new Jimp(image.bitmap.width, image.bitmap.height, white, (err, newImage) => {
                        for(var y=0;y<binArray.length;y++) {
                            for(var x=0; x<binArray[y].length;x++) {
                                if(binArray[y][x]==index) {
                                    //Search for the pixel most left and most top for the correct parse order
                                    imgObj[index]["lx"] = imgObj[index]["lx"] && imgObj[index]["lx"]<x ? imgObj[index]["lx"] : x;
                                    imgObj[index]["ly"] = imgObj[index]["ly"] && imgObj[index]["ly"]<y ? imgObj[index]["ly"] : y;
                                    newImage.setPixelColor(black, x, y); //Draw the segments to new images
                                }                            
                            }
                        }
                        imgObj[index]["img"] = newImage;
                        callBackCnt--;
                        if(callBackCnt <=0) {
                            var retArray = [];
                            for(var k in imgObj) {
                                retArray.push(imgObj[k]);
                            }
                            retArray = retArray.sort(function(a,b) {
                                if(a["lx"]>b["lx"]) 
                                    return 1;
                                return -1;
                            });
                            callback(image, binArray, retArray);
                        }
                    });
                })();
            }
            
        }
    });
}

function getLastChainElement(matchObj, nr) {
    if(!matchObj[nr]) {
        return nr;
    } else {
        var smallest = null;
        for(var i in matchObj[nr]) {
            var newNr = getLastChainElement(matchObj, matchObj[nr][i]);
            if(!smallest || smallest > newNr) {
                smallest = newNr;
            }
        }
        return smallest;
    }
}

function changeAllPresentPixelsToBlack(image, callback) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var color = image.getPixelColor(x, y);
        if(color != white) {
            image.setPixelColor(black, x, y);
        }
        
        if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
            callback(image);
        }
    });
}

function fillGaps(image, iterations, callback) {
    iterations--;
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
                if(iterations<=0) {
                    callback(newImage);
                } else {
                    fillGaps(newImage, iterations, callback);
                }
            }
        })
    });
}

function thinOut(image, iterations, callback) {
    iterations--;
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
                if(iterations<=0) {
                    callback(newImage);
                } else {
                    thinOut(newImage, iterations, callback);
                }
            }
        })
    });
}

function removeSpikes(image, iterations, callback) {
    iterations--;
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

                var whiteNCount = 0;
                if (l == white) {
                    whiteNCount++;
                } 
                if(r == white) {
                    whiteNCount++;
                } 
                if(t == white) {
                    whiteNCount++;
                } 
                if(b == white) {
                    whiteNCount++;
                } 
                if(lb == white) {
                    whiteNCount++;
                } 
                if(lt == white) {
                    whiteNCount++;
                } 
                if(rt == white) {
                    whiteNCount++;
                } 
                if(rb == white) {
                    whiteNCount++;
                }

                if(whiteNCount>=4) {
                    newImage.setPixelColor(white, x, y);
                } else {
                    newImage.setPixelColor(color, x, y);
                }
            }

            if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
                if(iterations<=0) {
                    callback(newImage);
                } else {
                    thinOut(newImage, iterations, callback);
                }
            }
        })
    });
}

function luminanace(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

//contrast([255, 255, 255], [255, 255, 0]); 1.074 for yellow
//contrast([255, 255, 255], [0, 0, 255]); // 8.592 for blue
function contrast(rgb1, rgb2) {
    return (luminanace(rgb1["r"], rgb1["g"], rgb1["b"]) + 0.05)
         / (luminanace(rgb2["r"], rgb2["g"], rgb2["b"]) + 0.05);
}

function isColorVisableWellOnWhite(rgbColor) {
    if(contrast(Jimp.intToRGBA(white), rgbColor) < 2 && rgbColor["r"] > 150 && rgbColor["g"] > 150 && rgbColor["b"] > 150) {
        return false;
    }
    return true;
}
