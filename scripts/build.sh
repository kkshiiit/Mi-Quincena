#!/usr/bin/env bash
# Builds and signs Mi Quincena's APK from app/ (web UI) + android/ (native shell).
#
# Requirements: Java 17+, apktool.jar, uber-apk-signer.jar.
# Signing settings come from environment variables; nothing secret lives in the repo:
#   APKTOOL_JAR      path to apktool.jar            (e.g. ~/tools/apktool.jar)
#   SIGNER_JAR       path to uber-apk-signer.jar    (e.g. ~/tools/uber-apk-signer.jar)
#   MQ_KEYSTORE      path to your .jks keystore     (optional: without it, a debug key is used)
#   MQ_KEY_ALIAS     key alias inside the keystore
#   MQ_KEY_PASS      keystore and key password
#
# Usage: scripts/build.sh   → dist/Mi-Quincena.apk
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/.build"
DIST="$ROOT/dist"
: "${APKTOOL_JAR:?Set APKTOOL_JAR to the path of apktool.jar}"
: "${SIGNER_JAR:?Set SIGNER_JAR to the path of uber-apk-signer.jar}"

node "$ROOT/tests/core.test.js"

rm -rf "$WORK" && mkdir -p "$WORK" "$DIST"
cp -r "$ROOT/android" "$WORK/project"
mkdir -p "$WORK/project/assets"
cp "$ROOT"/app/*.html "$ROOT"/app/*.js "$ROOT"/app/*.css "$WORK/project/assets/"

java -jar "$APKTOOL_JAR" b "$WORK/project" -o "$WORK/unsigned.apk"

if [[ -n "${MQ_KEYSTORE:-}" ]]; then
  java -jar "$SIGNER_JAR" -a "$WORK/unsigned.apk" -o "$WORK/signed" \
    --ks "$MQ_KEYSTORE" --ksAlias "${MQ_KEY_ALIAS:?}" \
    --ksPass "${MQ_KEY_PASS:?}" --ksKeyPass "$MQ_KEY_PASS" --allowResign
else
  echo "MQ_KEYSTORE not set: signing with a debug key (cannot update installs signed with your release key)." >&2
  java -jar "$SIGNER_JAR" -a "$WORK/unsigned.apk" -o "$WORK/signed" --allowResign
fi

cp "$WORK"/signed/*.apk "$DIST/Mi-Quincena.apk"
echo "Built $DIST/Mi-Quincena.apk"
