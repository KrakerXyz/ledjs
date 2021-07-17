
//Taken from https://github.com/Azure-Samples/azure-iot-samples-node/tree/master/iot-hub/Quickstarts/simulated-device-2

import { Client, Message } from 'azure-iot-device';
import type { DeviceMethodRequest, DeviceMethodResponse } from 'azure-iot-device';
import { MqttWs } from 'azure-iot-device-mqtt';
import { useAnimation } from './services/animationService';
import { Frame } from './color-utilities';
import rpio from 'rpio';

const connectionString = 'HostName=netled-iot-hub.azure-devices.net;DeviceId=raspi-fastled-1;SharedAccessKey=BDM/7c7Ga+CjzKf+PUV5i7zpuLBWVNE2eJdv4+/nuiY=';

console.log('Initializing IoT Hub');
const client = Client.fromConnectionString(connectionString, MqttWs);
client.open().then(v => {
    console.log('IoT Hub connected');
});

console.log('Initializing SPI');
rpio.spiBegin();
rpio.spiSetClockDivider(100);

const rpioDraw = (frame: Frame) => {

    const buffer = Buffer.alloc((frame.length * 4) + 1, '00000000', 'hex');

    for (let i = 0; i < frame.length; i++) {

        const buffPos = (i * 4) + 1; //We add in 1 to account for the leading reset byte

        buffer[buffPos] = 224 + 4; //Brightness
        buffer[buffPos + 1] = frame[i][2]; //B
        buffer[buffPos + 2] = frame[i][1]; //G
        buffer[buffPos + 3] = frame[i][0]; //R

    }

    rpio.spiWrite(buffer, buffer.length);

}

const animation = useAnimation('Rainbow');
animation.setNumLeds(8);

let intervalTimeout: NodeJS.Timeout | null = null;

const startAnimation = (interval: number) => {
    console.log(`Changing animation interval to ${interval}ms`);
    if (intervalTimeout) { clearInterval(intervalTimeout); }
    intervalTimeout = setInterval(() => {

        const frame = animation.nextFrame();
        rpioDraw(frame);

    }, interval);
}
startAnimation(50);


/*

// Timeout created by setInterval
let intervalLoop: NodeJS.Timeout | null = null;

// Function to handle the SetTelemetryInterval direct method call from IoT hub
function onSetTelemetryInterval(request: DeviceMethodRequest, response: DeviceMethodResponse) {
    // Function to send a direct method response to your IoT hub.

    function directMethodResponse(err?: Error) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    }

    console.log('Direct method payload received:');
    console.log(request.payload);

    // Check that a numeric value was passed as a parameter
    if (isNaN(request.payload)) {
        console.log('Invalid interval response received in payload');
        // Report failure back to your hub.
        response.send(400, 'Invalid direct method parameter: ' + request.payload, directMethodResponse);

    } else {

        // Reset the interval timer
        if (intervalLoop) { clearInterval(intervalLoop); }
        intervalLoop = setInterval(sendMessage, request.payload * 1000);

        // Report success back to your hub.
        response.send(200, 'Telemetry interval set: ' + request.payload, directMethodResponse);
    }
}

// Send a telemetry message to your hub
function sendMessage() {
    // Simulate telemetry.
    var temperature = 20 + (Math.random() * 15);
    var message = new Message(JSON.stringify({
        temperature: temperature,
        humidity: 60 + (Math.random() * 20)
    }));

    // Add a custom application property to the message.
    // An IoT hub can filter on these properties without access to the message body.
    message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');

    console.log('Sending message: ' + message.getData());

    // Send the message.
    client.sendEvent(message, function (err) {
        if (err) {
            console.error('send error: ' + err.toString());
        } else {
            console.log('message sent');
        }
    });
}

// Set up the handler for the SetTelemetryInterval direct method call.
client.onDeviceMethod('SetTelemetryInterval', onSetTelemetryInterval);

// Create a message and send it to the IoT hub, initially every second.
intervalLoop = setInterval(sendMessage, 10000);

*/