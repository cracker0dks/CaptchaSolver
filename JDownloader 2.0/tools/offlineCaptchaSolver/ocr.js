var Jimp = require('jimp'); //For image processing
var fs = require('fs');
const { execSync } = require('child_process');

var what2Scan = process.argv[2] || "keep2share.cc"; //Start parameter
var inputPic = 'input.gif';
//inputPic = 'c2.PNG';
console.log("Running ->", what2Scan);


if (what2Scan == "keep2share.cc") {
    console.log("keep2share.cc");
    getKeep2share(inputPic, function (content) {
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

//Solving keep2share.cc new captchas
function getKeep2share(file, callback) {
    Jimp.read(file).then(image => {
        image.write('./darknet64/temp.jpg', function () {
            let result = execSync('cd darknet64 && darknet_no_gpu.exe detector test data/obj.data yolov3tinyobj.cfg yolov3tinyobjLast.weights -dont_show temp.jpg');
            let resultString = result.toString('utf8');
            //console.log(resultString);

            var lines = resultString.split("\r\n");
            var valdResA = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.indexOf(":") !== -1 && line.indexOf("%") !== -1) {
                    valdResA.push({ c: line.split(":")[0], p: line.split(": ")[1].replace("%", "") })
                }
            }
            while (valdResA.length > 6) { //Remove letters with lowest props
                var sma = 100; //Smallest confidence
                var index = 0; //Index of char with smallest confidence
                for (var i = 0; i < valdResA.length; i++) {
                    if (sma > valdResA[i]["p"]) {
                        sma = valdResA[i]["p"];
                        index = i;
                    }
                }
                valdResA.splice(index, 1);
            }
            var text = "";
            var confidence = 0;
            for (var i = 0; i < valdResA.length; i++) {
                text += valdResA[i]["c"];
                confidence += parseFloat(valdResA[i]["p"]);
            }
            confidence = Math.round(confidence / 6);
            callback({ host: what2Scan, text: text, confidence: confidence });
        });

    }).catch(err => {
        console.log(err);
    });
}