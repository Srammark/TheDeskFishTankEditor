import { URI } from '@/Core/Module/String_DLL/URI';
import { EMFileType } from '@/Core/IOC_DLL/Interface/File/IFileSystem';
import {
    EMResourceType, CREATURE_FOLDER, STRAIN_FOLDER, MS_PER_DAY, type IResourceHandler, type IResourceContext,
    type ITreeNode, EMTreeNodeType, type ISpeciesDescription, type IStrainDescription,
    type ICreatureItem, type ICreatureItemBase, type TSpeciesCategory,
    type IFishItem, type IShrimpItem, type ICrabItem, type ISnailItem, type IBivalveItem,
    EMSwimMode,
    type TSpriteSize, type TSpriteAction, type TSexFolder, type ISizeConfig, type IFrameData, type IActionData, type IColliderData, type TColliderSlot,
    SpeciesCategoryOptionList
} from '../Types';
import * as SpriteSheetUtil from '../SpriteSheetUtil';

/**
 * 生物资源处理器
 * 目录结构：CreatureFolder/{Category}/{SpeciesName}/StrainFolder/{StrainName}/{Male|Female|Fry}/...
 * 内部使用 `${category}/${speciesName}` 作为物种 key。
 */
export default class CreatureResourceHandler implements IResourceHandler
{
    public readonly ResourceType: EMResourceType = EMResourceType.Creature;
    public readonly FolderName: string = CREATURE_FOLDER;
    public readonly DisplayName: string = '生物';

    /** 物种 key 列表，格式 `${category}/${speciesName}` */
    public speciesKeyList: string[];
    private speciesDescMap: Map<string, ISpeciesDescription>;
    private strainNameListMap: Map<string, string[]>;
    private strainDescMap: Map<string, IStrainDescription>;
    private itemMap: Map<string, ICreatureItem>;
    private spriteSheetMap: Map<string, Uint8Array | null>;
    private spriteConfigMap: Map<string, ISizeConfig>;
    private strainImageMap: Map<string, Uint8Array | null>;

    public constructor()
    {
        this.speciesKeyList = [];
        this.speciesDescMap = new Map();
        this.strainNameListMap = new Map();
        this.strainDescMap = new Map();
        this.itemMap = new Map();
        this.spriteSheetMap = new Map();
        this.spriteConfigMap = new Map();
        this.strainImageMap = new Map();
    }

    // #region Key helpers

    private BuildSpeciesKey(category: TSpeciesCategory, speciesName: string): string
    {
        return `${category}/${speciesName}`;
    }

    public GetSpeciesCategory(speciesKey: string): TSpeciesCategory
    {
        const index = speciesKey.indexOf('/');
        return speciesKey.substring(0, index) as TSpeciesCategory;
    }

    public GetSpeciesName(speciesKey: string): string
    {
        const index = speciesKey.indexOf('/');
        return speciesKey.substring(index + 1);
    }

    // #endregion

    // #region Species

    public GetSpeciesDesc(speciesKey: string): ISpeciesDescription | undefined
    {
        return this.speciesDescMap.get(speciesKey);
    }

    public SetSpeciesDesc(speciesKey: string, desc: ISpeciesDescription): void
    {
        this.speciesDescMap.set(speciesKey, desc);
    }

    public AddSpecies(category: TSpeciesCategory, speciesName: string): void
    {
        const key = this.BuildSpeciesKey(category, speciesName);
        if (this.speciesKeyList.includes(key) === false)
        {
            this.speciesKeyList.push(key);
            this.strainNameListMap.set(key, []);
            this.speciesDescMap.set(key, {
                scientificName: '',
                nameKey: '',
                wikiKey: '',
                category
            });
        }
    }

