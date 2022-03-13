#!/bin/sh
echo "Clean up"
ssh lightstrip "
rm -rf server
mkdir -p server/dist
"
echo "Copy files"
scp package*.json 'lightstrip:server/'
scp systemd/light-server.service lightstrip:server/light-server.service
scp -r dist/src/ 'lightstrip:server/dist/src'
echo "Installing service"
ssh lightstrip "
cd server
npm ci --production
sudo cp -f light-server.service /etc/systemd/system/light-server.service
sudo systemctl daemon-reload
sudo service light-server start
sleep 2
systemctl is-active --quiet light-server && echo Service is running
"
echo "Done"
