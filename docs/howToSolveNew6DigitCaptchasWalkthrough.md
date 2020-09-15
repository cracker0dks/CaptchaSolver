# How To Solve the new 6 Letter Captchas with a neuronal network #
## Tools used ##
* NodeJs with [jimp](https://github.com/oliver-moran/jimp) (To copy images, generating Captchas and writing result files)
* Neuronal Network -> [Darknet Yolo](https://pjreddie.com/darknet/yolo/)

## Problem description ##
If you downloading from sites like keep2share or linksnappy in freemode, you probably know this captcha type:
![ks](/docs/220293750054.jpg)

(Original Captcha Image)

The old type (they changed it recently) I solved [here](/docs/howToSolve6DigitCaptchasWalkthrough.md).
So because they changed it, we need to solve it. Again!

## Abstract
To solve this captcha typ, I generated 500 captchas of this type by myself and trained the neuronal net with them. According to tests the accuracy of the trained net is above 98%, witch is more than sufficient.

Jump to [This Part](https://github.com/cracker0dks/CaptchaSolver/blob/master/docs/howToSolveNew6DigitCaptchasWalkthrough.md#next-level-and-my-solution-train-a-neuronal-network) if you just want more infos about the solution and not the way...

## The long journey of trys and errors
All captchas I solved so far, I just modified and fed them to [tesseract](https://github.com/naptha/tesseract.js?files=1), a neuronal ocr algorithm. So I did the same thing with this captcha... Long story short: Not working! Some problems with this approche:
1. Picture is just black and white so no seperation on this behalf
2. Not filled characters with shadow... the ocr not like them! We could fill them, but:
3. The random line which has the same color so its hard to seperate and also hard to fill the rights spots

### An alternative way
So my next try was to find features (Build on top of corner detection) in the captcha and compair them to the features of the plain letters. So I searched, and by pure luck, found the same font as is used in the captcha: [FONT](https://www.wfonts.com/font/comicbook-smash)... as I found out later also used by [base64Captcha](https://github.com/mojocn/base64Captcha), what is probably what they use to generate them.

First I generated images of all chars that could be present in the captchas like this A:

![a](/docs/A.jpeg)

Then used [trackingjs](https://trackingjs.com/docs.html#utilities) to generated the Features and saved them to a file.
This is what all extracted features look like on a real captcha:

![withCrns](/docs/withCrns.jpg)

With all features from the chars stored I tried to match them with the features from a captcha. The solution I expected:

![exp](/docs/exp.gif)

But instead got:

![exp](/docs/exp2.gif)

Not matching to the right features... And if you look at it, it is kind of obvious because the font characters are build out of the same "parts", so different letters will have the same features.

I thought about to connect features from each letter to clusters, but a the time I wrote an algorithm and "learn" these clusters I would also be able to try a "next level approche".

## Next Level and my solution: Train a Neuronal Network
At first I tried to train the net with the generated images from before, but maybe I got incorrect bounding boxes or this is just to little information for a proper training... it was poor. 

For neuronal networks its best practice to train them on real data anyway. So I wrote a captcha generator which also generates the description of the boundings for each letter in each captcha. The captchas look like this (the bounding boxes here are only the debug view and not used in training)

![exp](/docs/674340947845.jpg)

The file description for the net from the captchas above:
```
44 0.077005 0.51 0.084779 0.6
47 0.145284 0.505 0.082548 0.67
11 0.256011 0.5 0.177367 0.62
10 0.416285 0.54 0.243182 0.6
13 0.608178 0.5 0.217525 0.62
25 0.765291 0.5 0.165933 0.62
```
`<ClassName> <x_center> <y_center> <width> <height>`
   
This way I generated 500 Training and 100 Test captchas with description files and trained the net with help of this how to: [HOWTO](https://github.com/AlexeyAB/darknet#how-to-train-to-detect-your-custom-objects).

![exp](/docs/chart.png)

This is the loss function on the training. On normal conditions you will need aboud 2000 Iterations for each class you want to train (in this case 62 Classes). But as you see, this is going mutch faster! If the loss is under 1 you can consider to stop training... this was given in about 1h and 7000 Iterations (Trained on 1 GPU GTX-1070).

Testing against an unseen captcha (on cpu):

![exp](/docs/predictions.jpg)

With output:
```
Predicted in 3.482000 milli-seconds.
e: 99%
h: 74%
C: 100%
Y: 99%
C: 100%
1: 99%
```

In some cases the net will return more then 6 letters. In that case we remove the letters with low confidence till we only have 6 left.
After everything done, the node script which puts everything together will return something like: 
`{"host":"keep2share.cc","text":"ehCYC1","confidence":95}`
after all is done.

## Conclution & thoughts ##
With accuracy above 98% I'm more than happy with the result.
Feature detection could have worked, but Neuronal Networks are the future :)
