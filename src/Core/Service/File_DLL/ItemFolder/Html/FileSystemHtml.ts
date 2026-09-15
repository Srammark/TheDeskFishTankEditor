import { URI } from '../../../../../Core/Module/String_DLL/URI';
import type { IFileSystem, TypeFileOverwriteOptions, TypeStat, TypeWatchOptions } from '../../../../../Core/IOC_DLL/Interface/File/IFileSystem';
import { EMFileType, EMFilePermission } from '../../../../../Core/IOC_DLL/Interface/File/IFileSystem';
import Path from '../../../../../Core/Module/String_DLL/Path';
import { Schemas } from '../../../../../Core/Module/String_DLL/Schemas';
import PlatformInfo from '../../../../../Core/Module/Platform_DLL/PlatformInfo';
import { extUri, extUriIgnorePathCase } from '../../../../../Core/Module/String_DLL/ExtUri';
import type { FileSystemObserverRecord } from './WebFileSystemAccess';
import { Delegate } from 'sumi-tsextension';
import IOC from '../../../../../Core/IOC_DLL/IOC';
import type IServiceLog from '../../../../../Core/IOC_DLL/Interface/Log/IServiceLog';
import Sym from '../../../../../Core/IOC_DLL/Sym';
import { EMFileChange } from '../../../../../Core/IOC_DLL/Interface/File/Enum/EMFileChange';

export default class FileSystemHtml implements IFileSystem
{
    private fileHandleMap = new Map<string, FileSystemFileHandle>();
    private directoryHandleMap = new Map<string, FileSystemDirectoryHandle>();
    private extUri = PlatformInfo.IsLinux ? extUri : extUriIgnorePathCase;
    public get DirectoryHandleValues(): Iterable<FileSystemDirectoryHandle> { return this.directoryHandleMap.values(); }
    
    // 监听器 - 使用 URI 字符串作为 key，避免对象引用问题
    private observerMap = new Map<string, any>();
    private delegateWatchMap = new Map<string, Delegate<(e: EMFileChange, filename: string) => void>>();
    private delegateWatchFileMap = new Map<string, Delegate<(e: EMFileChange) => void>>();

    /**
     * 核心辅助方法：验证并请求读写权限
     * 必须在任何写入操作(创建、写入、删除)之前调用
     */
    private async VerifyPermission(handle: FileSystemHandle, readWrite: boolean): Promise<void>
    {
        const options: any = {
            mode: readWrite ? 'readwrite' : 'read'
        };

        try {
            // 1. 查询当前权限状态
            if ((await handle.queryPermission(options)) === 'granted')
            {
                return;
            }

            // 2. 如果未授予，则请求权限
            if ((await handle.requestPermission(options)) !== 'granted')
            {
                throw new Error(`用户拒绝了对 ${handle.name} 的${readWrite ? '写入' : '读取'}权限`);
            }
        } catch (e) {
            // 某些环境下 queryPermission 可能报错，直接尝试继续或抛出
            IOC.Get<IServiceLog>(Sym.ServiceLog).Warn("Permission check failed:", e);
        }
    }

    /**
     * 核心路径解析方法：从根目录开始，逐级查找父目录句柄和目标名称
     * 自动处理路径分隔符标准化，防止文件名包含 "\" 导致的错误
     */
    private async ResolvePathToParent(uri: URI): Promise<{ parentHandle: FileSystemDirectoryHandle, name: string } | undefined>
    {
        const rootInfo = this.GetRootHandle(uri);
        if (!!rootInfo === false)
        {
            // throw new Error(`未找到路径对应的根目录: ${uri.ToString()}`);
            return undefined;
        }

        const { rootUri, handle: rootHandle } = rootInfo;

        // 计算相对路径
        let relativePath = this.extUri.RelativePath(rootUri, uri);
        
        // 如果相对路径为空字符串，说明 targetUri 就是 rootUri
        if (!relativePath && relativePath !== '')
        {
            // 如果 relativePath 是 undefined/null，说明路径不匹配
            //  throw new Error(`路径解析失败: ${uri.ToString()} (Root: ${rootUri.ToString()})`);
            return undefined;
        }

        // 关键修复：标准化路径分隔符
        relativePath = relativePath ? relativePath.replace(/\\/g, '/') : "";

        // 如果路径为空，说明试图操作根目录本身（例如作为文件写入），这是不允许的
        if (relativePath === '')
        {
            // throw new Error(`无法获取根目录的父级 (操作对象为根目录本身): ${uri.ToString()}`);
            return undefined;
        }

        // 拆分路径
        const parts = relativePath.split('/').filter(p => p.length > 0);
        const name = parts.pop(); // 最后一个部分是文件名或目标目录名

        if (!name)
        {
            // throw new Error(`无效的路径名称: ${uri.ToString()}`);
            return undefined;
        }

        // 逐级查找父目录句柄
        let currentHandle = rootHandle;

        for (const dirName of parts)
        {
            try
            {
                // 仅获取，不创建
                currentHandle = await currentHandle.getDirectoryHandle(dirName);
            }
            catch (err)
            {
                // throw new Error(`父目录不存在: ${dirName} (路径: ${relativePath})`);
                return undefined;
            }
        }

        return { parentHandle: currentHandle, name: name };
    }

