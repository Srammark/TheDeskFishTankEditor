import IOC from '@/Core/IOC_DLL/IOC';
import Sym from '@/Core/IOC_DLL/Sym';
import { URI } from '@/Core/Module/String_DLL/URI';
import type IServiceFile from '@/Core/IOC_DLL/Interface/File/IServiceFile';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import {
    EMResourceType, LANGUAGE_FOLDER, CREATURE_FOLDER, DECORATION_FOLDER,
    type IPackageInfo, type IResourceContext, type IResourceHandler,
    type ISpeciesDescription, type IStrainDescription, type ICreatureItem, type TSpeciesCategory,
    type TSpriteSize, type TSpriteAction,
    type TSexFolder, type ISizeConfig, type IFrameData,
    type IDecorationItem, type IDecorationPart
} from './Types';
import { type ISubstrateItem, type TSubstrateSpriteSlot } from './Substrate/TypeSubstrate';
import { type IGlassStyleItem, type TGlassTextureSlot } from './Glass/TypeGlass';
import CreatureResourceHandler from './CreatureFolder/CreatureResourceHandler';
import DecorationResourceHandler from './DecorationFolder/DecorationResourceHandler';
import SubstrateResourceHandler from './Substrate/SubstrateResourceHandler';
import GlassResourceHandler from './Glass/GlassResourceHandler';
import LanguageResourceHandler from './Language/LanguageResourceHandler';

export default class ResourcePackageData
{
    private sFile: IServiceFile;
    private workUri: URI;

    public packageInfo: IPackageInfo;
    private languageHandler: LanguageResourceHandler;
    private creatureHandler: CreatureResourceHandler;
    private decorationHandler: DecorationResourceHandler;
    private substrateHandler: SubstrateResourceHandler;
    private glassHandler: GlassResourceHandler;
    private handlerMap: Map<EMResourceType, IResourceHandler>;

    public constructor(packageId: string)
    {
        this.sFile = IOC.Get<IServiceFile>(Sym.ServiceFile);
        this.workUri = URI.Parse(`indexedDB:///theDeskFishTankEditor/fish/packageEditor/packages/${packageId}`);

        this.packageInfo = {
            id: '',
            name: '',
            keywords: '',
            version: '1.0.0',
            author: '',
            license: 'MIT'
        };
        this.languageHandler = new LanguageResourceHandler();
        this.creatureHandler = new CreatureResourceHandler();
        this.decorationHandler = new DecorationResourceHandler();
        this.substrateHandler = new SubstrateResourceHandler();
        this.glassHandler = new GlassResourceHandler();
        this.handlerMap = new Map<EMResourceType, IResourceHandler>([
            [EMResourceType.Creature, this.creatureHandler],
            [EMResourceType.Decoration, this.decorationHandler],
            [EMResourceType.Substrate, this.substrateHandler],
            [EMResourceType.Glass, this.glassHandler]
        ]);
    }

    public GetContext(): IResourceContext
    {
        return {
            workUri: this.workUri,
            sFile: this.sFile
        };
    }

    public GetResourceHandler(type: EMResourceType): IResourceHandler
    {
        return this.handlerMap.get(type)!;
    }

    public GetResourceHandlers(): IResourceHandler[]
    {
        return Array.from(this.handlerMap.values());
    }

    public GetCreatureHandler(): CreatureResourceHandler
    {
        return this.creatureHandler;
    }

    public GetDecorationHandler(): DecorationResourceHandler
    {
        return this.decorationHandler;
    }

    public GetSubstrateHandler(): SubstrateResourceHandler
    {
        return this.substrateHandler;
    }

    public GetGlassHandler(): GlassResourceHandler
    {
        return this.glassHandler;
    }

    public GetLanguageHandler(): LanguageResourceHandler
    {
        return this.languageHandler;
    }

    // #region Language facade

    public GetLanguage(langTag: string): Record<string, unknown> | undefined
    {
        return this.languageHandler.GetLanguage(langTag);
    }

    public SetLanguage(langTag: string, data: Record<string, unknown>): void
    {
        this.languageHandler.SetLanguage(langTag, data);
    }

    public GetLanguageTagList(): string[]
    {
        return this.languageHandler.GetLanguageTagList();
    }

    public AddLanguage(langTag: string): void
    {
        this.languageHandler.AddLanguage(langTag);
    }

    public async RemoveLanguage(langTag: string): Promise<void>
    {
        this.languageHandler.RemoveLanguage(langTag);

        const langUri = URI.JoinPath(this.workUri, LANGUAGE_FOLDER, `${langTag}.json`);
        if (await this.sFile.Exists(langUri))
        {
            await this.sFile.RM(langUri);
        }
    }