    public async RemoveSpecies(speciesKey: string, context: IResourceContext): Promise<void>
    {
        const index = this.speciesKeyList.indexOf(speciesKey);
        if (index !== -1)
        {
            this.speciesKeyList.splice(index, 1);
        }
        this.speciesDescMap.delete(speciesKey);
        this.strainNameListMap.delete(speciesKey);

        const prefix = `${speciesKey}/`;
        for (const key of this.itemMap.keys())
        {
            if (key.startsWith(prefix)) this.itemMap.delete(key);
        }
        for (const key of this.spriteSheetMap.keys())
        {
            if (key.startsWith(prefix)) this.spriteSheetMap.delete(key);
        }
        for (const key of this.spriteConfigMap.keys())
        {
            if (key.startsWith(prefix)) this.spriteConfigMap.delete(key);
        }
        for (const key of this.strainDescMap.keys())
        {
            if (key.startsWith(prefix)) this.strainDescMap.delete(key);
        }
        for (const key of this.strainImageMap.keys())
        {
            if (key.startsWith(prefix)) this.strainImageMap.delete(key);
        }

        const category = this.GetSpeciesCategory(speciesKey);
        const speciesName = this.GetSpeciesName(speciesKey);
        const speciesUri = URI.JoinPath(context.workUri, CREATURE_FOLDER, category, speciesName);
        if (await context.sFile.Exists(speciesUri))
        {
            // ClearDir 内部会删除目录本身
            await this.ClearDir(speciesUri, context);
        }
    }

    // #endregion

    // #region Strain

    public GetStrainNameList(speciesKey: string): string[]
    {
        return this.strainNameListMap.get(speciesKey) ?? [];
    }

    public GetStrainDesc(speciesKey: string, strainName: string): IStrainDescription | undefined
    {
        return this.strainDescMap.get(`${speciesKey}/${strainName}`);
    }

    public SetStrainDesc(speciesKey: string, strainName: string, desc: IStrainDescription): void
    {
        this.strainDescMap.set(`${speciesKey}/${strainName}`, desc);
    }

    public GetStrainImage(speciesKey: string, strainName: string): Uint8Array | null | undefined
    {
        return this.strainImageMap.get(`${speciesKey}/${strainName}`);
    }

    public SetStrainImage(speciesKey: string, strainName: string, data: Uint8Array | null): void
    {
        this.strainImageMap.set(`${speciesKey}/${strainName}`, data);
    }

    public AddStrain(speciesKey: string, strainName: string): void
    {
        const strainNameList = this.strainNameListMap.get(speciesKey) ?? [];
        if (strainNameList.includes(strainName) === false)
        {
            strainNameList.push(strainName);
            this.strainNameListMap.set(speciesKey, strainNameList);
        }

        const key = `${speciesKey}/${strainName}`;
        if (this.strainDescMap.has(key) === false)
        {
            const speciesDesc = this.speciesDescMap.get(speciesKey);
            this.strainDescMap.set(key, {
                scientificName: speciesDesc?.scientificName ?? '',
                nameKey: '',
                wikiKey: ''
            });
        }
    }

    public async RemoveStrain(speciesKey: string, strainName: string, context: IResourceContext): Promise<void>
    {
        const strainNameList = this.strainNameListMap.get(speciesKey) ?? [];
        const index = strainNameList.indexOf(strainName);
        if (index !== -1)
        {
            strainNameList.splice(index, 1);
            this.strainNameListMap.set(speciesKey, strainNameList);
        }

        const prefix = `${speciesKey}/${strainName}/`;
        for (const key of this.itemMap.keys())
        {
            if (key.startsWith(prefix)) this.itemMap.delete(key);
        }
        for (const key of this.spriteSheetMap.keys())
        {
            if (key.startsWith(prefix)) this.spriteSheetMap.delete(key);
        }
        for (const key of this.spriteConfigMap.keys())
        {
            if (key.startsWith(prefix)) this.spriteConfigMap.delete(key);
        }
        this.strainImageMap.delete(`${speciesKey}/${strainName}`);
        this.strainDescMap.delete(`${speciesKey}/${strainName}`);

        const category = this.GetSpeciesCategory(speciesKey);
        const speciesName = this.GetSpeciesName(speciesKey);
        const strainUri = URI.JoinPath(context.workUri, CREATURE_FOLDER, category, speciesName, STRAIN_FOLDER, strainName);
        if (await context.sFile.Exists(strainUri))
        {
            // ClearDir 内部会删除目录本身
            await this.ClearDir(strainUri, context);
        }
    }

