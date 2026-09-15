import type { URI } from '../../../../Core/Module/String_DLL/URI';
import type { EMFileChange } from './Enum/EMFileChange';

export const enum FileOperationResult {
	FILE_IS_DIRECTORY,
	FILE_NOT_FOUND,
	FILE_NOT_MODIFIED_SINCE,
	FILE_MODIFIED_SINCE,
	FILE_MOVE_CONFLICT,
	FILE_WRITE_LOCKED,
	FILE_PERMISSION_DENIED,
	FILE_TOO_LARGE,
	FILE_INVALID_PATH,
	FILE_NOT_DIRECTORY,
	FILE_OTHER_ERROR
}

export enum FileSystemErrorCode
{
	FileExists = 'EntryExists',
	FileNotFound = 'EntryNotFound',
	FileNotADirectory = 'EntryNotADirectory',
	FileIsADirectory = 'EntryIsADirectory',
	FileExceedsStorageQuota = 'EntryExceedsStorageQuota',
	FileTooLarge = 'EntryTooLarge',
	FileWriteLocked = 'EntryWriteLocked',
	NoPermissions = 'NoPermissions',
	Unavailable = 'Unavailable',
	Unknown = 'Unknown'
}

export interface IBaseFileStat {

	/**
	 * The unified resource identifier of this file or folder.
	 */
	readonly resource: URI;

	/**
	 * The name which is the last segment
	 * of the {{path}}.
	 */
	readonly name: string;

	/**
	 * The size of the file.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	readonly size?: number;

	/**
	 * The last modification date represented as millis from unix epoch.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	readonly mtime?: number;

	/**
	 * The creation date represented as millis from unix epoch.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	readonly ctime?: number;

	/**
	 * A unique identifier that represents the
	 * current state of the file or directory.
	 *
	 * The value may or may not be resolved as
	 * it is optional.
	 */
	readonly etag?: string;

	/**
	 * File is readonly. Components like editors should not
	 * offer to edit the contents.
	 */
	readonly readonly?: boolean;

	/**
	 * File is locked. Components like editors should offer
	 * to edit the contents and ask the user upon saving to
	 * remove the lock.
	 */
	readonly locked?: boolean;
}


/**
 * A file resource with meta information and resolved children if any.
 */
export interface IFileStat extends IBaseFileStat {

	/**
	 * The resource is a file.
	 */
	readonly isFile: boolean;

	/**
	 * The resource is a directory.
	 */
	readonly isDirectory: boolean;

	/**
	 * The resource is a symbolic link. Note: even when the
	 * file is a symbolic link, you can test for `FileType.File`
	 * and `FileType.Directory` to know the type of the target
	 * the link points to.
	 */
	readonly isSymbolicLink: boolean;

	/**
	 * The children of the file stat or undefined if none.
	 */
	children: IFileStat[] | undefined;
}

export interface IBaseFileStatWithMetadata extends Required<IBaseFileStat> { }

export interface IFileStatWithMetadata extends IFileStat, IBaseFileStatWithMetadata {
	readonly mtime: number;
	readonly ctime: number;
	readonly etag: string;
	readonly size: number;
	readonly readonly: boolean;
	readonly locked: boolean;
	readonly children: IFileStatWithMetadata[] | undefined;
}


export interface IFileReadLimits {
	/**
	 * If the file exceeds the given size, an error of kind
	 * `FILE_TOO_LARGE` will be thrown.
	 */
	size?: number;
}

export interface IFileReadStreamOptions {

	/**
	 * Is an integer specifying where to begin reading from in the file. If position is undefined,
	 * data will be read from the current file position.
	 */
	readonly position?: number;

	/**
	 * Is an integer specifying how many bytes to read from the file. By default, all bytes
	 * will be read.
	 */
	readonly length?: number;

	/**
	 * If provided, the size of the file will be checked against the limits
	 * and an error will be thrown if any limit is exceeded.
	 */
	readonly limits?: IFileReadLimits;
}