    public RegisterFileHandle(fileHandle: FileSystemFileHandle): Promise<URI>
    {
        return this.RegisterHandle(fileHandle, this.fileHandleMap);
    }

    public RegisterDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<URI>
    {
        return this.RegisterHandle(handle, this.directoryHandleMap);
    }

    public async Stat(uri: URI): Promise<TypeStat>
    {
        const handle = await this.GetHandle(uri);
        if (!handle)
        {
            throw new Error(`File not found: ${uri.ToString()}`);
        }

        if (handle.kind === 'file')
        {
            const fileHandle = handle as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            return {
                type: EMFileType.File,
                size: file.size,
                mtime: file.lastModified,
                ctime: file.lastModified,
                permissions: EMFilePermission.Readonly
            };
        }
        else
        {
            return {
                type: EMFileType.Directory,
                size: 0,
                mtime: Date.now(),
                ctime: Date.now()
            };
        }
    }

    public async Exists(uri: URI): Promise<boolean>
    {
        const handle = await this.GetHandle(uri);
        return !!handle;
    }

    public async RM(uri: URI): Promise<void>
    {
        try
        {
            const parent = await this.ResolvePathToParent(uri);
            if (parent === undefined)
            {
                return;
            }
            
            await this.VerifyPermission(parent.parentHandle, true);
            await parent.parentHandle.removeEntry(parent.name);
        }
        catch (error)
        {
            throw new Error(`删除失败 ${uri.ToString()}: ${error}`);
        }
    }

    public async RMDir(uri: URI): Promise<void>
    {
        try
        {
            const parent = await this.ResolvePathToParent(uri);
            if (parent === undefined)
            {
                return;
            }
            
            await this.VerifyPermission(parent.parentHandle, true);
            await parent.parentHandle.removeEntry(parent.name, { recursive: true });
        }
        catch (error)
        {
            throw new Error(`删除目录失败 ${uri.ToString()}: ${error}`);
        }
    }

    public async MKDir(targetUri: URI): Promise<void>
    {
        const rootInfo = this.GetRootHandle(targetUri);
        if (!rootInfo)
        {
            throw new Error(`无法创建目录: 找不到路径 ${targetUri.ToString()} 对应的根目录句柄`);
        }

        const { rootUri, handle: rootHandle } = rootInfo;

        let relativePath = this.extUri.RelativePath(rootUri, targetUri);
        if (!relativePath) return;

        relativePath = relativePath.replace(/\\/g, '/');

        const parts = relativePath.split('/').filter(p => p.length > 0);
        let currentHandle = rootHandle;

        for (const part of parts)
        {
            try
            {
                await this.VerifyPermission(currentHandle, true);
                currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
            }
            catch (err)
            {
                throw new Error(`创建目录失败: ${part} (完整路径: ${relativePath}) - ${err}`);
            }
        }
    }

    public async CopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>
    {
        const sourceHandle = await this.GetFileHandle(fromUri);
        if (!!sourceHandle === false)
        {
            throw new Error(`源文件不存在: ${fromUri.ToString()}`);
        }

        const exists = await this.Exists(toUri);
        if (exists && !overwrite) throw new Error(`目标文件已存在: ${toUri.ToString()}`);

        const file = await sourceHandle.getFile();
        const buffer = await file.arrayBuffer();

        await this.WriteFile(toUri, new Uint8Array(buffer));
    }