    // #endregion

    // #region Fish facade

    public GetSpeciesDesc(speciesName: string): ISpeciesDescription | undefined
    {
        return this.creatureHandler.GetSpeciesDesc(speciesName);
    }

    public SetSpeciesDesc(speciesName: string, desc: ISpeciesDescription): void
    {
        this.creatureHandler.SetSpeciesDesc(speciesName, desc);
    }

    public GetStrainNameList(speciesName: string): string[]
    {
        return this.creatureHandler.GetStrainNameList(speciesName);
    }

    public GetStrainDesc(speciesName: string, strainName: string): IStrainDescription | undefined
    {
        return this.creatureHandler.GetStrainDesc(speciesName, strainName);
    }

    public SetStrainDesc(speciesName: string, strainName: string, desc: IStrainDescription): void
    {
        this.creatureHandler.SetStrainDesc(speciesName, strainName, desc);
    }

    public GetStrainImage(speciesName: string, strainName: string): Uint8Array | null | undefined
    {
        return this.creatureHandler.GetStrainImage(speciesName, strainName);
    }

    public SetStrainImage(speciesName: string, strainName: string, data: Uint8Array | null): void
    {
        this.creatureHandler.SetStrainImage(speciesName, strainName, data);
    }

    public AddStrain(speciesName: string, strainName: string): void
    {
        this.creatureHandler.AddStrain(speciesName, strainName);
    }

    public async RemoveStrain(speciesName: string, strainName: string): Promise<void>
    {
        await this.creatureHandler.RemoveStrain(speciesName, strainName, this.GetContext());
    }

    public GetItem(speciesName: string, strainName: string, sexName: TSexFolder): ICreatureItem | undefined
    {
        return this.creatureHandler.GetItem(speciesName, strainName, sexName);
    }

    public SetItem(speciesName: string, strainName: string, sexName: TSexFolder, item: ICreatureItem): void
    {
        this.creatureHandler.SetItem(speciesName, strainName, sexName, item);
    }

    public GetSpriteSheet(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): Uint8Array | null | undefined
    {
        return this.creatureHandler.GetSpriteSheet(speciesName, strainName, sexName, sizeName);
    }

    public SetSpriteSheet(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, data: Uint8Array | null): void
    {
        this.creatureHandler.SetSpriteSheet(speciesName, strainName, sexName, sizeName, data);
    }

    public GetSizeConfig(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): ISizeConfig | undefined
    {
        return this.creatureHandler.GetSizeConfig(speciesName, strainName, sexName, sizeName);
    }

    public SetSizeConfig(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, config: ISizeConfig): void
    {
        this.creatureHandler.SetSizeConfig(speciesName, strainName, sexName, sizeName, config);
    }

    public GetFrameData(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number): IFrameData | undefined
    {
        return this.creatureHandler.GetFrameData(speciesName, strainName, sexName, sizeName, actionName, frameIndex);
    }

    public SetFrameData(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number, frameData: IFrameData): void
    {
        this.creatureHandler.SetFrameData(speciesName, strainName, sexName, sizeName, actionName, frameIndex, frameData);
    }

    public EnsureSizeConfig(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): ISizeConfig
    {
        return this.creatureHandler.EnsureSizeConfig(speciesName, strainName, sexName, sizeName);
    }

    public AddFrame(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction): void
    {
        this.creatureHandler.AddFrame(speciesName, strainName, sexName, sizeName, actionName);
    }

    public RemoveFrame(speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number): void
    {
        this.creatureHandler.RemoveFrame(speciesName, strainName, sexName, sizeName, actionName, frameIndex);
    }

    public CopyColliderToAllFrames(
        speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize,
        actionName: TSpriteAction, sourceFrameIndex: number
    ): void
    {
        this.creatureHandler.CopyColliderToAllFrames(speciesName, strainName, sexName, sizeName, actionName, sourceFrameIndex);
    }

    public CopyColliderToAdjacentFrame(
        speciesName: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize,
        actionName: TSpriteAction, sourceFrameIndex: number, direction: -1 | 1
    ): void
    {
        this.creatureHandler.CopyColliderToAdjacentFrame(speciesName, strainName, sexName, sizeName, actionName, sourceFrameIndex, direction);
    }

    public AddSpecies(category: TSpeciesCategory, speciesName: string): void
    {
        this.creatureHandler.AddSpecies(category, speciesName);
    }

