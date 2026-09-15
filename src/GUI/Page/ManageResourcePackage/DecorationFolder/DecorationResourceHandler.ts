import { URI } from '@/Core/Module/String_DLL/URI';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import {
    EMResourceType, DECORATION_FOLDER, EMDecorationAnimationMode, EMDecorationCategory, type IResourceHandler, type IResourceContext,
    type ITreeNode, EMTreeNodeType, type IDecorationItem, type IDecorationPart, type IColliderData,
    type IDecorationColliderConfig, type IDecorationFrameAnimation, type IDecorationFrameData
} from '../Types';

/**
 * 装饰物资源处理器
 * 负责 DecorationFolder 下装饰物数据的读写与树形结构生成。
 */
export default class DecorationResourceHandler implements IResourceHandler
{
    public readonly ResourceType: EMResourceType = EMResourceType.Decoration;
    public readonly FolderName: string = DECORATION_FOLDER;
    public readonly DisplayName: string = '装饰物';

    public decorationNameList: string[];
    private itemMap: Map<string, IDecorationItem>;
    private spriteSheetMap: Map<string, Uint8Array | null>;
    private thumbnailImageMap: Map<string, Uint8Array | null>;

    public constructor()
    {
        this.decorationNameList = [];
        this.itemMap = new Map();
        this.spriteSheetMap = new Map();
        this.thumbnailImageMap = new Map();
    }

    public AddDecoration(decorationName: string): void
    {
        if (this.decorationNameList.includes(decorationName) === false)
        {
            this.decorationNameList.push(decorationName);
            const item: IDecorationItem = {
                name: decorationName,
                category: EMDecorationCategory.Plant,
                nameKey: '',
                descriptionKey: '',
                partList: []
            };
            this.itemMap.set(decorationName, item);
        }
    }

    public async RemoveDecoration(decorationName: string, context: IResourceContext): Promise<void>
    {
        const index = this.decorationNameList.indexOf(decorationName);
        if (index !== -1)
        {
            this.decorationNameList.splice(index, 1);
        }
        this.itemMap.delete(decorationName);
        this.spriteSheetMap.delete(decorationName);

        const decorationUri = URI.JoinPath(context.workUri, DECORATION_FOLDER, decorationName);
        if (await context.sFile.Exists(decorationUri))
        {
            // ClearDir 内部会删除目录本身
            await this.ClearDir(decorationUri, context);
        }
    }

    public GetItem(decorationName: string): IDecorationItem | undefined
    {
        return this.itemMap.get(decorationName);
    }

    public SetItem(decorationName: string, item: IDecorationItem): void
    {
        this.itemMap.set(decorationName, item);
    }

    public GetPart(decorationName: string, partID: string): IDecorationPart | undefined
    {
        const item = this.itemMap.get(decorationName);
        return item?.partList.find(p => p.id === partID);
    }

    public SetPart(decorationName: string, partID: string, part: IDecorationPart): void
    {
        const item = this.itemMap.get(decorationName);
        if (item === undefined)
        {
            return;
        }

        const index = item.partList.findIndex(p => p.id === partID);
        if (index !== -1)
        {
            item.partList[index] = part;
        }
    }

    public AddPart(decorationName: string, part: IDecorationPart): void
    {
        const item = this.itemMap.get(decorationName);
        if (item === undefined)
        {
            return;
        }

        if (item.partList.some(p => p.id === part.id) === false)
        {
            item.partList.push(part);
        }
    }

    public RemovePart(decorationName: string, partID: string): void
    {
        const item = this.itemMap.get(decorationName);
        if (item === undefined)
        {
            return;
        }

        const index = item.partList.findIndex(p => p.id === partID);
        if (index !== -1)
        {
            item.partList.splice(index, 1);
        }
    }

    public GetSpriteSheet(decorationName: string, partID: string): Uint8Array | null | undefined
    {
        const key = `${decorationName}/${partID}`;
        return this.spriteSheetMap.get(key);
    }

    public SetSpriteSheet(decorationName: string, partID: string, data: Uint8Array | null): void
    {
        const key = `${decorationName}/${partID}`;
        this.spriteSheetMap.set(key, data);
    }