    public async ReadDir(uri: URI): Promise<string[]>
    {
        const handle = await this.GetDirectoryHandle(uri);
        if (!!handle === false)
        {
            throw new Error(`目录不存在: ${uri.ToString()}`);
        }

        const result: string[] = [];
        // @ts-ignore
        for await (const entry of handle.values())
        {
            result.push(entry.name);
        }
        return result;
    }

    public async ReadFile(uri: URI): Promise<Uint8Array>
    {
        try
        {
            let fileHandle = await this.GetFileHandle(uri);
            if (fileHandle === undefined)
            {
                throw new Error(`读取文件失败 ${uri.ToString()}: 没有权限或文件不存在`);
            }

            const file = await fileHandle.getFile();
            return new Uint8Array(await file.arrayBuffer());
        }
        catch (error)
        {
            const directHandle = this.GetHandleByUri(uri);
            if (directHandle && directHandle.kind === 'file')
            {
                const file = await (directHandle as FileSystemFileHandle).getFile();
                return new Uint8Array(await file.arrayBuffer());
            }
            throw new Error(`读取文件失败 ${uri.ToString()}: ${error}`);
        }
    }

    public async WriteFile(uri: URI, data: SharedArrayBuffer | Buffer | string | Uint8Array): Promise<void>
    {
        try
        {
            let fileHandle = await this.GetFileHandle(uri);
            if (fileHandle === undefined)
            {
                throw new Error(`读取文件失败 ${uri.ToString()}: 没有权限或文件不存在`);
            }
           
            const writable = await fileHandle.createWritable();
    
            if (typeof data === 'string')
            {
                await writable.write(data);
            }
            else if (data instanceof SharedArrayBuffer)
            {
                const tempBuffer = new Uint8Array(data.byteLength);
                tempBuffer.set(new Uint8Array(data));
                await writable.write(tempBuffer);
            }
            else
            {
                const tempBuffer = new Uint8Array(data.byteLength);
                tempBuffer.set(data as Uint8Array);
                await writable.write(tempBuffer);
            }

            await writable.close();
        }
        catch (error)
        {
            throw new Error(`写入文件失败 ${uri.ToString()}: ${error}`);
        }
    }

    public async Move(from: URI, to: URI, opts: TypeFileOverwriteOptions): Promise<void>
    {
        const sourceHandle = await this.GetHandle(from);
        if (!!sourceHandle === false)
        {
            throw new Error(`源文件不存在: ${from.ToString()}`);
        }

        const targetExists = await this.Exists(to);
        if (targetExists && !opts.overwrite)
        {
            throw new Error(`目标路径已存在: ${to.ToString()}`);
        }

        if (typeof (sourceHandle as any).move === 'function')
        {
            try
            {
                const parent = await this.ResolvePathToParent(to);
                if (parent == null)
                {
                    return;
                }

                await this.VerifyPermission(sourceHandle, true);
                await this.VerifyPermission(parent.parentHandle, true);
                await (sourceHandle as any).move(parent.parentHandle, parent.name);
                return;
            }
            catch (e)
            {

            }
        }

        if (sourceHandle.kind === 'file')
        {
            await this.CopyFile(from, to, opts.overwrite);
            await this.RM(from);
        }
        else
        {
            throw new Error('当前浏览器不支持文件夹重命名 (缺少 move API)');
        }
    }

    public async Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>
    {
        const uriKey = this.extUri.GetComparisonKey(uri, true);

        if (this.observerMap.has(uriKey))
        {
            this.delegateWatchMap.get(uriKey)?.Add(listener);
            return;
        }

        const handle = await this.GetHandle(uri);
        if (!handle)
        {
            return;
        }

        if (typeof (globalThis as any).FileSystemObserver === 'undefined')
        {
            return;
        }

        const observer = new (globalThis as any).FileSystemObserver((records: FileSystemObserverRecord[]) =>
        {
            for (const record of records)
            {
                const path = record.relativePathComponents.join('/');
                let fileChangeType: EMFileChange;
                // "appeared" | "disappeared" | "modified" | "moved" | "unknown" | "errored"
                switch (record.type)
                {
                    case 'appeared':
                        fileChangeType = EMFileChange.Created;
                        break;
                    case 'disappeared':
                        fileChangeType = EMFileChange.Deleted;
                        break;
                    case 'modified':
                        fileChangeType = EMFileChange.Changed;
                        break;
                    case 'moved':
                        fileChangeType = EMFileChange.Renamed;
                        break;
                    case 'unknown':
                    case 'errored':
                        continue;
                        break;
                }
                listener(fileChangeType, path);
            }
        });

        const recursive = option?.recursive ?? (handle.kind === 'directory');
        try
        {
            await observer.observe(handle, { recursive: recursive });
            this.observerMap.set(uriKey, observer);

            const delegate = new Delegate<(event: EMFileChange, filename: string) => void>();
            delegate.Add(listener);
            this.delegateWatchMap.set(uriKey, delegate);
        }
        catch (e)
        {
            IOC.Get<IServiceLog>(Sym.ServiceLog).Error('Watch', e);
        }
    }

