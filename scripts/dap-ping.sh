ssh lightstrip 'rm -rf dap-test/src'
scp package*.json 'lightstrip:dap-test/'
scp -r dist/src/ 'lightstrip:dap-test'
ssh lightstrip "
  sudo service light-server stop
  cd dap-test/src
  node dap-ping.js
"
