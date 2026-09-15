import type { URI } from '../../../../Core/Module/String_DLL/URI';
import type { DelegateEvent } from 'sumi-tsextension';
import type { IFileSystem, TypeStat, TypeWatchOptions } from './IFileSystem';
import type { EMFileChange } from './Enum/EMFileChange';

export const enum EMFileOperation
{
    Move = 1,
    Copy = 2,
    Delete = 3,
    Create = 4
}

export interface IFileOperationEvent
{
    get Operation(): EMFileOperation;
    get Source(): URI | null;
    get Target(): URI;
}

export default interface IServiceFile
{
    /** 文件操作完成事件（move/copy/delete/create） */
    get DFileOperation(): DelegateEvent<(event: IFileOperationEvent) => void>;
    /** 注册文件系统 */
    RegisterFileSystem(scheme: string, fileSystem: IFileSystem): void;
    /** 获取文件系统 */
    GetFileSystem(scheme: string): IFileSystem | null;
    /** 判断路径是否存在 */
    Exists(uri: URI): Promise<boolean>;
    /** 获取文件信息 */
    Stat(uri: URI): Promise<TypeStat>;
    /** 删除文件 */
    RM(uri: URI): Promise<void>;
    /** 删除文件夹 */
    RMDir(uri: URI): Promise<void>;
    /** 创建文件夹 */
    MKDir(uri: URI): Promise<void>;
    /** 复制文件 */
    CopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>;
    CanCopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<boolean>;
    /** 移动文件 */
    Move(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>;
    CanMove(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<boolean>;
    /** 读取文件夹 */
    ReadDir(uri: URI): Promise<string[]>;
    /** 读取文件 */
    ReadFile(uri: URI): Promise<Uint8Array | null>;
    /** 写入文件 */
    WriteFile(uri: URI, data: SharedArrayBuffer | string): Promise<void>;
    /** 创建文件 */
    CreateFile(uri: URI, data?: SharedArrayBuffer | string): Promise<void>;
    CanCreateFile(uri: URI, overwrite?: boolean): Promise<boolean>;
    /** 监听文件夹更改事件 */
    Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>;
    /** 监听文件更改事件 */
    WatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>;
    /** 取消监听文件夹更改事件 */
    UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): void;
    /** 取消监听文件更改事件 */
    UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): void;
}