    public async WatchFile(uri: URI, listener: (e: EMFileChange) => void): Promise<void>
    {
        const uriKey = this.extUri.GetComparisonKey(uri, true);

        if (this.observerMap.has(uriKey))
        {
            this.delegateWatchFileMap.get(uriKey)?.Add(listener);
            return;
        }

        const handle = await this.GetFileHandle(uri);
        if (!handle) return;

        if (typeof (globalThis as any).FileSystemObserver === 'undefined') return;

        const delegate = new Delegate<(e: EMFileChange) => void>();
        delegate.Add(listener);
        this.delegateWatchFileMap.set(uriKey, delegate);

        const observer = new (globalThis as any).FileSystemObserver(async (records: FileSystemObserverRecord[]) =>
        {
            if (records.length > 0)
            {
                let fileChangeType: EMFileChange;
                switch (records[0].type)
                {
                    case 'appeared':
                        fileChangeType = EMFileChange.Created;
                        break;
                    case 'disappeared':
                        fileChangeType = EMFileChange.Deleted;
                        break;
                    case 'modified':
                        fileChangeType = EMFileChange.Changed;
                        break;
                    case 'moved':
                        fileChangeType = EMFileChange.Renamed;
                        break;
                    case 'unknown':
                    case 'errored':
                        fileChangeType = EMFileChange.Unknown;
                        break;
                }

                await this.delegateWatchFileMap.get(uriKey)?.InvokeAsync(fileChangeType);
            }
        });

        await observer.observe(handle);
        this.observerMap.set(uriKey, observer);
    }

