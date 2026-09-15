import IOC from '../../../Core/IOC_DLL/IOC';
import Sym from '../../../Core/IOC_DLL/Sym';
import type { URI } from '../../../Core/Module/String_DLL/URI';
import type IServiceFile from '../../../Core/IOC_DLL/Interface/File/IServiceFile';
import type { IFileOperationEvent } from '../../../Core/IOC_DLL/Interface/File/IServiceFile';
import { EMFileOperation } from '../../../Core/IOC_DLL/Interface/File/IServiceFile';
import { EMFileType, type IFileSystem, type TypeFileOverwriteOptions, type TypeStat, type TypeWatchOptions } from '../../IOC_DLL/Interface/File/IFileSystem';
import type IServiceLog from '../../../Core/IOC_DLL/Interface/Log/IServiceLog';
import { Delegate, DelegateEvent } from 'sumi-tsextension';
import type { EMFileChange } from '../../../Core/IOC_DLL/Interface/File/Enum/EMFileChange';

export default class ServiceFile implements IServiceFile
{
    private fileSystemMap = new Map<string, IFileSystem>();
    private dFileOperation = new Delegate<(event: IFileOperationEvent) => void>();
    public get DFileOperation(): DelegateEvent<(event: IFileOperationEvent) => void>
    {
        return this.dFileOperation.Event;
    }

    public RegisterFileSystem(scheme: string, fileSystem: IFileSystem): void
    {
        if (this.fileSystemMap.has(scheme) === true)
        {
            return;
        }

        this.fileSystemMap.set(scheme, fileSystem);
    }

    public GetFileSystem(scheme: string): IFileSystem | null
    {
        if (this.fileSystemMap.has(scheme) === false)
        {
            return null;
        }

        return this.fileSystemMap.get(scheme) as IFileSystem;
    }

    private GetFileSystemOrThrow(scheme: string): IFileSystem
    {
        const fileSystem = this.GetFileSystem(scheme);
        if (fileSystem === null)
        {
            const logger = IOC.Get<IServiceLog>(Sym.ServiceLog);
            logger.Error(`未找到对应的文件系统${scheme}`);
            throw scheme;
        }

        return fileSystem;
    }

