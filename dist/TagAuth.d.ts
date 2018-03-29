/// <reference types="node" />
import { RPCNode } from 'modular-json-rpc';
import { KeyProvider } from './KeyProvider';
declare class TagAuth {
    keyProvider: KeyProvider;
    rpc: RPCNode;
    constructor(keyProvider: KeyProvider, rpc: RPCNode);
    TagTransceive(buf: Buffer): Promise<Buffer>;
    Authenticate(args: any): Promise<boolean>;
}
export { TagAuth };