    public UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): void
    {
        const uriKey = this.extUri.GetComparisonKey(uri, true);
        const delegate = this.delegateWatchMap.get(uriKey);
        if (!delegate) return;

        delegate.Remove(listener);

        if (delegate.IsEmpty())
        {
            this.observerMap.get(uriKey)?.disconnect();
            this.observerMap.delete(uriKey);
            this.delegateWatchMap.delete(uriKey);
        }
    }

    public UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): void
    {
        const uriKey = this.extUri.GetComparisonKey(uri, true);
        const delegate = this.delegateWatchFileMap.get(uriKey);
        if (!delegate) return;

        delegate.Remove(listener);

        if (delegate.IsEmpty())
        {
            this.observerMap.get(uriKey)?.disconnect();
            this.observerMap.delete(uriKey);
            this.delegateWatchFileMap.delete(uriKey);
        }
    }

    private async RegisterHandle(handle: FileSystemHandle, map: Map<string, FileSystemHandle>): Promise<URI>
    {
        let handleID = `/${handle.name}`;

        if (map.has(handleID) && !await map.get(handleID)?.isSameEntry(handle))
        {
            const fileExt = Path.Extname(handle.name);
            const fileName = Path.Basename(handle.name, fileExt);

            let handleIdCounter = 1;
            do
            {
                handleID = `/${fileName}-${handleIdCounter++}${fileExt}`;
            }
            while (map.has(handleID) && !await map.get(handleID)?.isSameEntry(handle));
        }

        map.set(handleID, handle);

        if (handle.kind === 'file')
        {
            this.fileHandleMap.set(handleID, handle as FileSystemFileHandle);
        }
        else if (handle.kind === 'directory')
        {
            this.directoryHandleMap.set(handleID, handle as FileSystemDirectoryHandle);
        }

        return URI.From({ scheme: Schemas.file, path: handleID });
    }

    public async GetHandle(uri: URI): Promise<FileSystemHandle | null>
    {
        const directHandle = this.GetHandleByUri(uri);
        if (directHandle)
        {
            return directHandle;
        }

        const rootInfo = this.GetRootHandle(uri);
        if (!!rootInfo === false)
        {
            return null;
        }

        const { rootUri, handle: rootHandle } = rootInfo;
        
        // 计算相对路径并标准化
        let relativePath = this.extUri.RelativePath(rootUri, uri);
        if (!relativePath && relativePath !== '')
        {
            return null;
        }
        relativePath = relativePath ? relativePath.replace(/\\/g, '/') : '';

        if (relativePath === '')
        {
            return rootHandle;
        }

        const parts = relativePath.split('/').filter(p => p.length > 0);
        let currentHandle: FileSystemHandle = rootHandle;

        try
        {
            for (let i = 0; i < parts.length; i++)
            {
                const part = parts[i];
                if (currentHandle.kind !== 'directory')
                {
                    return null;
                }

                const dirHandle = currentHandle as FileSystemDirectoryHandle;
                try
                {
                    currentHandle = await dirHandle.getDirectoryHandle(part);
                }
                catch
                {
                    if (i === parts.length - 1)
                    {
                        try
                        {
                            currentHandle = await dirHandle.getFileHandle(part);
                        }
                        catch
                        {
                            return null;
                        }
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            return currentHandle;
        }
        catch { return null; }
    }

    private GetHandleByUri(uri: URI): FileSystemHandle | null
    {
        if (this.extUri.Dirname(uri).path !== '/') return null;
        const handleID = uri.path.replace(/\/$/, '');
        return this.fileHandleMap.get(handleID) || this.directoryHandleMap.get(handleID) || null;
    }

    private async GetFileHandle(resource: URI): Promise<FileSystemFileHandle | undefined>
    {
        let handle = await this.GetHandle(resource);

        if (handle === null)
        {
            const parent = await this.ResolvePathToParent(resource);
            if (parent === undefined)
            {
                return undefined;
            }
            await this.VerifyPermission(parent.parentHandle, true);
            handle = await parent.parentHandle.getFileHandle(parent.name, { create: true });
            await this.VerifyPermission(handle, true);
        }

        return (handle instanceof FileSystemFileHandle) ? handle : undefined;
    }

    private async GetDirectoryHandle(resource: URI): Promise<FileSystemDirectoryHandle | undefined>
    {
        const handle = await this.GetHandle(resource);
        return (handle instanceof FileSystemDirectoryHandle) ? handle : undefined;
    }

    /** 
     * 优化后的根句柄查找 
     * 1. 优先寻找最长匹配的路径（处理嵌套根的情况）
     * 2. 避免直接返回第一个匹配项
     */
    private GetRootHandle(uri: URI): { rootUri: URI, handle: FileSystemDirectoryHandle } | undefined
    {
        let bestMatch: { rootUri: URI, handle: FileSystemDirectoryHandle } | undefined = undefined;
        let maxMatchLength = -1;

        for (const [rootUriStr, handle] of this.directoryHandleMap.entries())
        {
            const rootUri = URI.From({ scheme: Schemas.file, path: rootUriStr });
            
            // 检查 uri 是否是 rootUri 的子路径 (或者相等)
            if (this.extUri.IsEqualOrParent(uri, rootUri))
            {
                const len = rootUri.path.length;
                if (len > maxMatchLength) {
                    maxMatchLength = len;
                    bestMatch = { rootUri, handle: handle as FileSystemDirectoryHandle };
                }
            }
        }

        if (bestMatch)
        {
            return bestMatch;
        }
        
        // Fallback: 如果没有找到父级匹配，且只有一个根，则假设它是根
        // (这种情况下 isEqualOrParent 为 false，说明 uri 指向的位置可能在逻辑上超出了根的范围，
        // 但通常意味着路径构造有问题，尝试强行 resolve 可能会失败，但在单工作区模式下可以容错)
        if (this.directoryHandleMap.size === 1)
        {
            const [path, handle] = this.directoryHandleMap.entries().next().value!;
            return { rootUri: URI.From({ scheme: Schemas.file, path }), handle: handle as FileSystemDirectoryHandle };
        }

        return undefined;
    }
}