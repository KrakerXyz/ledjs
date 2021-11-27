
# Installation / Running
```
sudo npm install -g @krakerxyz/netled-raspi
sudo netled -i [clientId] -s [clientSecret]
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
ExecStart=sudo netled -i [clientId] -s [clientSecret]

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