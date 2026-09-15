import { URI } from '@/Core/Module/String_DLL/URI';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import {
    EMResourceType, SUBSTRATE_FOLDER, type IResourceHandler, type IResourceContext,
    type ITreeNode, EMTreeNodeType
} from '../Types';
import { EMSubstrateType, type ISubstrateItem, type TSubstrateSpriteSlot } from './TypeSubstrate';

/**
 * 基底资源处理器
 * 负责 Substrate 下基底数据的读写与树形结构生成。
 */
export default class SubstrateResourceHandler implements IResourceHandler
{
    public readonly ResourceType: EMResourceType = EMResourceType.Substrate;
    public readonly FolderName: string = SUBSTRATE_FOLDER;
    public readonly DisplayName: string = '基底';

    public substrateNameList: string[];
    private itemMap: Map<string, ISubstrateItem>;
    private spriteMap: Map<string, Uint8Array | null>;
    private thumbnailImageMap: Map<string, Uint8Array | null>;

    public constructor()
    {
        this.substrateNameList = [];
        this.itemMap = new Map();
        this.spriteMap = new Map();
        this.thumbnailImageMap = new Map();
    }

    public AddSubstrate(substrateName: string): void
    {
        if (this.substrateNameList.includes(substrateName) === false)
        {
            this.substrateNameList.push(substrateName);
            const item: ISubstrateItem = {
                name: substrateName,
                type: EMSubstrateType.Texture,
                nameKey: '',
                descriptionKey: '',
                thumbnail: 'image.png',
                topView: { width: 0, height: 0, image: 'top.png' },
                frontView: { width: 0, height: 0, image: 'front.png' }
            };
            this.itemMap.set(substrateName, item);
        }
    }

    public async RemoveSubstrate(substrateName: string, context: IResourceContext): Promise<void>
    {
        const index = this.substrateNameList.indexOf(substrateName);
        if (index !== -1)
        {
            this.substrateNameList.splice(index, 1);
        }
        this.itemMap.delete(substrateName);
        this.thumbnailImageMap.delete(substrateName);

        for (const key of this.spriteMap.keys())
        {
            if (key.startsWith(`${substrateName}/`))
            {
                this.spriteMap.delete(key);
            }
        }

        const substrateUri = URI.JoinPath(context.workUri, SUBSTRATE_FOLDER, substrateName);
        if (await context.sFile.Exists(substrateUri))
        {
            // ClearDir 内部会删除目录本身
            await this.ClearDir(substrateUri, context);
        }
    }

    public GetItem(substrateName: string): ISubstrateItem | undefined
    {
        return this.itemMap.get(substrateName);
    }

    public SetItem(substrateName: string, item: ISubstrateItem): void
    {
        this.itemMap.set(substrateName, item);
    }

    public GetSprite(substrateName: string, slot: TSubstrateSpriteSlot): Uint8Array | null | undefined
    {
        const key = this.GetSpriteKey(substrateName, slot);
        if (slot === 'thumbnail')
        {
            return this.thumbnailImageMap.get(substrateName);
        }
        return this.spriteMap.get(key);
    }

    public SetSprite(substrateName: string, slot: TSubstrateSpriteSlot, data: Uint8Array | null): void
    {
        if (slot === 'thumbnail')
        {
            this.thumbnailImageMap.set(substrateName, data);
            return;
        }
        const key = this.GetSpriteKey(substrateName, slot);
        this.spriteMap.set(key, data);
    }

    public GetThumbnailImage(substrateName: string): Uint8Array | null | undefined
    {
        return this.thumbnailImageMap.get(substrateName);
    }

    public SetThumbnailImage(substrateName: string, data: Uint8Array | null): void
    {
        this.thumbnailImageMap.set(substrateName, data);
    }

