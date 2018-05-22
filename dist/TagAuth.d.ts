/// <reference types="node" />
import { RPCNode } from 'modular-json-rpc';
import { Tag } from './Tag';
import { KeyProvider } from './KeyProvider';
import { EACSToken } from 'eacs-socket';
interface TagAuthOptions {
    keyProvider: KeyProvider;
    rpc: RPCNode;
    token: EACSToken;
}
declare class TagAuth {
    options: TagAuthOptions;
    token: EACSToken;
    keyProvider: KeyProvider;
    rpc: RPCNode;
    constructor(options: TagAuthOptions);
    TagTransceive(buf: Buffer): Promise<Buffer>;
    GetTag(tagInfoRPC: any): Tag;
    Authenticate(tagInfo: any): Promise<boolean>;
    InitializeKey(tagInfo: any, pass: string): Promise<boolean>;
}
export { TagAuthOptions, TagAuth };
