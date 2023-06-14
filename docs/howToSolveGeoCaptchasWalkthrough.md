# How To Solve Captchas With different geometrical shapes in NodeJs #

## Tools used ##
* NodeJs
* Image processing -> [jimp](https://github.com/oliver-moran/jimp)
* image-pixelizer -> [image-pixelizer](https://www.npmjs.com/package/image-pixelizer)

## Problem description ##

The captcha looks like this:

![ks](/docs/filejoker.png)

you need to put in the numbers of the shape you see in the upper left corner

## Challanges ##
* Shapes are rotated
* small resolution

## Solution ##
1. Cut the image into small parts (Only one shape per image)
2. Make the small image parts sharp
3. Resize image according to the size of the shape
4. Count the pixels of the shape and assign it to a shape name and compair it to the shape in the upper left corner

Lets dive into the different steps in detail

### 1. Cut the image into its small parts ###
Captchas are always 200px width and 150 or 200px in height. So we just extract little images in a 50x50 grid. One little image looks like this:

![ks](/docs/out5.png)

(Extracted part of the original Captcha)

### 2. Make the small image parts sharp ###
We first do a gaussian blur and then use the image-pixelizer to reduce the colors present in the little image to just 2 (we always have only two colors in every small image).
This will also sharpen up the image

![ks](/docs/out5_1.png)

(Captcha with only 2 colors)

### 3. Resize the image according to the size of the shape ###
Now we use a (self written) bucket fill tool from the center of the image (25px,25px) and fill with wite color.

![ks](/docs/out5_2.png)

(Captcha with white shape)


This way we can remove the number displayed in the little image (in the upper left corner). We need this because we want to find the pixel with the greatest distance from the center next. We can get the distance using the ![Math.hypot()]([https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot?retiredLocale=de](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot?retiredLocale=de)) function on all white pixels and choose the one with the heighest distance.

![ks](/docs/out5_3_withDistance.png)

(Captcha red pixel marked with the heighest distance -> red pixel inside the red circle)


With this distance we can resize the image because we know how "big" the shape is. So every shape has the (relative) same size to compair them by pixel count. 

```
//Example
dCorner = 35.36; //this is the distance from the center to the corner of the little image
dMax = 10; //This is the pixel with the heighest distance
resizeFactor = dCorner / dMax; //This is the factor we need to resize the little image (3.536)
/*
Resize the image
*/
```
We do this for every small image.

![ks](/docs/out5_4.png)

(Resized Captcha with white shape)

Now we count the pixels that are not black:

![ks](/docs/out5_5.png)

(Counted pixels are marked red: 3491 pixels)

Now we assign these counts to our list. This can be done, in general, because shapes with less pixels have more corners.

```
Circle > 3850 px
6 Corners > 3300 px
5 Corners > 3000 px
4 Corners > 2500 px
Circle > 0
```

In this case 3491 > 3300 ... so we guess it as 6 corner shape (Hexagon) 
So we get result like this for the whole captcha and compair it the shape in the upper left corner to get a result:

![ks](/docs/consoleOutFilejoker.PNG)

(Console log for the captcha)


## Conclution ##

In my tests this is working for like 95% of the shapes. That said, we have about 10 shapes in each captcha, so we are getting about >50% Success rate over all (thats enough for this kind of task). Recognize rectangels and circles is very easy because the difference of the pixels to the next shape is very big. 
In between it is not always be correct but it seems to be sufficient. 
