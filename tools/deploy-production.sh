#!/bin/bash
set -eu

cd "$(dirname "$0")/.."
root="$HOME/public_html"
backup_dir="$HOME/portfolio-production-backup"
password_file="$HOME/.htpasswds/portfolio-sola/passwd"

if [[ ! -s "$password_file" || ! -s public/work/sola/.htaccess || ! -d "$root" || -L "$root" ]]; then
    echo 'Expected a Sola password file, its Apache configuration, and a physical public_html directory.' >&2
    exit 1
fi

if [[ -f "$root/.portfolio-release" ]]; then
    # Protect Sola before copying any new case-study content.
    mkdir -p "$root/work/sola"
    cp public/work/sola/.htaccess "$root/work/sola/.htaccess"
    cp -R public/. "$root/"
    exit 0
fi

if [[ -e "$backup_dir/public_html" || -L "$backup_dir" ]]; then
    echo 'The production backup already exists. Move it to another private location before cutting over again.' >&2
    exit 1
fi

release="$(mktemp -d "$HOME/.portfolio-release.XXXXXX")"
trap 'rm -rf -- "$release"' EXIT
cp -R public/. "$release/"
if [[ -d "$root/.well-known" ]]; then
    cp -pR "$root/.well-known" "$release/"
fi
touch "$release/.portfolio-release"
chmod 755 "$release"
mkdir -p -m 700 "$backup_dir"
chmod 700 "$backup_dir"

mv "$root" "$backup_dir/public_html"
if ! mv "$release" "$root"; then
    mv "$backup_dir/public_html" "$root"
    exit 1
fi
