#!/usr/bin/env bash
# Resize (max 1200px wide) and convert photos to WebP for fast loading.
# Needs ImageMagick (`magick` or `convert`) or `cwebp`.
#   Ubuntu/Debian:  sudo apt install imagemagick webp
#   Mac (Homebrew): brew install imagemagick webp
# Usage:  ./scripts/optimize-images.sh          (processes assets/evidence and assets/photos)
set -euo pipefail
cd "$(dirname "$0")/.."
QUALITY=${QUALITY:-78}
MAX=${MAX:-1200}

if command -v magick >/dev/null; then IM="magick"; elif command -v convert >/dev/null; then IM="convert"; else IM=""; fi
if [ -z "$IM" ] && ! command -v cwebp >/dev/null; then
  echo "Please install ImageMagick or cwebp first (see the top of this file)." >&2; exit 1
fi

shopt -s nullglob nocaseglob
count=0
for dir in assets/evidence assets/photos; do
  for f in "$dir"/*.{jpg,jpeg,png,webp}; do
    out="${f%.*}.webp"
    tmp="$(mktemp --suffix=.webp 2>/dev/null || mktemp).webp"
    if [ -n "$IM" ]; then
      $IM "$f" -auto-orient -strip -resize "${MAX}x>" -quality "$QUALITY" "$tmp"
    else
      cwebp -quiet -q "$QUALITY" -resize "$MAX" 0 "$f" -o "$tmp"
    fi
    mv "$tmp" "$out"
    [ "$f" != "$out" ] && rm -f "$f"
    if [ -n "$IM" ]; then size=$($IM identify -format '%wx%h' "$out"); else size="?"; fi
    echo "✔ $out ($size, $(du -k "$out" | cut -f1) KB) – put this width/height in the JSON"
    count=$((count + 1))
  done
done
echo "Done: $count image(s). Remember: update file names (.webp), width and height in data/*.json."