export interface IBaseReadFileOptions extends IFileReadStreamOptions {

	/**
	 * The optional etag parameter allows to return early from resolving the resource if
	 * the contents on disk match the etag. This prevents accumulated reading of resources
	 * that have been read already with the same etag.
	 * It is the task of the caller to makes sure to handle this error case from the promise.
	 */
	readonly etag?: string;
}

export interface IReadFileStreamOptions extends IBaseReadFileOptions { }

export interface IReadFileOptions extends IBaseReadFileOptions {

	/**
	 * The optional `atomic` flag can be used to make sure
	 * the `readFile` method is not running in parallel with
	 * any `write` operations in the same process.
	 *
	 * Typically you should not need to use this flag but if
	 * for example you are quickly reading a file right after
	 * a file event occurred and the file changes a lot, there
	 * is a chance that a read returns an empty or partial file
	 * because a pending write has not finished yet.
	 *
	 * Note: this does not prevent the file from being written
	 * to from a different process. If you need such atomic
	 * operations, you better use a real database as storage.
	 */
	readonly atomic?: boolean;
}

export interface IWriteFileOptions {

	/**
	 * The last known modification time of the file. This can be used to prevent dirty writes.
	 */
	readonly mtime?: number;

	/**
	 * The etag of the file. This can be used to prevent dirty writes.
	 */
	readonly etag?: string;

	/**
	 * Whether to attempt to unlock a file before writing.
	 */
	readonly unlock?: boolean;

	/**
	 * The optional `atomic` flag can be used to make sure
	 * the `writeFile` method updates the target file atomically
	 * by first writing to a temporary file in the same folder
	 * and then renaming it over the target.
	 */
	readonly atomic?: TypeFileAtomicOptions | false;
}

export interface IResolveFileOptions {

	/**
	 * Automatically continue resolving children of a directory until the provided resources
	 * are found.
	 */
	readonly resolveTo?: readonly URI[];

	/**
	 * Automatically continue resolving children of a directory if the number of children is 1.
	 */
	readonly resolveSingleChildDescendants?: boolean;

	/**
	 * Will resolve mtime, ctime, size and etag of files if enabled. This can have a negative impact
	 * on performance and thus should only be used when these values are required.
	 */
	readonly resolveMetadata?: boolean;
}

export interface IResolveMetadataFileOptions extends IResolveFileOptions {
	readonly resolveMetadata: true;
}

export type TypeFileAtomicOptions = {

	/**
	 * The postfix is used to create a temporary file based
	 * on the original resource. The resulting temporary
	 * file will be in the same folder as the resource and
	 * have `postfix` appended to the resource name.
	 *
	 * Example: given a file resource `file:///some/path/foo.txt`
	 * and a postfix `.vsctmp`, the temporary file will be
	 * created as `file:///some/path/foo.txt.vsctmp`.
	 */
	readonly postfix: string;
}

export type TypeFileDeleteOptions = {

	/**
	 * Set to `true` to recursively delete any children of the file. This
	 * only applies to folders and can lead to an error unless provided
	 * if the folder is not empty.
	 */
	readonly recursive: boolean;

	/**
	 * Set to `true` to attempt to move the file to trash
	 * instead of deleting it permanently from disk.
	 *
	 * This option maybe not be supported on all providers.
	 */
	readonly useTrash: boolean;

	/**
	 * The optional `atomic` flag can be used to make sure
	 * the `delete` method deletes the target atomically by
	 * first renaming it to a temporary resource in the same
	 * folder and then deleting it.
	 *
	 * This option maybe not be supported on all providers.
	 */
	readonly atomic: TypeFileAtomicOptions | false;
}

export enum EMFileType
{

	/**
	 * File is unknown (neither file, directory nor symbolic link).
	 */
	Unknown = 0,

	/**
	 * File is a normal file.
	 */
	File = 1,

	/**
	 * File is a directory.
	 */
	Directory = 2,