    // #endregion

    // #region Item

    public GetItem(speciesKey: string, strainName: string, sexName: TSexFolder): ICreatureItem | undefined
    {
        return this.itemMap.get(this.GetItemKey(speciesKey, strainName, sexName));
    }

    public SetItem(speciesKey: string, strainName: string, sexName: TSexFolder, item: ICreatureItem): void
    {
        this.itemMap.set(this.GetItemKey(speciesKey, strainName, sexName), item);
    }

    /** 按物种类别创建默认属性 */
    public CreateDefaultItem(category: TSpeciesCategory): ICreatureItem
    {
        const base: ICreatureItemBase = {
            speedLimit: 0,
            visualRadius: 0,
            stature: [[0, 0], [0, 0], [0, 0]],
            swimmingLevel: [0, 1],
            gregariousness: 0,
            idealGroupSize: 1,
            aggression: 0,
            territoriality: 0,
            diet: 'Omnivore',
            metabolism: 0,
            stressSensitivity: 0,
            alertness: 0,
            reproduction: 'Oviparous',
            temperature: [20, 26],
            lifespan: 0,
            matureAge: 0,
            litterSize: [1, 1],
            hatchTime: 0,
            gestationTime: 0,
            dayNightHabit: 'Diurnal'
        };

        switch (category)
        {
            case 'Shrimp':
                return { ...base, moltCycle: 30 * MS_PER_DAY, moltVulnerabilityDuration: MS_PER_DAY } as IShrimpItem;
            case 'Crab':
                return { ...base, moltCycle: 30 * MS_PER_DAY, moltVulnerabilityDuration: MS_PER_DAY } as ICrabItem;
            case 'Snail':
                return base as ISnailItem;
            case 'Bivalve':
                return { ...base, filterRate: 1 } as IBivalveItem;
            default:
                return { ...base, swimMode: EMSwimMode.Subcarangiform } as IFishItem;
        }
    }

    // #endregion

    // #region Sprite

    public GetSpriteSheet(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): Uint8Array | null | undefined
    {
        return this.spriteSheetMap.get(this.GetSpriteSheetKey(speciesKey, strainName, sexName, sizeName));
    }

    public SetSpriteSheet(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, data: Uint8Array | null): void
    {
        this.spriteSheetMap.set(this.GetSpriteSheetKey(speciesKey, strainName, sexName, sizeName), data);
    }

    public GetSizeConfig(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): ISizeConfig | undefined
    {
        return this.spriteConfigMap.get(this.GetSpriteSheetKey(speciesKey, strainName, sexName, sizeName));
    }

    public SetSizeConfig(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, config: ISizeConfig): void
    {
        this.spriteConfigMap.set(this.GetSpriteSheetKey(speciesKey, strainName, sexName, sizeName), config);
    }

    public GetFrameData(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number): IFrameData | undefined
    {
        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        return config?.actionList[actionName]?.frameList[frameIndex];
    }

    public SetFrameData(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number, frameData: IFrameData): void
    {
        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        if (config === undefined) return;
        config.actionList[actionName].frameList[frameIndex] = frameData;
    }

    public EnsureSizeConfig(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): ISizeConfig
    {
        let config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        if (config === undefined)
        {
            config = this.CreateDefaultSizeConfig();
            this.SetSizeConfig(speciesKey, strainName, sexName, sizeName, config);
        }
        return config;
    }

    public AddFrame(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction): void
    {
        const config = this.EnsureSizeConfig(speciesKey, strainName, sexName, sizeName);
        config.actionList[actionName].frameList.push({
            colliderOverride: {}
        });
    }

    public RemoveFrame(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, frameIndex: number): void
    {
        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        if (config === undefined) return;
        config.actionList[actionName].frameList.splice(frameIndex, 1);
    }

