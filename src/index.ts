import * as WebSocket from 'ws';
import { Log } from './Log';
import { WSTransport, RPCNode } from 'modular-json-rpc';
import { TagAuth } from './TagAuth';
import { HKDF } from './KeyProvider';

const wss = new WebSocket.Server({ port: 3000 });

// Initial keying material used to derive keys
const IKM = Buffer.from('00102030405060708090A0B0B0A09080', 'hex');

// HKDF key provider
const keyProvider = new HKDF(IKM, 'sha256', Buffer.from('tag-auth'));

wss.on('connection', (ws: WebSocket) => {
    Log.info("index: New websocket connection");

    // Create RPC transport over websocket
    let transport = new WSTransport(ws);

    // Create bidirectional RPC connection
    let node = new RPCNode(transport);

    // Initialise tag authentication
    let tagAuth = new TagAuth(keyProvider, node);
});

process.on('unhandledRejection', (reason, p) => {
    Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
