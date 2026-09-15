import { URI } from '@/Core/Module/String_DLL/URI';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import {
    EMResourceType, GLASS_FOLDER, type IResourceHandler, type IResourceContext,
    type ITreeNode, EMTreeNodeType
} from '../Types';
import {
    EMGlassPartType, EMGlassTextureMode, CreateDefaultGlassStyleItem,
    type IGlassStyleItem, type TGlassPartKey, type TGlassTextureSlot
} from './TypeGlass';

/**
 * 玻璃样式资源处理器
 * 负责 Glass 下玻璃样式数据的读写与树形结构生成。
 */
export default class GlassResourceHandler implements IResourceHandler
{
    public readonly ResourceType: EMResourceType = EMResourceType.Glass;
    public readonly FolderName: string = GLASS_FOLDER;
    public readonly DisplayName: string = '玻璃样式';

    public styleNameList: string[];
    private itemMap: Map<string, IGlassStyleItem>;
    private textureMap: Map<string, Uint8Array | null>;
    private thumbnailImageMap: Map<string, Uint8Array | null>;

    public constructor()
    {
        this.styleNameList = [];
        this.itemMap = new Map();
        this.textureMap = new Map();
        this.thumbnailImageMap = new Map();
    }

    public AddGlass(styleName: string): void
    {
        if (this.styleNameList.includes(styleName) === false)
        {
            this.styleNameList.push(styleName);
            this.itemMap.set(styleName, CreateDefaultGlassStyleItem(styleName));
        }
    }

    public async RemoveGlass(styleName: string, context: IResourceContext): Promise<void>
    {
        const index = this.styleNameList.indexOf(styleName);
        if (index !== -1)
        {
            this.styleNameList.splice(index, 1);
        }
        this.itemMap.delete(styleName);
        this.thumbnailImageMap.delete(styleName);

        for (const key of this.textureMap.keys())
        {
            if (key.startsWith(`${styleName}/`))
            {
                this.textureMap.delete(key);
            }
        }

        const styleUri = URI.JoinPath(context.workUri, GLASS_FOLDER, styleName);
        if (await context.sFile.Exists(styleUri))
        {
            // ClearDir 内部会删除目录本身
            await this.ClearDir(styleUri, context);
        }
    }

    public GetItem(styleName: string): IGlassStyleItem | undefined
    {
        return this.itemMap.get(styleName);
    }

    public SetItem(styleName: string, item: IGlassStyleItem): void
    {
        this.itemMap.set(styleName, item);
    }

    public GetTexture(styleName: string, slot: TGlassTextureSlot): Uint8Array | null | undefined
    {
        return this.textureMap.get(`${styleName}/${slot}`);
    }

    public SetTexture(styleName: string, slot: TGlassTextureSlot, data: Uint8Array | null): void
    {
        this.textureMap.set(`${styleName}/${slot}`, data);
    }

    public GetThumbnailImage(styleName: string): Uint8Array | null | undefined
    {
        return this.thumbnailImageMap.get(styleName);
    }

    public SetThumbnailImage(styleName: string, data: Uint8Array | null): void
    {
        this.thumbnailImageMap.set(styleName, data);
    }

    public async Load(context: IResourceContext): Promise<void>
    {
        this.Clear();

        const glassFolderUri = URI.JoinPath(context.workUri, GLASS_FOLDER);
        if (await context.sFile.Exists(glassFolderUri) === false)
        {
            return;
        }

        const styleDirList = await context.sFile.ReadDir(glassFolderUri);
        for (const styleName of styleDirList)
        {
            const styleUri = URI.JoinPath(glassFolderUri, styleName);
            const itemUri = URI.JoinPath(styleUri, 'item.json');

            if (await context.sFile.Exists(itemUri))
            {
                const data = await context.sFile.ReadFile(itemUri);
                if (data !== null)
                {
                    const item = JSON.parse(new TextDecoder().decode(data)) as IGlassStyleItem;
                    this.itemMap.set(styleName, this.NormalizeItem(item, styleName));
                }
            }

            const imageUri = URI.JoinPath(styleUri, 'image.png');
            if (await context.sFile.Exists(imageUri))
            {
                const imageData = await context.sFile.ReadFile(imageUri);
                if (imageData !== null)
                {
                    this.thumbnailImageMap.set(styleName, imageData);
                }
            }

            const spriteFolderUri = URI.JoinPath(styleUri, 'Sprite');
            if (await context.sFile.Exists(spriteFolderUri))
            {
                const spriteFileList = await context.sFile.ReadDir(spriteFolderUri);
                for (const fileName of spriteFileList)
                {
                    if (fileName.toLowerCase().endsWith('.png') === false)
                    {
                        continue;
                    }

                    const slot = fileName.slice(0, -4) as TGlassTextureSlot;
                    const validSlotList: TGlassTextureSlot[] = [
                        'LeftSurface', 'BackSurface', 'FrontSurface', 'RightSurface',
                        'BottomSurface', 'GlassEdge'
                    ];
                    if (validSlotList.includes(slot) === false)
                    {
                        continue;
                    }

                    const textureUri = URI.JoinPath(spriteFolderUri, fileName);
                    const textureData = await context.sFile.ReadFile(textureUri);
                    if (textureData !== null)
                    {
                        this.textureMap.set(`${styleName}/${slot}`, textureData);
                    }
                }
            }

            this.styleNameList.push(styleName);
        }
    }

