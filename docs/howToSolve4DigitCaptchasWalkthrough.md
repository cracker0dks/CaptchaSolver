# How To Solve 4 Digit Captchas With OCR In NodeJs #

## Tools used ##
* NodeJs
* OCR -> [tesseract.js](https://github.com/naptha/tesseract.js?files=1)
* Image processing -> [jimp](https://github.com/oliver-moran/jimp)

## Problem description ##

The captcha looks like this:

![ks](/docs/xFQIX.png)

(Original captcha. Frame is drawn in the original)

If you try to OCR this without editing, you will get just an empty result. OCR don't like this image at all!
But with some image processig this should not be pretty hard right?! Well not quite! And here is why...

## Solution Ideas ##
1. Remove the Frame
2. Remove Noise and lines by light colors
3. Finally OCR

## Removing Border and noise ##
Easy, just set every border pixel to white:

![ks](/docs/xFQIXbl.jpg)

(Captcha with remove border)

This captchas are always grayscale pictures, so to remove the noise, I just check every pixel (Pseudocode):
```
if red channel of pixel are over 50 -> set to white //255 is white, 0 black
```
This leaves only the black pixels:

![ks](/docs/xFQIXSolved.jpg)

(Captcha with remove noise)

It is time for the next round of OCR:

![ks](/docs/xFQIXOcr1.png) => OCR result with text: `thq`

At this point, I thought I would be done, and we get a nice result, but not a even close one...

So I tried to "fill gaps" and make it "thin" like in my [other docu](howToSolve6DigitCaptchasWalkthrough.md), on what I got success with... But the image is a lot smaller so I scaled it up a to work with... but no luck. The OCR did not like it... Always returns the same result => "thq"

My explanation for this is: Even tough the OCR is trained to detect letters AND numbers, it is not used to a number inside a "word" -> Not common in the english language. So it assumes the "2" must be a letter as well...

I validated this by putting a single char (the "h") from the captcha in, and it worked without problems... Also the "2", "d", "q" -> all characters without problems. So I was on the right path.

My new plan: Do some image segmentation first!

## Image Segementation ##
The first Idea what came to my to mind: Move from left to right trough the image, and remember all lines that have not crossed any black pixel.

![ks](/docs/xFQIXSeg1.png)

(Zoomed in on the captcha with some example lines that do not cross any black pixel)

With some computing, you could easily find the different connected segements. Would probably work here, but thinking ahead, we see other captchas in wich the letters are also above and below each other like here:

![ks](/docs/3Wh1hpL.jpg)

(Captcha from filepanzer.com)

So I wanted a more generic solution that would also work at some later point and more complex tasks.

To work in mor complex environments, we need to "connect" pixels to blocks. Even if they go around each other. Here is a nice video that explains the process pretty well:

[![preview](https://img.youtube.com/vi/ticZclUYy88/0.jpg)](https://youtu.be/ticZclUYy88)

I programmed the algorithm after the example in the video, but with the addition, that even pixels that are not direct neighbors but touch each other at one point (f.e. pixel [0,0] and [1,1]) are registred as "connected".

For better testing, I took the first half of the captcha -> So I'm still able to print the representive segmentation array in the console:

![ks](/docs/xFQIXCMDSeg.jpg)

(Array of connected pixels with red outline for better contrast)

The image shows a perfect segmentation of both segments ("h" and "2"), and this also works with more complex 2D images.
The image above also includes the function that sorts the segments from left to right (Not top->down or random). This is required, because we need all segments in the correct order -> even if the are small, tall or slightly displaced.

## Finalize and conclution ##
So after successful segmentation, we can run the OCR on each part, wait for all parts to be finished and add the results back together. This works without any problems!

I found out that, after I do the segmentation, then upscal -> fill gaps -> thin out. The result is even better.
The final algorithm works like:

1. Remove border
2. Remove grey (Noise)
3. run segmentation
4. Scale, fill gabs and thin it again (see last post for how it's done)
5. run OCR on each segment
6. Add all results in the right order

Original input: ![ks](/docs/xFQIX.png)

output:`h2dq`

With OCR confident log: `Letter0: h => 86% Letter1: 2 => 83% Letter2: d => 84% Letter3: q => 79%`

The result is perfectly fine, but I only had this one captcha image to test the algorithm with so far...
