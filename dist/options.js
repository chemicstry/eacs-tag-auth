"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        name: 'port',
        alias: 'p',
        type: Number,
        defaultValue: 3000,
        description: 'Port number of websocket'
    },
    {
        name: 'host',
        alias: 'h',
        type: String,
        defaultValue: '::',
        description: 'Host (IP) of websocket'
    },
    {
        name: 'hkdf_ikm',
        type: String,
        defaultValue: '00102030405060708090A0B0B0A09080',
        description: 'Initial keying material for HKDF key provider'
    },
    {
        name: 'hkdf_salt',
        type: String,
        defaultValue: 'RFIDService',
        description: 'Salt for HKDF key provider'
    },
    {
        name: 'jwtPublicKey',
        type: String,
        defaultValue: 'jwt.pem',
        description: 'Public key (in PEM format) used for JWT verification'
    },
    {
        name: 'help',
        type: Boolean,
        description: 'Prints usage information'
    }
];