    public GetThumbnailImage(decorationName: string): Uint8Array | null | undefined
    {
        return this.thumbnailImageMap.get(decorationName);
    }

    public SetThumbnailImage(decorationName: string, data: Uint8Array | null): void
    {
        this.thumbnailImageMap.set(decorationName, data);
    }

    public async Load(context: IResourceContext): Promise<void>
    {
        this.Clear();

        const decorationFolderUri = URI.JoinPath(context.workUri, DECORATION_FOLDER);
        if (await context.sFile.Exists(decorationFolderUri) === false)
        {
            return;
        }

        const decorationDirList = await context.sFile.ReadDir(decorationFolderUri);
        for (const decorationName of decorationDirList)
        {
            const decorationUri = URI.JoinPath(decorationFolderUri, decorationName);
            const itemUri = URI.JoinPath(decorationUri, 'item.json');

            if (await context.sFile.Exists(itemUri))
            {
                const data = await context.sFile.ReadFile(itemUri);
                if (data !== null)
                {
                    const item = JSON.parse(new TextDecoder().decode(data)) as IDecorationItem;
                    this.itemMap.set(decorationName, this.NormalizeItem(item, decorationName));
                }
            }

            const imageUri = URI.JoinPath(decorationUri, 'image.png');
            if (await context.sFile.Exists(imageUri))
            {
                const imageData = await context.sFile.ReadFile(imageUri);
                if (imageData !== null)
                {
                    this.thumbnailImageMap.set(decorationName, imageData);
                }
            }

            const spriteFolderUri = URI.JoinPath(decorationUri, 'Sprite');
            if (await context.sFile.Exists(spriteFolderUri))
            {
                const spriteFileList = await context.sFile.ReadDir(spriteFolderUri);
                for (const fileName of spriteFileList)
                {
                    if (fileName.toLowerCase().endsWith('.png') === false)
                    {
                        continue;
                    }

                    const partID = fileName.slice(0, -4);
                    const spriteUri = URI.JoinPath(spriteFolderUri, fileName);
                    const spriteData = await context.sFile.ReadFile(spriteUri);
                    if (spriteData !== null)
                    {
                        this.spriteSheetMap.set(`${decorationName}/${partID}`, spriteData);
                    }
                }
            }

            this.decorationNameList.push(decorationName);
        }
    }