	/**
	 * File is a symbolic link.
	 *
	 * Note: even when the file is a symbolic link, you can test for
	 * `FileType.File` and `FileType.Directory` to know the type of
	 * the target the link points to.
	 */
	SymbolicLink = 64
}


export enum EMFilePermission {

	/**
	 * File is readonly. Components like editors should not
	 * offer to edit the contents.
	 */
	Readonly = 1,

	/**
	 * File is locked. Components like editors should offer
	 * to edit the contents and ask the user upon saving to
	 * remove the lock.
	 */
	Locked = 2
}


export type TypeStat = {

	/**
	 * The file type.
	 */
	readonly type: EMFileType;

	/**
	 * The last modification date represented as millis from unix epoch.
	 */
	readonly mtime: number;

	/**
	 * The creation date represented as millis from unix epoch.
	 */
	readonly ctime: number;

	/**
	 * The size of the file in bytes.
	 */
	readonly size: number;

	/**
	 * The file permissions.
	 */
	readonly permissions?: EMFilePermission;
}

export interface TypeFileOverwriteOptions {

	/**
	 * Set to `true` to overwrite a file if it exists. Will
	 * throw an error otherwise if the file does exist.
	 */
	readonly overwrite: boolean;
}

export type TypeWatchOptions = {
    /** 设置为 `true` 以递归地监视文件夹及其所有子项的变化。 */
    recursive?: boolean;
    /**
    * 一组要从监视中排除的全局模式或路径。
    * 路径可以是相对路径或绝对路径，相对路径会相对于被监视的文件夹进行解析。
    * 全局模式总是相对于被监视的文件夹进行匹配。
     */
    excludes?: string[];
    /**
    * 可选的一组 glob 模式或路径，用于监视。如果未提供，则所有路径都会被视为事件的监视对象。
    * 路径可以是相对路径或绝对路径，若为相对路径，则相对于被监视的文件夹进行解析。Glob 模式始终相对于被监视的文件夹进行匹配。
     */
    includes?: Array<string | TypeRelativePattern>;
    /** 允许过滤观察者应考虑用于触发的事件。如果未提供，则所有事件都会被触发 */
    filter?: Array<EMFileChangeFilter>;
}

export type TypeRelativePattern = {

    /**
     * A base file path to which this pattern will be matched against relatively.
     */
    readonly base: string;

    /**
     * A file glob pattern like `*.{ts,js}` that will be matched on file paths
     * relative to the base path.
     *
     * Example: Given a base of `/home/work/folder` and a file path of `/home/work/folder/index.js`,
     * the file glob pattern will match on `index.js`.
     */
    readonly pattern: string;
}

export const enum EMFileChangeFilter
{
    Created = 1,
    Change = 2,
    Deleted = 3,
    Rename = 4
}

export interface IFileSystem
{
	/** 获取文件信息 */
    Stat(uri: URI): Promise<TypeStat>;
    /** 判断路径是否存在 */
    Exists(uri: URI): Promise<boolean>;
    /** 删除文件 */
    RM(uri: URI): Promise<void>;
    /** 删除文件夹 */
    RMDir(uri: URI): Promise<void>;
    /** 创建文件夹 */
    MKDir(uri: URI): Promise<void>;
    /** 复制文件 */
    CopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>;
    /** 读取文件夹 */
    ReadDir(uri: URI): Promise<string[]>;
    /** 读取文件 */
    ReadFile(uri: URI): Promise<Uint8Array>;
    /** 写入文件 */
    WriteFile(uri: URI, data: SharedArrayBuffer | Uint8Array | string): Promise<void>;
	Move(from: URI, to: URI, opts: TypeFileOverwriteOptions): Promise<void>;
     /** 监听文件夹更改事件 */
    Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>;
    /** 监听文件更改事件 */
    WatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>;
    /** 取消监听文件夹更改事件 */
    UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): void;
    /** 取消监听文件更改事件 */
    UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): void;
}