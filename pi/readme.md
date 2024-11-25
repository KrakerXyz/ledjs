
# Updating OS
```
sudo apt update
sudo apt full-upgrade
```

# Install Node (64b)
taken from https://gist.github.com/stonehippo/f4ef8446226101e8bed3e07a58ea512a
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

# Install Node (old 32b devices)
```
sudo wget -O - https://raw.githubusercontent.com/HaroldPetersInskipp/Raspberry-Pi-Scripts/main/Armv6lNode16.16.0.sh | bash
```

# Create service
```
sudo nano /etc/systemd/system/netled.service
```
```
[Unit]
Description=netled connection
After=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=on-failure
RestartSec=2
User=pi
ExecStart=sudo npx --yes netled-device-pi --host https://netled.io -auto [base64 deviceId:secret]

[Install]
WantedBy=multi-user.target
```

Start it
```
sudo systemctl start netled.service
```

Enable for startup
```
sudo systemctl enable netled.service
```

Restart
```
sudo systemctl restart netled.service
```


# Testing isolated-vm
```ts
import Isolate from 'isolated-vm';
import { netledGlobal } from '../../core/src/netledGlobal.js';

const cjsScriptParts = [
    `const netled = { animation: { ${netledGlobal.animation.defineAnimation.toString()} }};`,
    seg.js.replace('export default', 'const cls =') + ';\n'
] 

const cjsScript = cjsScriptParts.join('\n');

logger.info('Loading isolate');
const isolate = new Isolate.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();

const script = await isolate.compileScript(cjsScript);
script.runSync(context);

const services = context.evalSync('JSON.stringify(cls.services)');
console.log(services);
```