    /** 按物种类别创建默认属性 */
    public CreateDefaultCreatureItem(category: TSpeciesCategory): ICreatureItem
    {
        return this.creatureHandler.CreateDefaultItem(category);
    }

    public async RemoveSpecies(speciesName: string): Promise<void>
    {
        await this.creatureHandler.RemoveSpecies(speciesName, this.GetContext());
    }

    // #endregion

    // #region Decoration facade

    public AddDecoration(decorationName: string): void
    {
        this.decorationHandler.AddDecoration(decorationName);
    }

    public async RemoveDecoration(decorationName: string): Promise<void>
    {
        await this.decorationHandler.RemoveDecoration(decorationName, this.GetContext());
    }

    public GetDecorationItem(decorationName: string): IDecorationItem | undefined
    {
        return this.decorationHandler.GetItem(decorationName);
    }

    public SetDecorationItem(decorationName: string, item: IDecorationItem): void
    {
        this.decorationHandler.SetItem(decorationName, item);
    }

    public GetDecorationPart(decorationName: string, partID: string): IDecorationPart | undefined
    {
        return this.decorationHandler.GetPart(decorationName, partID);
    }

    public SetDecorationPart(decorationName: string, partID: string, part: IDecorationPart): void
    {
        this.decorationHandler.SetPart(decorationName, partID, part);
    }

    public AddDecorationPart(decorationName: string, part: IDecorationPart): void
    {
        this.decorationHandler.AddPart(decorationName, part);
    }

    public RemoveDecorationPart(decorationName: string, partID: string): void
    {
        this.decorationHandler.RemovePart(decorationName, partID);
    }

    public GetDecorationSpriteSheet(decorationName: string, partID: string): Uint8Array | null | undefined
    {
        return this.decorationHandler.GetSpriteSheet(decorationName, partID);
    }

    public SetDecorationSpriteSheet(decorationName: string, partID: string, data: Uint8Array | null): void
    {
        this.decorationHandler.SetSpriteSheet(decorationName, partID, data);
    }

    public GetDecorationImage(decorationName: string): Uint8Array | null | undefined
    {
        return this.decorationHandler.GetThumbnailImage(decorationName);
    }

    public SetDecorationImage(decorationName: string, data: Uint8Array | null): void
    {
        this.decorationHandler.SetThumbnailImage(decorationName, data);
    }

    // #endregion

    // #region Substrate facade

    public AddSubstrate(substrateName: string): void
    {
        this.substrateHandler.AddSubstrate(substrateName);
    }

    public async RemoveSubstrate(substrateName: string): Promise<void>
    {
        await this.substrateHandler.RemoveSubstrate(substrateName, this.GetContext());
    }

    public GetSubstrateItem(substrateName: string): ISubstrateItem | undefined
    {
        return this.substrateHandler.GetItem(substrateName);
    }

    public SetSubstrateItem(substrateName: string, item: ISubstrateItem): void
    {
        this.substrateHandler.SetItem(substrateName, item);
    }

    public GetSubstrateSprite(substrateName: string, slot: TSubstrateSpriteSlot): Uint8Array | null | undefined
    {
        return this.substrateHandler.GetSprite(substrateName, slot);
    }

    public SetSubstrateSprite(substrateName: string, slot: TSubstrateSpriteSlot, data: Uint8Array | null): void
    {
        this.substrateHandler.SetSprite(substrateName, slot, data);
    }

    public GetSubstrateImage(substrateName: string): Uint8Array | null | undefined
    {
        return this.substrateHandler.GetThumbnailImage(substrateName);
    }

    public SetSubstrateImage(substrateName: string, data: Uint8Array | null): void
    {
        this.substrateHandler.SetThumbnailImage(substrateName, data);
    }

    // #endregion

    // #region Glass facade

    public AddGlass(styleName: string): void
    {
        this.glassHandler.AddGlass(styleName);
    }

    public async RemoveGlass(styleName: string): Promise<void>
    {
        await this.glassHandler.RemoveGlass(styleName, this.GetContext());
    }

    public GetGlassItem(styleName: string): IGlassStyleItem | undefined
    {
        return this.glassHandler.GetItem(styleName);
    }

    public SetGlassItem(styleName: string, item: IGlassStyleItem): void
    {
        this.glassHandler.SetItem(styleName, item);
    }

    public GetGlassTexture(styleName: string, slot: TGlassTextureSlot): Uint8Array | null | undefined
    {
        return this.glassHandler.GetTexture(styleName, slot);
    }

    public SetGlassTexture(styleName: string, slot: TGlassTextureSlot, data: Uint8Array | null): void
    {
        this.glassHandler.SetTexture(styleName, slot, data);
    }

