/// <reference types="node" />
import { Tag, TagInfo } from '../..//Tag';
import { KeyProvider } from '../../KeyProvider';
import { DesfireKey } from './DesfireKey';
declare class DesfireTag extends Tag {
    Connected: boolean;
    AuthenticatedKeyNo: number;
    SessionKey: DesfireKey;
    SelectedApplication: number;
    static Identify(info: TagInfo): boolean;
    DesfireTransceive(instruction: number, data: Buffer, CLA?: number, P1?: number, P2?: number): Promise<Buffer>;
    Connect(): Promise<boolean>;
    DesfireAuthenticate(key: DesfireKey, keyno?: number): Promise<boolean>;
    ChangeKey(keyno: number, key: DesfireKey): Promise<boolean>;
    Authenticate(keyProvider: KeyProvider): Promise<boolean>;
    static DesfireCRC(crc: number, value: number): number;
}
export default DesfireTag;
