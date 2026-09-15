import { URI } from '../../../../../Core/Module/String_DLL/URI';
import type { IFileSystem, TypeFileOverwriteOptions, TypeStat, TypeWatchOptions } from '../../../../../Core/IOC_DLL/Interface/File/IFileSystem';
import { EMFileType, EMFilePermission } from '../../../../../Core/IOC_DLL/Interface/File/IFileSystem';
import { extUri } from '../../../../../Core/Module/String_DLL/ExtUri';
import IOC from '../../../../../Core/IOC_DLL/IOC';
import type IServiceLog from '../../../../../Core/IOC_DLL/Interface/Log/IServiceLog';
import Sym from '../../../../../Core/IOC_DLL/Sym';
import { Delegate } from 'sumi-tsextension';
import MAUI from '../../../../../Core/Module/MAUI_DLL/MAUI';
import  { EMFileChange } from '../../../../../Core/IOC_DLL/Interface/File/Enum/EMFileChange';

/**
 * MAUI 设备本地文件系统实现
 * 通过 .NET MAUI JS 互操作调用原生文件 API
 */
export default class FileSystemDevice implements IFileSystem
{
    private sLog!: IServiceLog;

    // 监听器管理 - 使用 URI 字符串作为 key，避免对象引用问题
    private delegateWatchMap = new Map<string, Delegate<(event: EMFileChange, filename: string) => void>>();
    private delegateWatchFileMap = new Map<string, Delegate<(event: EMFileChange) => void>>();

    public constructor()
    {
        this.sLog = IOC.Get<IServiceLog>(Sym.ServiceLog);
        this.RegisterCallback();
    }

    /**
     * 注册统一回调函数（供 MAUI 端调用）
     * 在构造函数中调用一次即可
     */
    private RegisterCallback(): void
    {
        // 确保 Core.File 命名空间存在
        if (!(globalThis as any)['Core'])
        {
            (globalThis as any)['Core'] = {};
        }
        if (!(globalThis as any)['Core']['File'])
        {
            (globalThis as any)['Core']['File'] = {};
        }

        const coreFile = (globalThis as any)['Core']['File'];

        // 目录变化统一回调
        coreFile['FileSystemDevice_WatchCallback'] = async (path: string, event: EMFileChange, filename: string) =>
        {
            const uri = URI.File(path);
            const delegate = this.delegateWatchMap.get(extUri.GetComparisonKey(uri, true));
            if (delegate)
            {
                await delegate.InvokeAsync(event, filename);
            }
        };

        // 文件变化统一回调
        coreFile['FileSystemDevice_WatchFileCallback'] = async (path: string, event: EMFileChange) =>
        {
            const uri = URI.File(path);
            const delegate = this.delegateWatchFileMap.get(extUri.GetComparisonKey(uri, true));
            if (delegate)
            {
                await delegate.InvokeAsync(event);
            }
        };
    }

    /**
     * 将 URI 转换为本地文件路径
     */
    private GetLocalPath(uri: URI): string
    {
        // 使用 uri.FsPath 获取文件系统路径
        // 例如: file:///C:/path/file.txt -> C:/path/file.txt
        return uri.FsPath;
    }

    public async Stat(uri: URI): Promise<TypeStat>
    {
        const path = this.GetLocalPath(uri);
        const stat = await MAUI.DotNetInvokeMethod<any>('FileModule_Stat', path);

        return {
            type: stat.isDirectory ? EMFileType.Directory : EMFileType.File,
            size: stat.size || 0,
            mtime: stat.mtime,
            ctime: stat.ctime,
            permissions: stat.isReadOnly ? EMFilePermission.Readonly : undefined
        };
    }

    public async Exists(uri: URI): Promise<boolean>
    {
        const path = this.GetLocalPath(uri);
        return await MAUI.DotNetInvokeMethod<boolean>('FileModule_Exists', path);
    }

    public async RM(uri: URI): Promise<void>
    {
        const path = this.GetLocalPath(uri);
        await MAUI.DotNetInvokeMethod<void>('FileModule_DeleteFile', path);
    }

    public async RMDir(uri: URI): Promise<void>
    {
        const path = this.GetLocalPath(uri);
        await MAUI.DotNetInvokeMethod<void>('FileModule_DeleteDirectory', path, true);
    }

    public async MKDir(uri: URI): Promise<void>
    {
        const path = this.GetLocalPath(uri);
        await MAUI.DotNetInvokeMethod<void>('FileModule_CreateDirectory', path);
    }

