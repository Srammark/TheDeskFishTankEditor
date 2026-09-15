import { IndexedDB } from '@zenfs/dom';
import { promises as fsp, fs, configure, configureSingle } from '@zenfs/core';
import type { URI } from '../../../../../Core/Module/String_DLL/URI';
import { type IFileSystem, type TypeFileOverwriteOptions, type TypeStat, EMFileType, type EMFilePermission, type TypeWatchOptions } from '../../../../IOC_DLL/Interface/File/IFileSystem';
import type { EMFileChange } from '../../../../../Core/IOC_DLL/Interface/File/Enum/EMFileChange';

export default class FileSystemIndexedDB implements IFileSystem
{
    public async Stat(uri: URI): Promise<TypeStat>
    {
        const stats = await fsp.stat(uri.FsPath);
        
        // 根据 Stats 对象判断文件类型
        let type: EMFileType;
        if (stats.isDirectory())
        {
            type = EMFileType.Directory;
        }
        else if (stats.isSymbolicLink?.())
        {
            type = EMFileType.SymbolicLink;
        }
        else if (stats.isFile?.())
        {
            type = EMFileType.File;
        }
        else
        {
            type = EMFileType.Unknown;
        }

        return {
            type,
            mtime: stats.mtimeMs ?? Date.now(),
            ctime: stats.ctimeMs ?? Date.now(),
            size: stats.size ?? 0,
            permissions: undefined
        };
    }

    public async Move(from: URI, to: URI, opts: TypeFileOverwriteOptions): Promise<void>
    {
        const targetExists = await this.Exists(to);
        if (targetExists && !opts.overwrite)
        {
            throw new Error(`目标路径已存在: ${to.ToString()}`);
        }

        try
        {
            // 尝试使用 zenfs 的 rename
            await fsp.rename(from.FsPath, to.FsPath);
        }
        catch (e)
        {
            // fallback: 复制后删除源文件
            const stat = await this.Stat(from);
            if (stat.type === EMFileType.Directory)
            {
                throw new Error('IndexedDB 文件系统不支持文件夹重命名 (fallback 未实现)');
            }
            else
            {
                await this.CopyFile(from, to);
                await this.RM(from);
            }
        }
    }

    public async Exists(uri: URI): Promise<boolean>
    {
        return await fsp.exists(uri.FsPath);
    }

    public async RM(uri: URI): Promise<void>
    {
        await fsp.rm(uri.FsPath);
    }

    public async RMDir(uri: URI): Promise<void>
    {
        await fsp.rmdir(uri.FsPath);
    }

    public async MKDir(uri: URI): Promise<void>
    {
        await fsp.mkdir(uri.FsPath, { recursive: true });
    }

    public async CopyFile(fromUri: URI, toUri: URI): Promise<void>
    {
        await fsp.copyFile(fromUri.FsPath, toUri.FsPath);
    }

    public async ReadDir(uri: URI): Promise<string[]>
    {
        return await fsp.readdir(uri.FsPath);
    }

    public async ReadFile(uri: URI): Promise<Uint8Array>
    {
        const buffer = await fsp.readFile(uri.FsPath);
        return buffer;

        // 多线程有问题，无法读取主线程的IndexedDB
        // 等到解决后再启用
        // return await new Promise<Buffer>((resolve, reject) =>
        // {
        //     const worker = new WorkerReadFile();
        //     worker.onmessage = (e: MessageEvent) =>
        //     {
        //         worker.terminate();
        //         resolve(e.data as Buffer);
        //     };

        //     worker.onerror = (e) => { reject(null); };

        //     worker.postMessage({ path: path });
        // });
    }

    public async WriteFile(uri: URI, data: SharedArrayBuffer | string): Promise<void>
    {
        try 
        {
            if (typeof data === 'string')
            {
                const encoder = new TextEncoder();
                const bytes = encoder.encode(data);

                await fsp.writeFile(uri.FsPath, bytes);
                return;
            }
            await fsp.writeFile(uri.FsPath, new Uint8Array(data));
        }
        catch (e)
        {
            console.error(`写入文件失败: ${uri.ToString()}, 错误: ${(e as Error).message}`);
        }

        // 多线程有问题，无法写入主线程的IndexedDB
        // 等到解决后再启用
        // return await new Promise<void>((resolve, reject) =>
        // {
        //     const worker = new WorkerWriteFile();
        //     worker.onmessage = (e: MessageEvent) =>
        //     {
        //         if (e.data === 'done')
        //         {
        //             worker.terminate();
        //             resolve();
        //         }
        //     };

        //     worker.onerror = (e) => { reject(); };

        //     if (typeof data === "string")
        //     {
        //         const encoder = new TextEncoder();
        //         const bytes = encoder.encode(data);
        //         // 分配 SAB
        //         const sab = new SharedArrayBuffer(bytes.length);
        //         // 拷贝数据到 SAB
        //         const u8 = new Uint8Array(sab);
        //         u8.set(bytes);

        //         data = sab;
        //     }

        //     worker.postMessage({ path: path, sharedArrayBuffer: data as SharedArrayBuffer});
        // });
    }

    public async Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>
    {
        throw new Error('Method not implemented.');
    }

    public async WatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>
    {
        throw new Error('Method not implemented.');
    }

    public UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): void
    {
        throw new Error('Method not implemented.');
    }

    public UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): void
    {
        throw new Error('Method not implemented.');
    }
}