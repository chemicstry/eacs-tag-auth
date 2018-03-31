/// <reference types="node" />
import { RPCNode } from 'modular-json-rpc';
import { Tag } from './Tag';
import { KeyProvider } from './KeyProvider';
interface TagAuthOptions {
    keyProvider: KeyProvider;
    rpc: RPCNode;
    initilizationPass: string;
}
declare class TagAuth {
    options: TagAuthOptions;
    keyProvider: KeyProvider;
    rpc: RPCNode;
    constructor(options: TagAuthOptions);
    TagTransceive(buf: Buffer): Promise<Buffer>;
    GetTag(tagInfoRPC: any): Tag;
    Authenticate(tagInfo: any): Promise<boolean>;
    InitializeKey(tagInfo: any, pass: string): Promise<boolean>;
}
export { TagAuthOptions, TagAuth };
