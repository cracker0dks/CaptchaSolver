# JDownloader 2 Offline Captcha solver
JDownloader already solves a lot of captchas on its own, but for some hosts you have to input the result by hand. This tool reduces the list of unsupported hosts.

Using Javascript and [YOLO DARKNET](https://pjreddie.com/darknet/yolo/) neuronal Network to solve captchas!

## Supported Hosts:
 * keep2share.cc / k2s.cc;
* fileboom.me
* tezfiles.com
* depositfiles.com
* publish2.me
* filejoker.net

## Installation Windows
1. Download the latest standalone zip: [win](https://github.com/cracker0dks/CaptchaSolver/releases/download/v2.0.2/CaptchaSolver-v2.0.2_standalone_win.zip)
2. Extract the "JDownloader 2.0" content in your current JD2 folder
3. restart JD2 and start downloading

## Installation Linux & Mac

### Precompiled	
1. Install NodeJS and make sure it's available in your PATH
2. Clone this repository
3. Copy the "JDownloader 2.0" content into your current JD2 folder (probably `~/.jd`)
4. Restart JD2 and start downloading

### Compile darknet on your own
1. Clone this repository
2. Download and compile [AlexeyAB's fork of darknet](https://github.com/AlexeyAB/darknet)
3. Copy (and override) the resulting darknet executable to `/JDownloader 2.0/tools/offlineCaptchaSolver/darknet64/darknet`
4. Install NodeJS and make sure it's available in your PATH
5. Copy the "JDownloader 2.0" content into your current JD2 folder (probably `~/.jd` if you installed via flatpack try the path: /home/<username>/.var/app/org.jdownloader.JDownloader/data/jdownloader)
6. Restart JD2 and start downloading

## Troubleshooting Windows
If it does not work, got into the folder: `JDownloader 2.0\tools\offlineCaptchaSolver\darknet64` and open `test.bat`. You should see something like this if everthing is ok:
```
temp.jpg: Predicted in 74.892000 milli-seconds.
e: 99%
h: 74%
C: 100%
Y: 99%
C: 100%
1: 99% 
```
Or an error message.

If you get "msvcr100.dll" is missing, you need to install `Microsoft Visual C++ 2010 Service Pack 1` from here: https://www.microsoft.com/en-US/download/details.aspx?id=26999

## Deactivate The Captcha Solver for Hosts
This comes in handy, if the host changed the captcha type and you have to deactivate some hosts...

1. Go to ...\JDownloader v2.0\jd\captcha\methods\ 
2. Move the folders of the hosts you want to deactivate "keep2share_linux", "keep2share_win" to another save location
3. Restart JDownloader 2

To reactivate them, just copy them back in and restart JD2

## Supported Types of Captchas
### 6 Digits Captcha
![ks](/docs/i1.jpg)

Doc on how it is solved: [HERE](docs/howToSolveNew6DigitCaptchasWalkthrough.md)

### Geometrical Captcha
![ks](/docs/filejoker.png)

Doc on how it is solved: [HERE](docs/howToSolveGeoCaptchasWalkthrough.md)

## Old captchas (not supported anymore)
Download v1.x to get the code for solving this captchas!

### 6 Digits Captcha
![ks](/docs/ksinput.gif)

Doc on how it is solved: [HERE](docs/howToSolve6DigitCaptchasWalkthrough.md)

### 4 Digits Captcha
![ks](/docs/xFQIX.png)

Doc on how it is solved: [HERE](docs/howToSolve4DigitCaptchasWalkthrough.md)

---------------------

Thanks to Corubba for the linux part on v2.x!

