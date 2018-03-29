"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const Log_1 = require("./Log");
const modular_json_rpc_1 = require("modular-json-rpc");
const TagAuth_1 = require("./TagAuth");
const KeyProvider_1 = require("./KeyProvider");
const wss = new WebSocket.Server({ port: 3000 });
// Initial keying material used to derive keys
const IKM = Buffer.from('00102030405060708090A0B0B0A09080', 'hex');
// HKDF key provider
const keyProvider = new KeyProvider_1.HKDF(IKM, 'sha256', Buffer.from('tag-auth'));
wss.on('connection', (ws) => {
    Log_1.Log.info("index: New websocket connection");
    // Create RPC transport over websocket
    let transport = new modular_json_rpc_1.WSTransport(ws);
    // Create bidirectional RPC connection
    let node = new modular_json_rpc_1.RPCNode(transport);
    // Initialise tag authentication
    let tagAuth = new TagAuth_1.TagAuth(keyProvider, node);
});
process.on('unhandledRejection', (reason, p) => {
    Log_1.Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
