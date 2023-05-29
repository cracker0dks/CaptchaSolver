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
1. Download the latest standalone zip: [win](https://github.com/cracker0dks/CaptchaSolver/releases/download/v2.1.0/CaptchaSolver-v2.1.0_standalone_win.zip)
2. Extract the "JDownloader 2.0" content in your current JD2 folder
3. restart JD2 and start downloading

## Installation Linux

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
  
## Installation MAC

```
1. brew install node && brew install cmake && brew install opencv
3. git clone https://github.com/AlexeyAB/darknet
4. cd darknet
5. mkdir build_release
6. cd build_release
7. cmake .. -DENABLE_CUDA=OFF -DOpenCV_DIR=/usr/local/Cellar/opencv/cmake
8. cmake --build . --target install --parallel 8
9. ..
10. vi makefile
```
11. Then edit OPENCV=0 to 1
- You can use nano (as it is very simple) to edit the text file if you are not used to with vi. For that just do: `nano makefile`
- edit OPENCV=0 to 1
- press control x
- then y
- then enter

Troubleshoot to see if darknet is working with opencv correctly: `cd ~/darknet && ./darknet imtest data/eagle.jpg`
```
12. git clone https://github.com/cracker0dks/CaptchaSolver.git
13. cd ~/CaptchaSolver/JDownloader\ 2.0/tools/offlineCaptchaSolver
14. npm install
```
Now while you still in this directory in the terminal do this to ensure this files executable: `chmod +x filejoker.sh keep2share.cc.sh checkdeps.sh`
Check node & npm location by `which node` & `which npm`(Isn't necessary cause it should be in the same location for everyone who installed it via brew)
Now we'll use this path to the `filejoker.sh keep2share.cc.sh checkdeps.sh`
Again I'm using vi but obvs u can use nano.
`vi keep2share.cc.sh`
edit `node` to `/usr/local/bin/node`
`vi filejoker.sh`
edit `node` to `/usr/local/bin/node`
`vi checkdeps.sh`
edit `npm` to `/usr/local/bin/npm`
1. `cp -rf ~/darknet/. ~/CaptchaSolver/JDownloader\ 2.0/tools/offlineCaptchaSolver/darknet64`
(Copy and merge darknet content to CaptchaSolver)
3. `cp -rf ~/CaptchaSolver/JDownloader\ 2.0/. /Applications/JDownloader\ 2.0`
(Copy and merge CaptchaSolver content to JDownloader 2 app folder)
5. `rm -rf /Users/utsho/CaptchaSolver /Users/utsho/darknet`
(Remove the duplicate darknet & CaptchaSolver directory from your user home directory as it'll no longer needed by `CaptchaSolver`)

Finally you can open JDownloader app and try to download, if it didn't work in a minute or 2 then stop or disable the specific downloads and start it again. If still it didn't work just see the log file in `/Applications/JDownloader\ 2.0/tools/offlineCaptchaSolver/log.txt`  


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
![ks](/docs/07d9b0cdf598be2a6e734f793a19831d.jpg)

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

