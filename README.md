# JDownloader 2 Offline Captcha Solver

Automated offline CAPTCHA solver for JDownloader 2 (JD2). It uses a local **YOLO Darknet** convolutional neural network and in-memory geometric feature analysis to automatically solve CAPTCHAs that JD2 cannot handle natively.

Runs **100% locally and offline** without third-party API keys or recurring subscription costs.

---

## Supported File Hosts

| Host | CAPTCHA Type | Engine |
| :--- | :--- | :--- |
| **keep2share.cc** / **k2s.cc** | 6-Character Alphanumeric | YOLOv4-tiny neural network |
| **fileboom.me** / **fboom.me** | 6-Character Alphanumeric | YOLOv4-tiny neural network |
| **tezfiles.com** | 6-Character Alphanumeric | YOLOv4-tiny neural network |
| **publish2.me** | 6-Character Alphanumeric | YOLOv4-tiny neural network |
| **depositfiles.com** / **dfiles.eu** | 6-Character Alphanumeric | YOLOv4-tiny neural network |
| **filejoker.net** | Geometric Shape Matching | In-memory Pixelizer & Flood-fill |

---

## Installation & Deployment

### Method 1: Docker / Homelab (Recommended)

This repository includes a production-ready, multi-stage [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml) based on `jlesage/jdownloader-2`.

**Features of the Docker setup:**
* **Native Darknet Compilation:** Darknet is compiled from source in Stage 1 directly on Alpine Linux (`musl`), supporting both **AMD64 (x86_64)** and **ARM64** (Raspberry Pi, Apple Silicon hosts, ARM NAS) without glibc emulation hacks (`gcompat`).
* **Pre-bundled Dependencies:** Node.js and production npm packages are baked into the image at build time.
* **Automatic Initialization:** On container startup, an s6 init hook initializes the JAC captcha methods into `/config/jd/captcha/methods` and tools into `/config/tools/offlineCaptchaSolver` with correct user permissions (`USER_ID:GROUP_ID`).

#### Quickstart:
1. Clone this repository:
   ```bash
   git clone https://github.com/cracker0dks/CaptchaSolver.git
   cd CaptchaSolver
   ```

2. Start the container with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. Open your browser and navigate to:
   ```
   http://<your-server-ip>:5800
   ```
   JDownloader 2 will start with the offline CAPTCHA solver pre-configured and active.

#### Configuration (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  jdownloader:
    build:
      context: .
      dockerfile: Dockerfile
    image: jdownloader2-captchasolver:latest
    container_name: jdownloader2
    environment:
      - USER_ID=1000
      - GROUP_ID=1000
      - TZ=Etc/UTC
      # Set DEBUG=true to output intermediate transform logs
      - DEBUG=false
    ports:
      - "5800:5800" # JDownloader Web GUI
    volumes:
      - ./config:/config
      - ./downloads:/output
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
```

---

### Method 2: Manual Linux Installation

1. **Install Node.js & npm**:
   Ensure Node.js (v14+) is installed and accessible in your system `PATH`:
   ```bash
   node -v
   npm -v
   ```

2. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/cracker0dks/CaptchaSolver.git
   cd CaptchaSolver/"JDownloader 2.0"/tools/offlineCaptchaSolver
   npm ci --production
   chmod +x *.sh darknet64/darknet
   ```

3. **Architecture Check (ARM64 vs. AMD64)**:
   * On **x86_64 (AMD64)**: The precompiled `darknet64/darknet` binary can be used directly on glibc-based systems (Ubuntu, Debian, Fedora).
   * On **ARM64**: Compile Darknet from source:
     ```bash
     git clone --depth 1 https://github.com/AlexeyAB/darknet.git /tmp/darknet
     cd /tmp/darknet && make -j$(nproc)
     cp darknet <path-to-repo>/"JDownloader 2.0"/tools/offlineCaptchaSolver/darknet64/darknet
     ```

4. **Copy into JDownloader 2 Folder**:
   Copy the contents of `JDownloader 2.0/` into your JDownloader root directory (typically `~/.jd`, or `~/.var/app/org.jdownloader.JDownloader/data/jdownloader/` for Flatpak):
   ```bash
   cp -r "JDownloader 2.0/"* ~/.jd/
   ```

