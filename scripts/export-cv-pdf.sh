#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
input_html="$repo_root/single-page-cv/index.html"
output_pdf="$repo_root/assets/Thorben_Woelk_CV_2026.pdf"

if [[ ! -f "$input_html" ]]; then
  echo "[cv-pdf] Missing input file: $input_html" >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "[cv-pdf] bun is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[cv-pdf] node is required but was not found in PATH." >&2
  exit 1
fi

node "$repo_root/scripts/export-cv-pdf.mjs" "$input_html" "$output_pdf"

if command -v pdfinfo >/dev/null 2>&1; then
  pages="$(pdfinfo "$output_pdf" | awk '/^Pages:/ {print $2}')"
  if [[ "$pages" != "1" ]]; then
    echo "[cv-pdf] Expected a single-page PDF, got $pages pages." >&2
    exit 1
  fi
fi

echo "[cv-pdf] Updated $output_pdf"
