# How To Solve 6 Letter Captchas With OCR In NodeJs #
## Tools used ##
* NodeJs
* OCR -> [tesseract.js](https://github.com/naptha/tesseract.js?files=1)
* Image processing -> [jimp](https://github.com/oliver-moran/jimp)

## Problem description ##
If you downloading from sites like keep2share or linksnappy in freemode, you probably know captchas like this:
![ks](/docs/ksinput.gif)

(Original Captcha Image)

They are really a mess and not easy to solve, even for humans. So if you throw an OCR (optical character recognition) Algorithm like Tesseract on it, you will not get pretty far:

![ks](/docs/ocr-1.png)

(Original Captcha with OCR Analyze Grid)

Text Output from the OCR:
```
%‘\‘3"~5M?S‘§x§1n;r§“é"%w »
§‘§%x;‘a1§§* “@333
:mmrémwmﬂsmummz
```
So this goes nowhere… we first need to do some image processing and then OCR afterwards. But How to extract the letters from the [„white noise„](https://en.wikipedia.org/wiki/White_noise)?

## Solution Ideas ##

Here are some Ideas that first came to my mind, but are not very effective:

1. Use the color from the letters
    1. Good Idea but the colors changing on each captcha (Letter and noise color)
2. Do some border (corner) detection
    1. To prevent that, there are quite a lot small gray(ish) lines drawn from bottom to top.
    2. Also hard because of the noise
3. First eliminate the white noise pixels by reducing all pixels that have a white pixel neighbor (probably need to be done more than once). Then add pixels to all remaning pixels to get structure back.
    1. would work if the letters itself wouldn’t be coverd by pixels and crossed by lines… so they are also kind of „white noise“ by them self.
    
So I had to come up with something better. So here is what I did.
    
## First Approach to remove „white noise“ ##
    
One thing I noticed was, that all noise pixels have the same color (In every captcha a different one). So lets make a table with colors of the Image pixels and sort them by the amount.
Result (Simplified):

| Color | Pixel |
|-------|-------|
| White | 4032  |
| Blue  | 3205  |
| Green | 1424  |
| Black | 802   |

We can ignore white as background color. But in every captcha is almost the same amount of noice… and always more noise pixels than letter pixels. So just take the color on second place and change all the pixels with this color to white. TADA:

![ks](/docs/lines.png)

(Captcha without „white noice“)

Not looking to bad right? But we still have the lines in it… so putting it into Tesseract OCR like this will result in:

![ks](/docs/kslines2.png)

(First Captcha approach with OCR Analyze Grid)

With Text output:
````
“:é" 3%" H
X§%z??i‘j¥z€c’ is")!
````
So we have to remove the lines to get to towards a good solution.

## Removing lines (And white noice with it) ##

At this point I noticed, that all lines are drawn from bottom to top (Without exceptions) and also drawn with a different color than the letters. The second thing I noticed, on top and bottom of the text we have a margin –> almost every time.

![ks](/docs/margin.png)

(Captcha with marked Margin areas)

So the Idea I got: Just ban all colors that are in this two areas, and the lines should be gone. Code to add all baned colors to the object „borderColors“:
````
image.scan(0, 0, image.width, image.height, function (x, y, idx) {
   var pixelColor = image.getPixelColor(x, y);
   if (pixelColor != white && (y < 2 || image.bitmap.height - y < 10)) {
      borderColors[pixelColor] =true;
   }
   [...]
});
````
To be save I just used the top 2 Pixels, and the 10 bottom pixel-lines, because of position change of the letters. Result looks like this:

![ks](/docs/rmlines.jpg)

(Captcha with removed lines)

UPDATE (07/19): Because sometimes the captcha text is moved to the top (or bottom) of the image, we will a have risk to ban colors from the text and are unable solve it! The solution for this problem: Only ban colors that are in the top AND bottom margin of the image.

````
Collect all pixels from the top margin
Collect all pixels from the bottom margin
comapair top and bottom margin and ban all colors represented in both
````

## Obsolete code and current state ##
As you may noticed, the „white noise“ and the gray line color is also present inside the margin areas… so by removing the margin colors we will get rid of the „white noise“ and the gray lines in one step –> we can remove the „white noise“ code witch is nice.
So lets see what we get from the OCR

![ks](/docs/ocr-2.png)

(Second Captcha approach with OCR Analyze Grid)

The Text result: `a; s m J”! 5‘31`

So this is better, but not a working solution.

## Fill gaps and reshape it ##
OCR still not working…, that’s because the pixels from the letters are not connected. So we need to fill the gaps between them. To do so, I implemented a new function, the pseudocode looks like this:
````
Iterate over every image Pixel //called CurrentPixel
    If CurrentPixel has other color than white do:
        Set all sorounding pixels to the color of the CurrentPixel
````
Now we also extended some pixels on the edges (not only gaps) -> everything gets very bold and we will still have some gaps.
Because we don’t want to make everything bold, we reverse the process and make the letters „thin“ again. This will not remove all the pixels we just added, only pixels with no surround pixels.
Pseudocode:
````
Iterate over every image Pixel //called CurrentPixel
    If the CurrentPixel has a white Pixel around him?
        Set CurrentPixel to white
````
To be able to fill bigger gabs, we run the „fill gaps“ process three times first, the „thinning process“ also more than once. I figuerd out that I get better results from the OCR if the „thinning process“ is only used twice (not three times).
Result:

![ks](/docs/nsolved1.jpg)

(Captcha with filled gaps)

So OCR it again… and…

![ks](/docs/ocr-3.png)

(Third Captcha approach with OCR Analyze Grid)

Text result: ``VimoWiy``

We still got a small gray dot in the picture, but the result is perfect at this example!

## Bonus: Removing gray dots ##

Even though it works in this example, dosen’t mean that this gray dots will not be a problem in other captchas… So to remove it, we remove all pixels under a contrast threshold –> set them to white.

pseudocode:
````
Iterate over every image Pixel //called CurrentPixel
    If contrast from CurrentPixel to background under threshold:
        Set CurrentPixel color to white
````
For the OCR we also change all remaining Pixels that aren’t white to black. (If the color is to light the OCR will not like it…)
Resulting in:

![ks](/docs/comp.gif)

(Black Captcha whit removed gray dots on the left, compaired to the original right )

That’s a pretty good result if you compair them side by side!

## Conclution & thoughts ##
So at the end we can rearange the hole process a little and remove the gray dots before filling gaps, wich looks like this:
1. Remove all colors that are present in the top and bottom part of the image
2. Remove Gray dots (by contrast)
3. Fill gaps
4. Change all remaining pixels to black
5. OCR
DONE!

Tesseract also outputs how confident it is about the result. For the result image above it’s 72%. Thats not perfect, but is also not a problem if we want to use it for solving download captchas.

I also tested on a lot of other images and it got about 90% correct results… even if I (with my eyes) wasn’t able to solve it! So no need to improve the algorithm futher atm 🙂
