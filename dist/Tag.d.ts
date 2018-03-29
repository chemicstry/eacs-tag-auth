/// <reference types="node" />
import { KeyProvider } from './KeyProvider';
interface TagInfo {
    ATQA: [number, number];
    SAK: number;
    UID: Buffer;
    ATS: Buffer;
}
declare type TagTransceiveFn = (data: Buffer) => Promise<Buffer>;
declare class Tag {
    info: TagInfo;
    Transceive: TagTransceiveFn;
    constructor(info: TagInfo, transceiveFn: TagTransceiveFn);
    Authenticate(keyProvider: KeyProvider): Promise<boolean>;
    static Identify(info: TagInfo): boolean;
}
export { Tag, TagInfo, TagTransceiveFn };