    public async Save(context: IResourceContext): Promise<void>
    {
        for (const styleName of this.styleNameList)
        {
            const styleUri = URI.JoinPath(context.workUri, GLASS_FOLDER, styleName);
            await context.sFile.MKDir(styleUri);

            const item = this.itemMap.get(styleName);
            if (item !== undefined)
            {
                const itemUri = URI.JoinPath(styleUri, 'item.json');
                await context.sFile.WriteFile(itemUri, JSON.stringify(item, null, 4));
            }

            const spriteFolderUri = URI.JoinPath(styleUri, 'Sprite');
            await context.sFile.MKDir(spriteFolderUri);

            const slotSet = new Set<TGlassTextureSlot>([
                'LeftSurface', 'BackSurface', 'FrontSurface', 'RightSurface',
                'BottomSurface', 'GlassEdge'
            ]);
            const keysToDelete: string[] = [];

            for (const [key, data] of this.textureMap)
            {
                const [keyStyleName, keySlot] = key.split('/');
                if (keyStyleName !== styleName)
                {
                    continue;
                }

                const slot = keySlot as TGlassTextureSlot;
                if (slotSet.has(slot) === false)
                {
                    keysToDelete.push(key);
                    const orphanTextureUri = URI.JoinPath(spriteFolderUri, `${keySlot}.png`);
                    if (await context.sFile.Exists(orphanTextureUri))
                    {
                        await context.sFile.RM(orphanTextureUri);
                    }
                    continue;
                }

                const textureUri = URI.JoinPath(spriteFolderUri, `${slot}.png`);
                if (data !== null && data !== undefined)
                {
                    await context.sFile.WriteFile(textureUri, data.buffer as SharedArrayBuffer);
                }
                else if (await context.sFile.Exists(textureUri))
                {
                    await context.sFile.RM(textureUri);
                }
            }

            for (const key of keysToDelete)
            {
                this.textureMap.delete(key);
            }

            const imageUri = URI.JoinPath(styleUri, 'image.png');
            const image = this.GetThumbnailImage(styleName);
            if (image !== null && image !== undefined)
            {
                await context.sFile.WriteFile(imageUri, image.buffer as SharedArrayBuffer);
            }
            else if (await context.sFile.Exists(imageUri))
            {
                await context.sFile.RM(imageUri);
            }
        }
    }

    public GetTreeNodes(): ITreeNode[]
    {
        const folderNode: ITreeNode = {
            id: GLASS_FOLDER,
            type: EMTreeNodeType.GlassFolder,
            resourceType: EMResourceType.Glass,
            label: '玻璃样式',
            path: GLASS_FOLDER,
            children: []
        };

        for (const styleName of this.styleNameList)
        {
            const styleNode: ITreeNode = {
                id: `${GLASS_FOLDER}/${styleName}`,
                type: EMTreeNodeType.GlassItem,
                resourceType: EMResourceType.Glass,
                label: styleName,
                path: `${GLASS_FOLDER}/${styleName}`,
                glassName: styleName
            };
            folderNode.children!.push(styleNode);
        }

        return [folderNode];
    }

    public Clear(): void
    {
        this.styleNameList = [];
        this.itemMap.clear();
        this.textureMap.clear();
        this.thumbnailImageMap.clear();
    }

    private NormalizeItem(item: IGlassStyleItem, fallbackName: string): IGlassStyleItem
    {
        const defaultItem = CreateDefaultGlassStyleItem(fallbackName);
        const partMap = { ...defaultItem.partMap };

        if (item.partMap !== undefined)
        {
            for (const key of Object.keys(partMap) as TGlassPartKey[])
            {
                const part = item.partMap[key];
                if (part === undefined)
                {
                    continue;
                }

                partMap[key] = {
                    type: typeof part.type === 'number' ? part.type : EMGlassPartType.Color,
                    color: part.color ?? defaultItem.partMap[key].color,
                    alpha: typeof part.alpha === 'number' ? part.alpha : defaultItem.partMap[key].alpha,
                    textureImage: part.textureImage ?? defaultItem.partMap[key].textureImage,
                    textureMode: typeof part.textureMode === 'number' ? part.textureMode : EMGlassTextureMode.Stretch
                };
            }
        }

        return {
            name: item.name ?? fallbackName,
            nameKey: item.nameKey ?? '',
            descriptionKey: item.descriptionKey ?? '',
            thumbnail: item.thumbnail ?? 'image.png',
            partMap
        };
    }

    private async ClearDir(uri: URI, context: IResourceContext): Promise<void>
    {
        if (await context.sFile.Exists(uri) === false)
        {
            return;
        }

        const dirList = await context.sFile.ReadDir(uri);
        for (const name of dirList)
        {
            const entryUri = uri.With({ path: uri.path + '/' + name });
            const stat = await context.sFile.Stat(entryUri);
            if (stat.type === EMFileType.Directory)
            {
                await this.ClearDir(entryUri, context);
            }
            else
            {
                await context.sFile.RM(entryUri);
            }
        }

        await context.sFile.RMDir(uri);
    }
}
