# JDownloader 2 Offline Captcha solver
This Tool automatically solves Captchas for you! JDownloader already solves a lot of captchas on its own, but for some hosts you have to input the result by hand. This tool reduces the list of unsupported hosts. Full [List of supported Captachs by JD2 here](https://board.jdownloader.org/showthread.php?p=225515)

This tool is running in NodeJs with [JIMP](https://github.com/oliver-moran/jimp) for image processing and [tesseract.js ](https://github.com/naptha/tesseract.js) for OCR
## Windows Installation
1. Download or Clone this repo
2. Extract the "JDownloader 2.0" content in your current JD2 folder
3. restart JD2

Will not work on Linux and Mac...

## Supported Types of Captchas
This is a list of supported Captchas and the hosts, I know, are using them.
### 6 Digits Captcha
![ks](/docs/ksinput.gif)

Known Hosts with this captcha:
* keep2share.cc
* fileboom.me

Docu on how I solved the Captcha: https://blog.cloud13.de/?p=123

### 4 Digits Captcha
![ks](/docs/xFQIX.png)

Known Hosts with this captcha:
* przeklej.org

Docu on how I solved the Captcha: https://blog.cloud13.de/?p=171

---------------------
If you know any other Hosts that uses the same Captcha, feel free to open an issue!



