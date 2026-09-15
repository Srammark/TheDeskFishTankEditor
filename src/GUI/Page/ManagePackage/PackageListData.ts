import IOC from '@/Core/IOC_DLL/IOC';
import Sym from '@/Core/IOC_DLL/Sym';
import { URI } from '@/Core/Module/String_DLL/URI';
import type IServiceFile from '@/Core/IOC_DLL/Interface/File/IServiceFile';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import { type IPackageInfo } from '../ManageResourcePackage/Types';
import ResourcePackageData from '../ManageResourcePackage/ResourcePackageData';

export default class PackageListData
{
    private sFile: IServiceFile;
    private rootUri: URI;

    public constructor()
    {
        this.sFile = IOC.Get<IServiceFile>(Sym.ServiceFile);
        this.rootUri = URI.Parse('indexedDB:///sumi/fish/packageEditor/packages');
    }

    public async GetPackageList(): Promise<IPackageInfo[]>
    {
        const infoList: IPackageInfo[] = [];
        if (await this.sFile.Exists(this.rootUri) === false)
        {
            return infoList;
        }

        const dirList = await this.sFile.ReadDir(this.rootUri);
        for (const name of dirList)
        {
            const infoUri = URI.JoinPath(this.rootUri, name, 'info.json');
            if (await this.sFile.Exists(infoUri) === false)
            {
                continue;
            }

            const data = await this.sFile.ReadFile(infoUri);
            if (data === null)
            {
                continue;
            }

            try
            {
                infoList.push(JSON.parse(new TextDecoder().decode(data)) as IPackageInfo);
            }
            catch
            {
                // 跳过无法解析的 info.json
            }
        }

        return infoList;
    }

    public async CreatePackage(name: string): Promise<string>
    {
        const packageId = crypto.randomUUID();
        const packageData = new ResourcePackageData(packageId);
        packageData.packageInfo = {
            id: packageId,
            name,
            keywords: '',
            version: '1.0.0',
            author: '',
            license: 'MIT'
        };
        await packageData.Save();
        return packageId;
    }

    public async ImportPackage(files: FileList): Promise<string>
    {
        const packageId = crypto.randomUUID();
        const packageData = new ResourcePackageData(packageId);
        await packageData.ImportFromFolder(files);
        packageData.packageInfo.id = packageId;
        await packageData.Save();
        return packageId;
    }

    public async ExportPackage(packageId: string): Promise<Blob>
    {
        const packageData = new ResourcePackageData(packageId);
        return packageData.ExportToZip();
    }

    public async DeletePackage(packageId: string): Promise<void>
    {
        const packageUri = URI.JoinPath(this.rootUri, packageId);
        await this.ClearDir(packageUri);
    }

    private async ClearDir(uri: URI): Promise<void>
    {
        if (await this.sFile.Exists(uri) === false)
        {
            return;
        }

        const dirList = await this.sFile.ReadDir(uri);
        for (const name of dirList)
        {
            const entryUri = uri.With({ path: uri.path + '/' + name });
            const stat = await this.sFile.Stat(entryUri);
            if (stat.type === EMFileType.Directory)
            {
                await this.ClearDir(entryUri);
            }
            else
            {
                await this.sFile.RM(entryUri);
            }
        }

        await this.sFile.RMDir(uri);
    }
}