    public async CopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>
    {
        const fromPath = this.GetLocalPath(fromUri);
        const toPath = this.GetLocalPath(toUri);
        await MAUI.DotNetInvokeMethod<void>('FileModule_CopyFile', fromPath, toPath, overwrite ?? false);
    }

    public async ReadDir(uri: URI): Promise<string[]>
    {
        const path = this.GetLocalPath(uri);
        const entries = await MAUI.DotNetInvokeMethod<string[]>('FileModule_ReadDirectory', path);
        return entries;
    }

    public async ReadFile(uri: URI): Promise<Uint8Array>
    {
        const path = this.GetLocalPath(uri);

        // 使用流式传输读取文件
        // MAUI 端返回 byte[] 数组，反序列化为 Uint8Array
        const chunks = await MAUI.DotNetInvokeMethod<Uint8Array[]>('FileModule_ReadFileStream', path);

        // 计算总长度
        let totalLength = 0;
        for (const chunk of chunks)
        {
            totalLength += chunk.length;
        }

        // 合并所有 chunks
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks)
        {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result;
    }

    public async WriteFile(uri: URI, data: SharedArrayBuffer | Uint8Array | string): Promise<void>
    {
        const path = this.GetLocalPath(uri);

        let bytes: Uint8Array;

        if (typeof data === 'string')
        {
            // 字符串转 UTF-8 字节数组
            bytes = new TextEncoder().encode(data);
        }
        else if (data instanceof Uint8Array)
        {
            bytes = data;
        }
        else
        {
            // SharedArrayBuffer
            bytes = new Uint8Array(data);
        }

        await MAUI.DotNetInvokeMethod<void>('FileModule_WriteFileStream', path, bytes);
    }

    public async Move(from: URI, to: URI, opts: TypeFileOverwriteOptions): Promise<void>
    {
        const fromPath = this.GetLocalPath(from);
        const toPath = this.GetLocalPath(to);
        await MAUI.DotNetInvokeMethod<void>('FileModule_Move', fromPath, toPath, opts.overwrite);
    }

    public async Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>
    {
        const path = this.GetLocalPath(uri);
        const uriKey = extUri.GetComparisonKey(uri, true);

        // 创建或获取委托
        let delegate = this.delegateWatchMap.get(uriKey);
        if (!delegate)
        {
            delegate = new Delegate<(event: EMFileChange, filename: string) => void>();
            this.delegateWatchMap.set(uriKey, delegate);

            // 启动 MAUI 端监听
            await MAUI.DotNetInvokeMethod<void>('FileModule_WatchDirectory', path, option?.recursive ?? false);
        }

        delegate.Add(listener);
    }

    public async WatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>
    {
        const path = this.GetLocalPath(uri);
        const uriKey = extUri.GetComparisonKey(uri, true);

        // 创建或获取委托
        let delegate = this.delegateWatchFileMap.get(uriKey);
        if (!delegate)
        {
            delegate = new Delegate<(event: EMFileChange) => void>();
            this.delegateWatchFileMap.set(uriKey, delegate);

            // 启动 MAUI 端监听
            await MAUI.DotNetInvokeMethod<void>('FileModule_WatchFile', path);
        }

        delegate.Add(listener);
    }

    public UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): void
    {
        const uriKey = extUri.GetComparisonKey(uri, true);
        const delegate = this.delegateWatchMap.get(uriKey);
        if (delegate)
        {
            delegate.Remove(listener);
            if (delegate.IsEmpty() === true)
            {
                this.delegateWatchMap.delete(uriKey);
                const path = this.GetLocalPath(uri);
                MAUI.DotNetInvokeMethod<void>('FileModule_UnWatchDirectory', path).catch(err =>
                {
                    this.sLog.Warn(`Failed to unwatch directory: ${path}`, err);
                });
            }
        }
    }

    public UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): void
    {
        const uriKey = extUri.GetComparisonKey(uri, true);
        const delegate = this.delegateWatchFileMap.get(uriKey);
        if (delegate)
        {
            delegate.Remove(listener);
            if (delegate.IsEmpty() === true)
            {
                this.delegateWatchFileMap.delete(uriKey);
                const path = this.GetLocalPath(uri);
                MAUI.DotNetInvokeMethod<void>('FileModule_UnWatchFile', path).catch(err =>
                {
                    this.sLog.Warn(`Failed to unwatch file: ${path}`, err);
                });
            }
        }
    }
}