    /** 将源帧所有碰撞体的有效形状应用到全部帧（设为基础形状并清空帧级覆盖） */
    public CopyColliderToAllFrames(
        speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize,
        actionName: TSpriteAction, sourceFrameIndex: number
    ): void
    {
        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        if (config === undefined) return;
        const action = config.actionList[actionName];
        const slotList: TColliderSlot[] = ['body', 'mouth'];
        for (const slot of slotList)
        {
            const shape = this.GetEffectiveCollider(action, sourceFrameIndex, slot);
            action.collider[slot] = shape === null ? null : JSON.parse(JSON.stringify(shape)) as IColliderData;
            for (const frame of action.frameList)
            {
                delete frame.colliderOverride[slot];
            }
        }
    }

    /** 将源帧所有碰撞体的有效形状复制到相邻帧（目标为第 1 帧时写入基础形状，否则写入帧级覆盖） */
    public CopyColliderToAdjacentFrame(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, actionName: TSpriteAction, sourceFrameIndex: number, direction: -1 | 1): void
    {
        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);
        if (config === undefined) return;
        const action = config.actionList[actionName];
        const targetIndex = sourceFrameIndex + direction;
        if (targetIndex < 0 || targetIndex >= action.frameList.length) return;
        const targetFrame = action.frameList[targetIndex];
        const slotList: TColliderSlot[] = ['body', 'mouth'];
        for (const slot of slotList)
        {
            const shape = this.GetEffectiveCollider(action, sourceFrameIndex, slot);
            if (targetIndex === 0)
            {
                action.collider[slot] = shape === null ? null : JSON.parse(JSON.stringify(shape)) as IColliderData;
                delete targetFrame.colliderOverride[slot];
            }
            else if (this.IsColliderEqual(shape, action.collider[slot]))
            {
                // 与基础形状一致则不需要覆盖
                delete targetFrame.colliderOverride[slot];
            }
            else
            {
                targetFrame.colliderOverride[slot] = JSON.parse(JSON.stringify(shape)) as IColliderData;
            }
        }
    }

    /** 取某帧碰撞体的有效形状（帧级覆盖优先，其次动作级基础形状） */
    private GetEffectiveCollider(action: IActionData, frameIndex: number, slot: TColliderSlot): IColliderData | null
    {
        return action.frameList[frameIndex]?.colliderOverride[slot] ?? action.collider[slot];
    }

    private IsColliderEqual(a: IColliderData | null, b: IColliderData | null): boolean
    {
        if (a === null || b === null) return a === b;
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // #endregion

    // #region Load / Save

    public async Load(context: IResourceContext): Promise<void>
    {
        this.Clear();

        const rootUri = URI.JoinPath(context.workUri, CREATURE_FOLDER);
        if (await context.sFile.Exists(rootUri) === false)
        {
            return;
        }

        const categoryList: TSpeciesCategory[] = ['Fish', 'Shrimp', 'Crab', 'Snail', 'Bivalve'];
        for (const category of categoryList)
        {
            const categoryUri = URI.JoinPath(rootUri, category);
            if (await context.sFile.Exists(categoryUri) === false)
            {
                continue;
            }

            const speciesDirList = await context.sFile.ReadDir(categoryUri);
            for (const speciesName of speciesDirList)
            {
                const speciesKey = this.BuildSpeciesKey(category, speciesName);
                const speciesUri = URI.JoinPath(categoryUri, speciesName);
                const speciesDescUri = URI.JoinPath(speciesUri, 'speciesDescription.json');

                let desc: ISpeciesDescription = { scientificName: '', nameKey: '', wikiKey: '', category };
                if (await context.sFile.Exists(speciesDescUri))
                {
                    const data = await context.sFile.ReadFile(speciesDescUri);
                    if (data !== null)
                    {
                        const parsed = JSON.parse(new TextDecoder().decode(data)) as Partial<ISpeciesDescription>;
                        desc = {
                            scientificName: parsed.scientificName ?? '',
                            nameKey: parsed.nameKey ?? '',
                            wikiKey: parsed.wikiKey ?? '',
                            category
                        };
                    }
                }
                this.speciesDescMap.set(speciesKey, desc);
                this.speciesKeyList.push(speciesKey);

                const strainFolderUri = URI.JoinPath(speciesUri, STRAIN_FOLDER);
                if (await context.sFile.Exists(strainFolderUri) === false)
                {
                    continue;
                }

                const strainDirList = await context.sFile.ReadDir(strainFolderUri);
                this.strainNameListMap.set(speciesKey, strainDirList);

                for (const strainName of strainDirList)
                {
                    await this.LoadStrain(context, speciesKey, category, strainFolderUri, strainName);
                }
            }
        }
    }

    private async LoadStrain(context: IResourceContext, speciesKey: string, category: TSpeciesCategory, strainFolderUri: URI, strainName: string): Promise<void>
    {
        const strainUri = URI.JoinPath(strainFolderUri, strainName);

        const strainJsonUri = URI.JoinPath(strainUri, 'strain.json');
        if (await context.sFile.Exists(strainJsonUri))
        {
            const strainJsonData = await context.sFile.ReadFile(strainJsonUri);
            if (strainJsonData !== null)
            {
                const strainDesc = JSON.parse(new TextDecoder().decode(strainJsonData)) as Partial<IStrainDescription>;
                this.SetStrainDesc(speciesKey, strainName, {
                    scientificName: strainDesc.scientificName ?? '',
                    nameKey: strainDesc.nameKey ?? '',
                    wikiKey: strainDesc.wikiKey ?? ''
                });
            }
        }

        const imageUri = URI.JoinPath(strainUri, 'image.png');
        if (await context.sFile.Exists(imageUri))
        {
            const imageData = await context.sFile.ReadFile(imageUri);
            if (imageData !== null)
            {
                this.SetStrainImage(speciesKey, strainName, imageData);
            }
        }

        const sexList: TSexFolder[] = ['Male', 'Female', 'Fry'];
        for (const sexName of sexList)
        {
            const sexUri = URI.JoinPath(strainUri, sexName);
            const itemUri = URI.JoinPath(sexUri, 'item.json');

            if (await context.sFile.Exists(itemUri))
            {
                const data = await context.sFile.ReadFile(itemUri);
                if (data !== null)
                {
                    const raw = JSON.parse(new TextDecoder().decode(data)) as Record<string, unknown>;
                    this.SetItem(speciesKey, strainName, sexName, this.ParseItem(category, raw));
                }
            }

            const spriteUri = URI.JoinPath(sexUri, 'Sprite');
            if (await context.sFile.Exists(spriteUri) === false)
            {
                continue;
            }

            const sizeList: TSpriteSize[] = ['Small', 'Medium', 'Large'];
            for (const sizeName of sizeList)
            {
                const pngUri = URI.JoinPath(spriteUri, `${sizeName}.png`);
                const jsonUri = URI.JoinPath(spriteUri, `${sizeName}.json`);

                if (await context.sFile.Exists(pngUri) && await context.sFile.Exists(jsonUri))
                {
                    const pngData = await context.sFile.ReadFile(pngUri);
                    const jsonData = await context.sFile.ReadFile(jsonUri);
                    if (pngData !== null && jsonData !== null)
                    {
                        this.SetSpriteSheet(speciesKey, strainName, sexName, sizeName, pngData);
                        const config = JSON.parse(new TextDecoder().decode(jsonData)) as ISizeConfig;
                        if (config.actionRowOrder === undefined)
                        {
                            config.actionRowOrder = ['idle', 'swim', 'eat'];
                        }
                        this.NormalizeSizeConfig(config);
                        this.SetSizeConfig(speciesKey, strainName, sexName, sizeName, config);
                    }
                }
                else
                {
                    await this.LoadOldFormatAndConvert(speciesKey, strainName, sexName, sizeName, spriteUri, context);
                }
            }
        }
    }

    /** 按物种类别从原始 JSON 解析属性，缺失字段用默认值补齐 */
    private ParseItem(category: TSpeciesCategory, raw: Record<string, unknown>): ICreatureItem
    {
        const item = this.CreateDefaultItem(category) as unknown as Record<string, unknown>;
        for (const key of Object.keys(item))
        {
            if (raw[key] !== undefined)
            {
                item[key] = raw[key];
            }
        }
        return item as unknown as ICreatureItem;
    }

    public async Save(context: IResourceContext): Promise<void>
    {
        for (const speciesKey of this.speciesKeyList)
        {
            const category = this.GetSpeciesCategory(speciesKey);
            const speciesName = this.GetSpeciesName(speciesKey);
            const speciesUri = URI.JoinPath(context.workUri, CREATURE_FOLDER, category, speciesName);
            await context.sFile.MKDir(speciesUri);

            const desc = this.speciesDescMap.get(speciesKey);
            if (desc !== undefined)
            {
                const speciesDescUri = URI.JoinPath(speciesUri, 'speciesDescription.json');
                await context.sFile.WriteFile(speciesDescUri, JSON.stringify(desc, null, 4));
            }

            const strainNameList = this.strainNameListMap.get(speciesKey) ?? [];
            const strainFolderUri = URI.JoinPath(speciesUri, STRAIN_FOLDER);
            await context.sFile.MKDir(strainFolderUri);

            for (const strainName of strainNameList)
            {
                const strainUri = URI.JoinPath(strainFolderUri, strainName);
                await context.sFile.MKDir(strainUri);

                const imageUri = URI.JoinPath(strainUri, 'image.png');
                const image = this.GetStrainImage(speciesKey, strainName);
                if (image !== null && image !== undefined)
                {
                    await context.sFile.WriteFile(imageUri, image.buffer as SharedArrayBuffer);
                }
                else if (await context.sFile.Exists(imageUri))
                {
                    await context.sFile.RM(imageUri);
                }

                const strainDesc = this.GetStrainDesc(speciesKey, strainName);
                const strainJsonUri = URI.JoinPath(strainUri, 'strain.json');
                if (strainDesc !== undefined)
                {
                    await context.sFile.WriteFile(strainJsonUri, JSON.stringify(strainDesc, null, 4));
                }
                else if (await context.sFile.Exists(strainJsonUri))
                {
                    await context.sFile.RM(strainJsonUri);
                }

                const sexList: TSexFolder[] = ['Male', 'Female', 'Fry'];
                for (const sexName of sexList)
                {
                    const sexUri = URI.JoinPath(strainUri, sexName);
                    await context.sFile.MKDir(sexUri);

                    const item = this.GetItem(speciesKey, strainName, sexName);
                    if (item !== undefined)
                    {
                        const itemUri = URI.JoinPath(sexUri, 'item.json');
                        await context.sFile.WriteFile(itemUri, JSON.stringify(item, null, 4));
                    }

                    const spriteUri = URI.JoinPath(sexUri, 'Sprite');
                    await context.sFile.MKDir(spriteUri);

                    const sizeList: TSpriteSize[] = ['Small', 'Medium', 'Large'];
                    for (const sizeName of sizeList)
                    {
                        const sheet = this.GetSpriteSheet(speciesKey, strainName, sexName, sizeName);
                        const config = this.GetSizeConfig(speciesKey, strainName, sexName, sizeName);

                        if (sheet !== null && sheet !== undefined && config !== undefined)
                        {
                            const pngUri = URI.JoinPath(spriteUri, `${sizeName}.png`);
                            const jsonUri = URI.JoinPath(spriteUri, `${sizeName}.json`);
                            await context.sFile.WriteFile(pngUri, sheet.buffer as SharedArrayBuffer);
                            await context.sFile.WriteFile(jsonUri, JSON.stringify(config, null, 4));
                        }

                        const oldSizeUri = URI.JoinPath(spriteUri, sizeName);
                        if (await context.sFile.Exists(oldSizeUri))
                        {
                            await this.ClearDir(oldSizeUri, context);
                            await context.sFile.RMDir(oldSizeUri);
                        }
                    }
                }
            }
        }
    }

    // #endregion

    // #region Tree

    public GetTreeNodes(): ITreeNode[]
    {
        const folderNode: ITreeNode = {
            id: CREATURE_FOLDER,
            type: EMTreeNodeType.CreatureFolder,
            resourceType: EMResourceType.Creature,
            label: '生物',
            path: CREATURE_FOLDER,
            children: []
        };

        const categoryList: TSpeciesCategory[] = ['Fish', 'Shrimp', 'Crab', 'Snail', 'Bivalve'];
        for (const category of categoryList)
        {
            const speciesInCategory = this.speciesKeyList.filter(k => this.GetSpeciesCategory(k) === category);
            if (speciesInCategory.length === 0)
            {
                continue;
            }

            const categoryLabel = SpeciesCategoryOptionList.find(o => o.value === category)?.text ?? category;
            const categoryNode: ITreeNode = {
                id: `${CREATURE_FOLDER}/${category}`,
                type: EMTreeNodeType.CreatureCategory,
                resourceType: EMResourceType.Creature,
                label: categoryLabel,
                path: `${CREATURE_FOLDER}/${category}`,
                children: []
            };

            for (const speciesKey of speciesInCategory)
            {
                const speciesName = this.GetSpeciesName(speciesKey);
                const speciesNode: ITreeNode = {
                    id: `${CREATURE_FOLDER}/${speciesKey}`,
                    type: EMTreeNodeType.Species,
                    resourceType: EMResourceType.Creature,
                    label: speciesName,
                    path: `${CREATURE_FOLDER}/${speciesKey}`,
                    speciesName: speciesKey,
                    children: [
                        {
                            id: `${CREATURE_FOLDER}/${speciesKey}/desc`,
                            type: EMTreeNodeType.SpeciesDesc,
                            resourceType: EMResourceType.Creature,
                            label: '物种描述',
                            path: `${CREATURE_FOLDER}/${speciesKey}/desc`,
                            speciesName: speciesKey
                        }
                    ]
                };

                const strainNameList = this.GetStrainNameList(speciesKey);
                for (const strainName of strainNameList)
                {
                    const strainNode: ITreeNode = {
                        id: `${CREATURE_FOLDER}/${speciesKey}/${strainName}`,
                        type: EMTreeNodeType.Strain,
                        resourceType: EMResourceType.Creature,
                        label: strainName,
                        path: `${CREATURE_FOLDER}/${speciesKey}/${strainName}`,
                        speciesName: speciesKey,
                        strainName,
                        children: []
                    };

                    const sexList: TSexFolder[] = ['Male', 'Female', 'Fry'];
                    for (const sexName of sexList)
                    {
                        const sexNode: ITreeNode = {
                            id: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}`,
                            type: EMTreeNodeType.Sex,
                            resourceType: EMResourceType.Creature,
                            label: sexName === 'Male' ? '雄性' : sexName === 'Female' ? '雌性' : '鱼苗',
                            path: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}`,
                            speciesName: speciesKey,
                            strainName,
                            sexName,
                            children: [
                                {
                                    id: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}/item`,
                                    type: EMTreeNodeType.ItemJson,
                                    resourceType: EMResourceType.Creature,
                                    label: '生物属性',
                                    path: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}/item`,
                                    speciesName: speciesKey,
                                    strainName,
                                    sexName
                                },
                                {
                                    id: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}/sprite`,
                                    type: EMTreeNodeType.SpriteFolder,
                                    resourceType: EMResourceType.Creature,
                                    label: '精灵图资源',
                                    path: `${CREATURE_FOLDER}/${speciesKey}/${strainName}/${sexName}/sprite`,
                                    speciesName: speciesKey,
                                    strainName,
                                    sexName
                                }
                            ]
                        };
                        strainNode.children!.push(sexNode);
                    }

                    speciesNode.children!.push(strainNode);
                }

                categoryNode.children!.push(speciesNode);
            }

            folderNode.children!.push(categoryNode);
        }

        return [folderNode];
    }

    // #endregion

    public Clear(): void
    {
        this.speciesKeyList = [];
        this.speciesDescMap.clear();
        this.strainNameListMap.clear();
        this.strainDescMap.clear();
        this.itemMap.clear();
        this.spriteSheetMap.clear();
        this.spriteConfigMap.clear();
        this.strainImageMap.clear();
    }

    private CreateDefaultSizeConfig(): ISizeConfig
    {
        return {
            frameSize: [64, 64],
            actionRowOrder: ['idle', 'swim', 'eat'],
            actionList: {
                idle: { fps: 8, collider: { body: null, mouth: null }, frameList: [] },
                swim: { fps: 12, collider: { body: null, mouth: null }, frameList: [] },
                eat: { fps: 8, collider: { body: null, mouth: null }, frameList: [] }
            }
        };
    }

    /** 规范化尺寸配置：确保新格式的碰撞体字段存在，丢弃旧格式的碰撞体数据 */
    private NormalizeSizeConfig(config: ISizeConfig): void
    {
        const actionNameList: TSpriteAction[] = ['idle', 'swim', 'eat'];
        for (const actionName of actionNameList)
        {
            const action = config.actionList[actionName] as unknown as Record<string, unknown> | undefined;
            if (action === undefined) continue;
            if (typeof action.collider !== 'object' || action.collider === null) action.collider = { body: null, mouth: null };
            delete action.colliderList;
            const frameList = action.frameList as Record<string, unknown>[];
            for (const frame of frameList)
            {
                if (typeof frame.colliderOverride !== 'object' || frame.colliderOverride === null) frame.colliderOverride = {};
                delete frame.collider;
                delete frame.colliderOverrideList;
            }
        }
    }

    private GetSpriteSheetKey(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize): string
    {
        return `${speciesKey}/${strainName}/${sexName}/${sizeName}`;
    }

    private GetItemKey(speciesKey: string, strainName: string, sexName: TSexFolder): string
    {
        return `${speciesKey}/${strainName}/${sexName}`;
    }

    private async LoadOldFormatAndConvert(speciesKey: string, strainName: string, sexName: TSexFolder, sizeName: TSpriteSize, spriteUri: URI, context: IResourceContext): Promise<void>
    {
        const sizeUri = URI.JoinPath(spriteUri, sizeName);
        if (await context.sFile.Exists(sizeUri) === false)
        {
            return;
        }

        const actionList: TSpriteAction[] = ['idle', 'swim', 'eat'];
        const oldFrameList = ['01.png', '02.png', '03.png', '04.png', '05.png', '06.png'];
        const framesByAction: Record<TSpriteAction, (Uint8Array | null)[]> = {
            idle: [],
            swim: [],
            eat: []
        };

        let hasData = false;
        for (const actionName of actionList)
        {
            const actionUri = URI.JoinPath(sizeUri, actionName);
            if (await context.sFile.Exists(actionUri) === false) continue;

            for (const frameName of oldFrameList)
            {
                const frameUri = URI.JoinPath(actionUri, frameName);
                if (await context.sFile.Exists(frameUri))
                {
                    const frameData = await context.sFile.ReadFile(frameUri);
                    framesByAction[actionName].push(frameData);
                    hasData = true;
                }
                else
                {
                    framesByAction[actionName].push(null);
                }
            }
        }

        if (hasData === false)
        {
            return;
        }

        const config = this.CreateDefaultSizeConfig();
        for (const actionName of actionList)
        {
            config.actionList[actionName].frameList = framesByAction[actionName].map(() => ({
                colliderOverride: {}
            }));
        }

        const sheet = await SpriteSheetUtil.BuildSpriteSheet(framesByAction, config.frameSize);
        this.SetSpriteSheet(speciesKey, strainName, sexName, sizeName, sheet);
        this.SetSizeConfig(speciesKey, strainName, sexName, sizeName, config);
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