    public async Load(context: IResourceContext): Promise<void>
    {
        this.Clear();

        const substrateFolderUri = URI.JoinPath(context.workUri, SUBSTRATE_FOLDER);
        if (await context.sFile.Exists(substrateFolderUri) === false)
        {
            return;
        }

        const substrateDirList = await context.sFile.ReadDir(substrateFolderUri);
        for (const substrateName of substrateDirList)
        {
            const substrateUri = URI.JoinPath(substrateFolderUri, substrateName);
            const itemUri = URI.JoinPath(substrateUri, 'item.json');

            if (await context.sFile.Exists(itemUri))
            {
                const data = await context.sFile.ReadFile(itemUri);
                if (data !== null)
                {
                    const item = JSON.parse(new TextDecoder().decode(data)) as ISubstrateItem;
                    this.itemMap.set(substrateName, this.NormalizeItem(item, substrateName));
                }
            }

            const imageUri = URI.JoinPath(substrateUri, 'image.png');
            if (await context.sFile.Exists(imageUri))
            {
                const imageData = await context.sFile.ReadFile(imageUri);
                if (imageData !== null)
                {
                    this.thumbnailImageMap.set(substrateName, imageData);
                }
            }

            const spriteFolderUri = URI.JoinPath(substrateUri, 'Sprite');
            if (await context.sFile.Exists(spriteFolderUri))
            {
                const spriteFileList = await context.sFile.ReadDir(spriteFolderUri);
                for (const fileName of spriteFileList)
                {
                    if (fileName.toLowerCase().endsWith('.png') === false)
                    {
                        continue;
                    }

                    const slot = fileName.slice(0, -4) as TSubstrateSpriteSlot;
                    if (slot !== 'top' && slot !== 'front')
                    {
                        continue;
                    }

                    const spriteUri = URI.JoinPath(spriteFolderUri, fileName);
                    const spriteData = await context.sFile.ReadFile(spriteUri);
                    if (spriteData !== null)
                    {
                        this.spriteMap.set(`${substrateName}/${slot}`, spriteData);
                    }
                }
            }

            this.substrateNameList.push(substrateName);
        }
    }

    public async Save(context: IResourceContext): Promise<void>
    {
        for (const substrateName of this.substrateNameList)
        {
            const substrateUri = URI.JoinPath(context.workUri, SUBSTRATE_FOLDER, substrateName);
            await context.sFile.MKDir(substrateUri);

            const item = this.itemMap.get(substrateName);
            if (item !== undefined)
            {
                const itemUri = URI.JoinPath(substrateUri, 'item.json');
                await context.sFile.WriteFile(itemUri, JSON.stringify(item, null, 4));
            }

            const spriteFolderUri = URI.JoinPath(substrateUri, 'Sprite');
            await context.sFile.MKDir(spriteFolderUri);

            const slotSet = new Set<TSubstrateSpriteSlot>(['top', 'front']);
            const keysToDelete: string[] = [];

            for (const [key, data] of this.spriteMap)
            {
                const [keySubstrateName, keySlot] = key.split('/');
                if (keySubstrateName !== substrateName)
                {
                    continue;
                }

                const slot = keySlot as TSubstrateSpriteSlot;
                if (slotSet.has(slot) === false)
                {
                    keysToDelete.push(key);
                    const orphanSpriteUri = URI.JoinPath(spriteFolderUri, `${keySlot}.png`);
                    if (await context.sFile.Exists(orphanSpriteUri))
                    {
                        await context.sFile.RM(orphanSpriteUri);
                    }
                    continue;
                }

                if (data !== null && data !== undefined)
                {
                    const spriteUri = URI.JoinPath(spriteFolderUri, `${slot}.png`);
                    await context.sFile.WriteFile(spriteUri, data.buffer as SharedArrayBuffer);
                }
            }

            for (const key of keysToDelete)
            {
                this.spriteMap.delete(key);
            }

            const imageUri = URI.JoinPath(substrateUri, 'image.png');
            const image = this.GetThumbnailImage(substrateName);
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
            id: SUBSTRATE_FOLDER,
            type: EMTreeNodeType.SubstrateFolder,
            resourceType: EMResourceType.Substrate,
            label: '基底',
            path: SUBSTRATE_FOLDER,
            children: []
        };

        for (const substrateName of this.substrateNameList)
        {
            const substrateNode: ITreeNode = {
                id: `${SUBSTRATE_FOLDER}/${substrateName}`,
                type: EMTreeNodeType.SubstrateItem,
                resourceType: EMResourceType.Substrate,
                label: substrateName,
                path: `${SUBSTRATE_FOLDER}/${substrateName}`,
                substrateName
            };
            folderNode.children!.push(substrateNode);
        }

        return [folderNode];
    }

    public Clear(): void
    {
        this.substrateNameList = [];
        this.itemMap.clear();
        this.spriteMap.clear();
        this.thumbnailImageMap.clear();
    }

    private GetSpriteKey(substrateName: string, slot: TSubstrateSpriteSlot): string
    {
        return `${substrateName}/${slot}`;
    }

    private NormalizeItem(item: ISubstrateItem, fallbackName: string): ISubstrateItem
    {
        return {
            name: item.name ?? fallbackName,
            type: typeof item.type === 'number' ? item.type : EMSubstrateType.Texture,
            nameKey: item.nameKey ?? '',
            descriptionKey: item.descriptionKey ?? '',
            thumbnail: item.thumbnail ?? 'image.png',
            topView: {
                width: item.topView?.width ?? 0,
                height: item.topView?.height ?? 0,
                image: item.topView?.image ?? 'top.png'
            },
            frontView: {
                width: item.frontView?.width ?? 0,
                height: item.frontView?.height ?? 0,
                image: item.frontView?.image ?? 'front.png'
            }
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