5. **Restart JDownloader 2**.

---

### Method 3: Windows Installation

1. Download the latest standalone release archive.
2. Extract the contents of `JDownloader 2.0` directly into your main JDownloader 2 installation directory (e.g. `C:\Users\<User>\AppData\Local\JDownloader 2.0\`).
3. If Darknet fails to run, install the **Microsoft Visual C++ 2010 Service Pack 1 Redistributable Package** (x64).
4. Restart JDownloader 2.

---

### Method 4: Headless Remote Service

If you run JDownloader on a remote NAS/server and prefer a decoupled architecture that does not modify your JDownloader container, consider:
👉 **[cracker0dks/captchaSolverRemote](https://github.com/cracker0dks/captchaSolverRemote)**

This alternative runs as a separate container, connects to the official **My.JDownloader cloud API**, listens for CAPTCHAs, and submits solutions remotely.

---

## Configuration & Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DEBUG` | `false` | When set to `true`, outputs detailed processing logs and saves intermediate image files for debugging. |
| `CAPTCHA_INPUT` | `input.gif` | Path to the CAPTCHA image provided by JDownloader. |
| `CAPTCHA_OUTPUT` | `result.txt` | Target text file where the solved string is written. |
| `CAPTCHA_LOG` | `log.txt` | Target file for JSON solver telemetry (confidence, host, answer). |

---

## Architecture & How It Works

### 1. 6-Digit Alphanumeric Captchas (Keep2Share & mirrors)
* **Pre-processing:** The input image is converted to grayscale, and pixel thresholding (`rgb.r < 253`) strips out colored lines and background noise.
* **Inference:** The cleaned image (`darknet64/temp.jpg`) is analyzed by Darknet using a custom-trained **YOLOv4-tiny** model (`yolov4-tiny-custom_last.weights`).
* **Post-processing:** Ambiguous font glyphs (such as uppercase `I` vs. lowercase `l`) are resolved, low-confidence false positives are pruned, and the predicted 6-character string is written to `result.txt`.
* Detailed training documentation: [Walkthrough](docs/howToSolveNew6DigitCaptchasWalkthrough.md).

### 2. Geometric Shape Captchas (FileJoker)
* **Pre-processing:** The $5 \times 5$ CAPTCHA grid is segmented into individual tiles.
* **Clustering & Detection:** Each tile is blurred, pixel-clustered (`image-pixelizer`), and flood-filled from the center.
* **Shape Classification:** Radius and perimeter pixel counts identify the geometry (Circle, Hexagon, Pentagon, Square, Triangle) to match the prompt tile.
* **Performance:** All transformations operate in memory to prevent disk wear on SSD/flash storage.
* Detailed shape documentation: [Walkthrough](docs/howToSolveGeoCaptchasWalkthrough.md).

---

## Troubleshooting

### Check Solver Logs
* **Execution & Stderr Log:** Check `tools/offlineCaptchaSolver/solver.log` inside your JD2 directory for process exit codes, Node errors, or Darknet messages.
* **Result & Confidence Log:** Check `tools/offlineCaptchaSolver/log.txt` for the JSON response payload.

### Testing Darknet Directly
* **Windows:** Run `JDownloader 2.0\tools\offlineCaptchaSolver\darknet64\test.bat`.
* **Linux / Docker:**
  ```bash
  cd tools/offlineCaptchaSolver/darknet64
  ./darknet detector test data/obj.data yolov4-tiny-custom.cfg yolov4-tiny-custom_last.weights -dont_show temp.jpg
  ```
  Expected output:
  ```
  temp.jpg: Predicted in 74.892000 milli-seconds.
  e: 99%
  h: 74%
  C: 100%
  Y: 99%
  C: 100%
  1: 99%
  ```

### Deactivating Solvers for Specific Hosts
If a host changes its CAPTCHA provider:
1. Navigate to `jd/captcha/methods/` in your JDownloader folder.
2. Move or rename the corresponding directory (e.g. `keep2share_linux` or `filejoker_linux`).
3. Restart JDownloader 2.
