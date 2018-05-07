import commandLineArgs = require('command-line-args');
import commandLineUsage = require('command-line-usage');
import optionDefinitions from './options';
import * as WebSocket from 'ws';
import { EACSSocket, EACSToken } from 'eacs-socket';
import { readFileSync } from 'fs';
import { IncomingMessage } from 'http';
import { WSTransport, RPCNode } from 'modular-json-rpc';
import { Log } from './Log';
import { TagAuth } from './TagAuth';
import { HKDF } from './KeyProvider';


// Options
const options = commandLineArgs(optionDefinitions);

// Print usage
if (options.help)
{
    const sections = [
        {
            header: 'eacs-tag-auth',
            content: 'Extensible Access Control System. RFID Tag Authentication Module.'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ];

    console.log(commandLineUsage(sections));
    process.exit();
}

// Initial keying material used to derive keys
const IKM = Buffer.from(options.hkdf_ikm, 'hex');

// HKDF key provider
const keyProvider = new HKDF(IKM, 'sha256', Buffer.from(options.hkdf_salt));

// Load JWT public key
const jwtPublicKey: string = readFileSync(options.jwtPublicKey, "utf8");

// Setup EACSSocket (websockets with JWT auth)
const socket = new EACSSocket({
    host: options.host,
    port: options.port,
    jwtPubKey: jwtPublicKey
});

socket.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    let token = <EACSToken>(<any>req).token;

    Log.info(`index: New connection from ${req.connection.remoteAddress}. Identifier: ${token.identifier}`);

    // Create RPC transport over websocket
    let transport = new WSTransport(ws);

    // Create bidirectional RPC connection
    let node = new RPCNode(transport);

    // Handle error
    node.on('error', (e) => {
        Log.error("Internal JSONRPC Error", e);
    });
    ws.on('error', (e) => {
        Log.error("WebSocket Error", e);
    });

    // Initialise tag authentication
    let tagAuth = new TagAuth({
        keyProvider,
        rpc: node,
        token: token
    });
});

process.on('unhandledRejection', (reason, p) => {
    Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
