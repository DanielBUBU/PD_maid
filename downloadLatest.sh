cd ../
pkg install unrar
LOCATION=$(curl -s https://api.github.com/repos/DanielBUBU/PD_maid/releases/latest \
| grep "browser_download_url" \
| awk '{ print $2 }' \
| sed 's/,$//'       \
| sed 's/"//g' )     \
; curl -L -o temp.rar $LOCATION
unrar x temp.rar
rm temp.rar