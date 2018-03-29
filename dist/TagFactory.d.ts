import { Tag, TagInfo } from './Tag';
declare class TagFactory {
    static Tags: typeof Tag[];
    static Identify(info: TagInfo): typeof Tag;
    static Register(classname: typeof Tag): void;
    static InitializeTypes(): void;
}
export { TagFactory };