    public async Stat(uri: URI): Promise<TypeStat>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            return await fileSystem.Stat(uri);
        }
        catch (error)
        {
            throw error;
        }
    }

    /** 判断路径是否存在 */
    public async Exists(uri: URI): Promise<boolean>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            return await fileSystem.Exists(uri);
		}
        catch (error)
        {
			return false;
		}
    }

    /** 删除文件 */
    public async RM(uri: URI): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            await fileSystem.RM(uri);
            await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Delete, Source: uri, Target: uri });
		}
        catch (error)
        {
            throw error;
		}
    }

    /** 删除文件夹 */
    public async RMDir(uri: URI): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            await fileSystem.RMDir(uri);
            await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Delete, Source: uri, Target: uri });
		}
        catch (error)
        {
            throw error;
		}
    }

    /** 创建文件夹 */
    public async MKDir(uri: URI): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            await fileSystem.MKDir(uri);
		}
        catch (error)
        {
            throw error;
		}
    }

    /** 复制文件 */
    public async CopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>
    {
        const fromFileSystem = this.GetFileSystemOrThrow(fromUri.scheme);
        const toFileSystem = this.GetFileSystemOrThrow(toUri.scheme);

        try
        {
			await toFileSystem.WriteFile(toUri, await fromFileSystem.ReadFile(fromUri));
            await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Copy, Source: fromUri, Target: toUri });
		}
        catch (error)
        {
            throw error;
		}
    }

    public async CanCopyFile(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<boolean>
    {
        const fromFileSystem = this.GetFileSystemOrThrow(fromUri.scheme);
        const toFileSystem = this.GetFileSystemOrThrow(toUri.scheme);

        try
        {
            const fromStat = await fromFileSystem.Stat(fromUri);
            if (fromStat.type !== EMFileType.File)
            {
                return false;
            }

            const toExists = await toFileSystem.Exists(toUri);
            if (toExists === true && overwrite !== true)
            {
                return false;
            }

            return true;
        }
        catch (error)
        {
            return false;
        }
    }

    /** 移动文件 */
    public async Move(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<void>
    {
        const fromFileSystem = this.GetFileSystemOrThrow(fromUri.scheme);
        const toFileSystem = this.GetFileSystemOrThrow(toUri.scheme);

        // 如果 scheme 相同，使用同一个文件系统的 Move
        if (fromUri.scheme === toUri.scheme)
        {
            try
            {
                await fromFileSystem.Move(fromUri, toUri, { overwrite: overwrite ?? false });
                await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Move, Source: fromUri, Target: toUri });
            }
            catch (error)
            {
                throw error;
            }
            return;
        }

        // 跨 scheme 移动：读取源文件内容，写入目标位置，然后删除源文件
        try
        {
            const data = await fromFileSystem.ReadFile(fromUri);
            await toFileSystem.WriteFile(toUri, data);
            await fromFileSystem.RM(fromUri);
            await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Move, Source: fromUri, Target: toUri });
        }
        catch (error)
        {
            throw error;
        }
    }

    public async CanMove(fromUri: URI, toUri: URI, overwrite?: boolean): Promise<boolean>
    {
        const fromFileSystem = this.GetFileSystemOrThrow(fromUri.scheme);
        const toFileSystem = this.GetFileSystemOrThrow(toUri.scheme);

        try
        {
            const fromStat = await fromFileSystem.Stat(fromUri);
            if (fromStat.type !== EMFileType.File)
            {
                return false;
            }

            const toExists = await toFileSystem.Exists(toUri);
            if (toExists === true && overwrite !== true)
            {
                return false;
            }

            return true;
        }
        catch (error)
        {
            return false;
        }
    }


    /** 读取文件夹 */
    public async ReadDir(uri: URI): Promise<string[]>
    {
		const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            return await fileSystem.ReadDir(uri);
		}
        catch (error)
        {
            throw error;
		}
    }

    /** 读取文件 */
    public async ReadFile(uri: URI): Promise<Uint8Array>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            return await fileSystem.ReadFile(uri);
		}
        catch (error)
        {
            throw error;
		}
    }

    /** 写入文件 */
    public async WriteFile(uri: URI, data: SharedArrayBuffer | Buffer | string): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            await fileSystem.WriteFile(uri, data);
		}
        catch (error)
        {
            throw error;
		}
    }

    public async CreateFile(uri: URI, data?: SharedArrayBuffer | string): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            await fileSystem.WriteFile(uri, data ?? '');
            await this.dFileOperation.InvokeAsync({ Operation: EMFileOperation.Create, Source: null, Target: uri });
        }
        catch (error)
        {
            throw error;
        }
    }

    public async CanCreateFile(uri: URI, overwrite?: boolean): Promise<boolean>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);

        try
        {
            const exists = await fileSystem.Exists(uri);
            if (exists === true && overwrite !== true)
            {
                return false;
            }

            return true;
        }
        catch (error)
        {
            return false;
        }
    }

    public async Watch(uri: URI, listener: (event: EMFileChange, filename: string) => void, option?: TypeWatchOptions): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);
        await fileSystem.Watch(uri, listener, option);
    }
    
    public async WatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);
        await fileSystem.WatchFile(uri, listener);
    }
    
    public async UnWatch(uri: URI, listener: (event: EMFileChange, filename: string) => void): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);
        fileSystem.UnWatch(uri, listener);
    }
    
    public async UnWatchFile(uri: URI, listener: (event: EMFileChange) => void): Promise<void>
    {
        const fileSystem = this.GetFileSystemOrThrow(uri.scheme);
        fileSystem.UnWatchFile(uri, listener);
    }
}