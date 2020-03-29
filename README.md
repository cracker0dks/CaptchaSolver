# JDownloader 2 Offline Captcha solver
JDownloader already solves a lot of captchas on its own, but for some hosts you have to input the result by hand. This tool reduces the list of unsupported hosts.

Using [YOLO DARKNET](https://pjreddie.com/darknet/yolo/) as neuronal Network to solve captchas!

## Installation Windows
1. Download the latest standalone zip: [win](https://github.com/cracker0dks/CaptchaSolver/releases/download/v2.0.0/CaptchaSolver-v2.0.0_standalone_win.zip)
2. Extract the "JDownloader 2.0" content in your current JD2 folder
3. restart JD2 and start downloading

## Installation Linux & Mac
1. Clone this repository
2. Download and compile [AlexeyAB's fork of darknet](https://github.com/AlexeyAB/darknet)
3. Copy the resulting darknet executable to `/JDownloader 2.0/tools/offlineCaptchaSolver/darknet64/darknet`
4. Install NodeJS and make sure it's available in your PATH
5. Copy the "JDownloader 2.0" content into your current JD2 folder (probably `~/.jd`)
6. Restart JD2 and start downloading

## Deactivate The Captcha Solver for Hosts
This come in handy if the host changed the captcha type and you have to deactivate some hosts...

1. Go to ...\JDownloader v2.0\jd\captcha\methods\ 
2. Move the folders of the hosts you want to deactivate "keep2share_linux", "keep2share_win", "przeklej_linux" or "przeklej_win" to another save location
3. Restart JDownloader 2

To activate them again, just copy them back in and restart JD2

## Supported Types of Captchas
This Tool automatically solves Captchas for you! 
This is a list of supported Captchas and the hosts, I know, are using them.
### 6 Digits Captcha (NEW)
![ks](/docs/i1.jpg)

Known Hosts with this captcha:
* keep2share.cc
* fileboom.me

Docu on how I solve this Captcha type: [HERE](docs/howToSolveNew6DigitCaptchasWalkthrough.md)

## Old (not used anymore) captchas
Download v1.x to get the code for solving this captchas!

### 6 Digits Captcha
![ks](/docs/ksinput.gif)

Docu on how I solve this Captcha type: [HERE](docs/howToSolve6DigitCaptchasWalkthrough.md)

### 4 Digits Captcha
![ks](/docs/xFQIX.png)

Known Hosts with this captcha:
* przeklej.org

Docu on how I solved this Captcha type: [HERE](docs/howToSolve4DigitCaptchasWalkthrough.md)

---------------------

Thanks to [budel](https://github.com/budel) for the linux part on v1.x!

