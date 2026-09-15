import { URI } from '@/Core/Module/String_DLL/URI';
import { LANGUAGE_FOLDER, type IResourceContext } from '../Types';

/**
 * 语言资源处理器
 * 负责管理资源包中的国际化文件列表，仅维护内存状态；Load/Save 由 ResourcePackageData 驱动。
 */
export default class LanguageResourceHandler
{
    private languageMap: Map<string, Record<string, unknown>>;

    public constructor()
    {
        this.languageMap = new Map([['en', {}], ['zh-Hans', {}]]);
    }

    public GetLanguage(langTag: string): Record<string, unknown> | undefined
    {
        return this.languageMap.get(langTag);
    }

    public SetLanguage(langTag: string, data: Record<string, unknown>): void
    {
        this.languageMap.set(langTag, data);
    }

    public GetLanguageTagList(): string[]
    {
        return Array.from(this.languageMap.keys());
    }

    public AddLanguage(langTag: string): void
    {
        if (this.languageMap.has(langTag) === false)
        {
            this.languageMap.set(langTag, {});
        }
    }

    public RemoveLanguage(langTag: string): void
    {
        this.languageMap.delete(langTag);
    }

    public async Load(context: IResourceContext): Promise<void>
    {
        this.languageMap.clear();

        const languageFolderUri = URI.JoinPath(context.workUri, LANGUAGE_FOLDER);
        if (await context.sFile.Exists(languageFolderUri) === false)
        {
            return;
        }

        const langFileList = await context.sFile.ReadDir(languageFolderUri);
        for (const fileName of langFileList)
        {
            if (fileName.endsWith('.json') === false)
            {
                continue;
            }
            const langTag = fileName.slice(0, -5);
            const langUri = URI.JoinPath(languageFolderUri, fileName);
            const data = await context.sFile.ReadFile(langUri);
            if (data !== null)
            {
                this.languageMap.set(langTag, JSON.parse(new TextDecoder().decode(data)) as Record<string, unknown>);
            }
        }

        if (this.languageMap.size === 0)
        {
            this.languageMap.set('en', {});
            this.languageMap.set('zh-Hans', {});
        }
    }

    public async Save(context: IResourceContext): Promise<void>
    {
        const languageFolderUri = URI.JoinPath(context.workUri, LANGUAGE_FOLDER);
        await context.sFile.MKDir(languageFolderUri);
        for (const [langTag, data] of this.languageMap)
        {
            const langUri = URI.JoinPath(languageFolderUri, `${langTag}.json`);
            await context.sFile.WriteFile(langUri, JSON.stringify(data, null, 4));
        }
    }

    public Clear(): void
    {
        this.languageMap.clear();
        this.languageMap.set('en', {});
        this.languageMap.set('zh-Hans', {});
    }
}