    public GetGlassImage(styleName: string): Uint8Array | null | undefined
    {
        return this.glassHandler.GetThumbnailImage(styleName);
    }

    public SetGlassImage(styleName: string, data: Uint8Array | null): void
    {
        this.glassHandler.SetThumbnailImage(styleName, data);
    }

    // #endregion

    public async Load(): Promise<void>
    {
        const context = this.GetContext();

        this.packageInfo = {
            id: '',
            name: '',
            keywords: '',
            version: '1.0.0',
            author: '',
            license: 'MIT'
        };
        this.languageHandler.Clear();
        this.creatureHandler.Clear();
        this.decorationHandler.Clear();
        this.substrateHandler.Clear();
        this.glassHandler.Clear();

        const infoUri = URI.JoinPath(this.workUri, 'info.json');
        if (await this.sFile.Exists(infoUri))
        {
            const data = await this.sFile.ReadFile(infoUri);
            if (data !== null)
            {
                this.packageInfo = JSON.parse(new TextDecoder().decode(data)) as IPackageInfo;
            }
        }

        await this.languageHandler.Load(context);
        await this.creatureHandler.Load(context);
        await this.decorationHandler.Load(context);
        await this.substrateHandler.Load(context);
        await this.glassHandler.Load(context);
    }

    public async Save(): Promise<void>
    {
        await this.EnsureWorkDir();
        const context = this.GetContext();

        const infoUri = URI.JoinPath(this.workUri, 'info.json');
        await this.sFile.WriteFile(infoUri, JSON.stringify(this.packageInfo, null, 4));

        await this.languageHandler.Save(context);
        await this.creatureHandler.Save(context);
        await this.decorationHandler.Save(context);
        await this.substrateHandler.Save(context);
        await this.glassHandler.Save(context);
    }

    public async ImportFromFolder(files: FileList): Promise<void>
    {
        if (await this.sFile.Exists(this.workUri))
        {
            await this.ClearDir(this.workUri);
        }
        await this.sFile.MKDir(this.workUri);

        const fileList = Array.from(files);
        const rootPath = this.GetCommonRootPath(fileList);

        for (const file of fileList)
        {
            const relativePath = file.webkitRelativePath.substring(rootPath.length);
            const parts = relativePath.split('/').filter(p => p !== '');

            if (parts.length === 0)
            {
                continue;
            }

            let currentUri = this.workUri;
            for (let i = 0; i < parts.length - 1; i++)
            {
                currentUri = URI.JoinPath(currentUri, parts[i]);
                if (await this.sFile.Exists(currentUri) === false)
                {
                    await this.sFile.MKDir(currentUri);
                }
            }

            const fileUri = URI.JoinPath(currentUri, parts[parts.length - 1]);
            const buffer = await file.arrayBuffer();
            await this.sFile.WriteFile(fileUri, buffer as unknown as SharedArrayBuffer);
        }

        await this.Load();
    }

    public async ExportToZip(): Promise<Blob>
    {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        await this.AddFolderToZip(zip, this.workUri, '');

        return zip.generateAsync({ type: 'blob' });
    }

    private async EnsureWorkDir(): Promise<void>
    {
        if (await this.sFile.Exists(this.workUri) === false)
        {
            await this.sFile.MKDir(this.workUri);
        }
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

    private GetCommonRootPath(fileList: File[]): string
    {
        if (fileList.length === 0) return '';
        const firstPath = fileList[0].webkitRelativePath;
        const parts = firstPath.split('/');
        return parts[0] + '/';
    }

    private async AddFolderToZip(zip: unknown, folderUri: URI, zipPath: string): Promise<void>
    {
        const entries = await this.sFile.ReadDir(folderUri);
        for (const entry of entries)
        {
            const entryUri = URI.JoinPath(folderUri, entry);
            const stat = await this.sFile.Stat(entryUri);
            const entryZipPath = zipPath ? `${zipPath}/${entry}` : entry;

            if (stat.type === EMFileType.Directory)
            {
                (zip as { folder: (path: string) => unknown }).folder(entryZipPath);
                await this.AddFolderToZip(zip, entryUri, entryZipPath);
            }
            else
            {
                const data = await this.sFile.ReadFile(entryUri);
                if (data !== null)
                {
                    (zip as { file: (path: string, data: Uint8Array) => unknown }).file(entryZipPath, data);
                }
            }
        }
    }
}

export type IResourcePackageData =
{
    [K in keyof ResourcePackageData]: ResourcePackageData[K];
};
