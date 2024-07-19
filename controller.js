// import {TuyaContext} from '@tuya/tuya-connector-nodejs';
// const t = require('tuya-cloud-sdk');
const {TuyaContext} = require('@tuya/tuya-connector-nodejs');

const tuya = new TuyaContext({
    baseUrl: 'https://openapi.tuyaeu.com',
    accessKey: process.env.OAUTH_CLIENT_ID,
    secretKey: process.env.OAUTH_CLIENT_SECRET,
});

module.exports = {
    async switchDevice(switchId, state) {
        return await tuya.request({
            method: 'POST',
            path: '/v1.0/iot-03/devices/bf5bbfd7dadcacda790o1m/commands',
            body: {
                "commands": [{"code": switchId, "value": state}]
            },
        });
    }
}