    public async Save(context: IResourceContext): Promise<void>
    {
        for (const decorationName of this.decorationNameList)
        {
            const decorationUri = URI.JoinPath(context.workUri, DECORATION_FOLDER, decorationName);
            await context.sFile.MKDir(decorationUri);

            const item = this.itemMap.get(decorationName);
            if (item !== undefined)
            {
                const itemUri = URI.JoinPath(decorationUri, 'item.json');
                await context.sFile.WriteFile(itemUri, JSON.stringify(item, null, 4));
            }

            const spriteFolderUri = URI.JoinPath(decorationUri, 'Sprite');
            await context.sFile.MKDir(spriteFolderUri);

            const itemForSprites = this.itemMap.get(decorationName);
            const partIDSet = new Set(itemForSprites?.partList.map(p => p.id) ?? []);
            const keysToDelete: string[] = [];

            for (const [key, data] of this.spriteSheetMap)
            {
                const [keyDecorationName, keyPartID] = key.split('/');
                if (keyDecorationName !== decorationName)
                {
                    continue;
                }

                if (partIDSet.has(keyPartID) === false)
                {
                    keysToDelete.push(key);
                    const orphanSpriteUri = URI.JoinPath(spriteFolderUri, `${keyPartID}.png`);
                    if (await context.sFile.Exists(orphanSpriteUri))
                    {
                        await context.sFile.RM(orphanSpriteUri);
                    }
                    continue;
                }

                if (data !== null && data !== undefined)
                {
                    const spriteUri = URI.JoinPath(spriteFolderUri, `${keyPartID}.png`);
                    await context.sFile.WriteFile(spriteUri, data.buffer as SharedArrayBuffer);
                }
            }

            for (const key of keysToDelete)
            {
                this.spriteSheetMap.delete(key);
            }

            const imageUri = URI.JoinPath(decorationUri, 'image.png');
            const image = this.GetThumbnailImage(decorationName);
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
            id: DECORATION_FOLDER,
            type: EMTreeNodeType.DecorationFolder,
            resourceType: EMResourceType.Decoration,
            label: '装饰物',
            path: DECORATION_FOLDER,
            children: []
        };

        for (const decorationName of this.decorationNameList)
        {
            const item = this.itemMap.get(decorationName);
            const partNodeList: ITreeNode[] = [];

            for (const part of item?.partList ?? [])
            {
                partNodeList.push({
                    id: `${DECORATION_FOLDER}/${decorationName}/part/${part.id}`,
                    type: EMTreeNodeType.DecorationPart,
                    resourceType: EMResourceType.Decoration,
                    label: `${part.name} (z=${part.zIndex})`,
                    path: `${DECORATION_FOLDER}/${decorationName}/part/${part.id}`,
                    decorationName,
                    partID: part.id
                });
            }

            const decorationNode: ITreeNode = {
                id: `${DECORATION_FOLDER}/${decorationName}`,
                type: EMTreeNodeType.DecorationItem,
                resourceType: EMResourceType.Decoration,
                label: decorationName,
                path: `${DECORATION_FOLDER}/${decorationName}`,
                decorationName,
                children: [
                    ...partNodeList,
                    {
                        id: `${DECORATION_FOLDER}/${decorationName}/sprite`,
                        type: EMTreeNodeType.DecorationSpriteFolder,
                        resourceType: EMResourceType.Decoration,
                        label: '精灵图资源',
                        path: `${DECORATION_FOLDER}/${decorationName}/sprite`,
                        decorationName
                    }
                ]
            };
            folderNode.children!.push(decorationNode);
        }

        return [folderNode];
    }

    public Clear(): void
    {
        this.decorationNameList = [];
        this.itemMap.clear();
        this.spriteSheetMap.clear();
        this.thumbnailImageMap.clear();
    }

    private NormalizeItem(item: IDecorationItem, fallbackName: string): IDecorationItem
    {
        return {
            name: item.name ?? fallbackName,
            category: item.category ?? EMDecorationCategory.Plant,
            nameKey: item.nameKey ?? '',
            descriptionKey: item.descriptionKey ?? '',
            partList: (item.partList ?? []).map(part =>
            {
                const legacyPart = part as IDecorationPart & { collider?: IColliderData };
                const rawColliderList = (legacyPart.colliderList ?? (legacyPart.collider !== undefined ? [legacyPart.collider] : [])) as unknown[];
                // 旧格式元素是裸形状数据，包装为带 id 的配置
                const colliderList = rawColliderList.map(c =>
                {
                    const config = c as IDecorationColliderConfig;
                    if (config.id !== undefined && config.collider !== undefined) return config;
                    return { id: this.GenerateID(), collider: c as IColliderData };
                });
                return {
                    id: part.id ?? this.GenerateID(),
                    name: part.name ?? '未命名部件',
                    zIndex: part.zIndex ?? 0,
                    sprite: part.sprite,
                    animationMode: part.animationMode ?? EMDecorationAnimationMode.None,
                    tweenAnimation: part.tweenAnimation,
                    frameAnimation: this.NormalizeFrameAnimation(part.frameAnimation),
                    colliderList,
                    areaList: part.areaList ?? []
                };
            })
        };
    }

    private NormalizeFrameAnimation(animation: IDecorationFrameAnimation | undefined): IDecorationFrameAnimation | undefined
    {
        if (animation === undefined) return undefined;
        return {
            ...animation,
            frameList: (animation.frameList ?? []).map(frame =>
            {
                const legacyFrame = frame as IDecorationFrameData & { colliderList?: unknown };
                delete legacyFrame.colliderList;
                return {
                    colliderOverrideList: frame.colliderOverrideList ?? [],
                    areaOverrideList: frame.areaOverrideList ?? []
                };
            })
        };
    }

    private GenerateID(): string
    {
        return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
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
