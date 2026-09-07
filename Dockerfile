# ==============================================================================
# Multi-stage Dockerfile for JDownloader 2 with CaptchaSolver
# Supports AMD64 and ARM64 architectures
# ==============================================================================

# Stage 1: Build Darknet natively from source for Alpine musl
FROM alpine:3.19 AS darknet-builder

RUN apk add --no-cache \
    build-base \
    git

WORKDIR /tmp/darknet
RUN git clone --depth 1 https://github.com/AlexeyAB/darknet.git . \
    && sed -i 's/AVX=1/AVX=0/g' Makefile \
    && sed -i 's/OPENMP=1/OPENMP=0/g' Makefile \
    && make -j$(nproc)

# Stage 2: Final runtime container extending jlesage/jdownloader-2
FROM jlesage/jdownloader-2:latest

# Switch to root to install system dependencies
USER root

RUN apk add --no-cache \
    nodejs \
    npm \
    libstdc++ \
    dos2unix


# Copy the natively compiled Darknet binary
COPY --from=darknet-builder /tmp/darknet/darknet /defaults/darknet

# Prepare directory for CaptchaSolver defaults
RUN mkdir -p /defaults/CaptchaSolver/jd/captcha/methods \
    && mkdir -p /defaults/CaptchaSolver/tools/offlineCaptchaSolver

# Copy repository files into defaults
COPY ["JDownloader 2.0/jd/captcha/methods/", "/defaults/CaptchaSolver/jd/captcha/methods/"]
COPY ["JDownloader 2.0/tools/offlineCaptchaSolver/", "/defaults/CaptchaSolver/tools/offlineCaptchaSolver/"]

# Replace darknet with our musl-native compiled binary and remove Windows binaries
RUN cp /defaults/darknet /defaults/CaptchaSolver/tools/offlineCaptchaSolver/darknet64/darknet \
    && rm -f /defaults/CaptchaSolver/tools/offlineCaptchaSolver/node.exe \
    && rm -f /defaults/CaptchaSolver/tools/offlineCaptchaSolver/darknet64/*.exe \
    && rm -f /defaults/CaptchaSolver/tools/offlineCaptchaSolver/darknet64/*.dll

# Pre-install npm dependencies at image build time (no dynamic runtime install)
WORKDIR /defaults/CaptchaSolver/tools/offlineCaptchaSolver
RUN npm ci --production

# Create s6 initialization script to populate /config and fix permissions
RUN printf '#!/bin/sh\n\
echo "[CaptchaSolver] Initializing CaptchaSolver in /config..."\n\
mkdir -p /config/jd/captcha/methods /config/tools/offlineCaptchaSolver\n\
cp -rn /defaults/CaptchaSolver/jd/captcha/methods/* /config/jd/captcha/methods/ 2>/dev/null || true\n\
cp -rn /defaults/CaptchaSolver/tools/offlineCaptchaSolver/* /config/tools/offlineCaptchaSolver/ 2>/dev/null || true\n\
cp -f /defaults/darknet /config/tools/offlineCaptchaSolver/darknet64/darknet\n\
dos2unix /config/tools/offlineCaptchaSolver/*.sh 2>/dev/null || true\n\
chmod +x /config/tools/offlineCaptchaSolver/*.sh\n\
chmod +x /config/tools/offlineCaptchaSolver/darknet64/darknet\n\
chown -R ${USER_ID:-1000}:${GROUP_ID:-1000} /config/tools/offlineCaptchaSolver /config/jd/captcha/methods\n\
echo "[CaptchaSolver] Initialization complete."\n' > /etc/cont-init.d/99-captchasolver.sh \
    && chmod +x /etc/cont-init.d/99-captchasolver.sh

# Revert to unprivileged app user
USER app
WORKDIR /config
