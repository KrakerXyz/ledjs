
//Taken from https://github.com/Azure-Samples/azure-iot-samples-node/tree/master/iot-hub/Quickstarts/simulated-device-2

import { Client, Message } from 'azure-iot-device';
import { MqttWs } from 'azure-iot-device-mqtt';
import { useAnimation } from './services/animationService';
import { Leds } from './services/Leds';
import { AnimationConfig } from 'src/core';

const connectionString = 'HostName=netled-iot-hub.azure-devices.net;DeviceId=raspi-fastled-1;SharedAccessKey=BDM/7c7Ga+CjzKf+PUV5i7zpuLBWVNE2eJdv4+/nuiY=';

let lastAnimationName = 'Rainbow';
let animation = useAnimation(lastAnimationName);
animation.setNumLeds(8);

const leds = new Leds();
leds.setAnimation(animation);
leds.setInterval(50);

console.log('Initializing IoT Hub');
const client = Client.fromConnectionString(connectionString, MqttWs);
client.open().then(v => {
    console.log('IoT Hub: Connected');
});

client.onDeviceMethod('setAnimation', (request, response) => {
    console.log('Incoming IoT: setAnimation');
    console.debug(`Payload: ${JSON.stringify(request.payload)}`);

    const animationConfig: AnimationConfig = request.payload;

    if (animationConfig.animationName && animationConfig.animationName !== lastAnimationName) {
        animation = useAnimation(animationConfig.animationName);
        leds.setAnimation(animation);
        lastAnimationName = animationConfig.animationName;
    }

    if (animationConfig.animationConfig) {
        animation.setConfig(animationConfig.animationConfig);
    }

    animation.setNumLeds(animationConfig.numLeds);

    leds.setInterval(animationConfig.numLeds);


    response.send(200);
});

client.sendEvent(new Message('Connect')).then(() => console.log('IoT Event Sent: Connected'));



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