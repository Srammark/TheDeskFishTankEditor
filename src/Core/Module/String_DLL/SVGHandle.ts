export default class SVGHandle
{
    private namespaceURI = 'http://www.w3.org/2000/svg';
    public get NamespaceURI(): string { return this.namespaceURI; }
    private svgTagStart = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024">';
    public get SVGTagStart(): string { return this.svgTagStart; }
    private svgTagEnd = '</svg>';
    public get SVGTagEnd(): string { return this.svgTagEnd; }
    private svgMaxLength = 20480;

    private static instance: SVGHandle | null = null;

    public static GetInstance(): SVGHandle
    {
        if (SVGHandle.instance === null)
        {
            SVGHandle.instance = new SVGHandle();
        }
        
        return SVGHandle.instance;
    }

    private constructor() {}

    public CheckSVG(content: string): string
    {
        let flag = '';
        
        if (content.length > this.svgMaxLength)
        {
            return `长度不能超过${this.svgMaxLength}个字符，当前长度${content.length}`;
        }

        flag = this.CheckTagWhitelist(content);
        if (flag !== '')
        {
            return flag;
        }

        flag = this.CheckValueBlacklist(content);
        if (flag !== '')
        {
            return flag;
        }

        flag = this.CheckPunctuationBlacklist(content);
        if (flag !== '')
        {
            return flag;
        }

        flag = this.CheckHtmlClose(content);
        if (flag !== '')
        {
            return flag;
        }

        return '';
    }

    /** 检查标签白名单 */
    private CheckTagWhitelist(content: string): string
    {
        let list = ['g', 'circle', 'clipPath', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'];

        let reg = /<[^\/]\S+/g;
        let tagList = content.match(reg) as RegExpMatchArray;
        if (tagList === null)
        {
            return `未含有任何合法标签`;
        }
        
        for (let i = 0; i < tagList.length; i++)
        {
            for (let k = 0; k < list.length; k++)
            {
                if (tagList[i].indexOf('<' + list[k]) > -1)
                {
                    break;
                }

                if (k === list.length - 1)
                {
                    return `含有禁止使用的【${tagList[i]}】标签`;
                }
            }
        }

        return '';
    }

    /** 检查属性黑名单 */
    private CheckValueBlacklist(content: string): string
    {
        let list = ['id', 'class', 'cursor', 'display', 'href', 'style', 'value', 'xlink'];

        for (let i = 0; i < list.length; i++)
        {
            if (content.indexOf(`${list[i]}`) > -1)
            {
                return `含有禁止使用的【${list[i]}】属性`;
            }
        }

        return '';
    }

    /** 检查标点黑名单 */
    private CheckPunctuationBlacklist(content: string): string
    {
        let list = ['\''];

        for (let i = 0; i < list.length; i++)
        {
            if (content.indexOf(`${list[i]}`) > -1)
            {
                return `含有禁止使用的【${list[i]}】标点符号`;
            }
        }

        return '';
    }

    private CheckHtmlClose(content: string): string
    {
        let tagArray = ['g', 'circle', 'clipPath', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'];
        for(let i = 0; i < tagArray.length; i++)
        {
            let reBegin = new RegExp('<' + tagArray[i], 'ig');
            let reEnd = new RegExp('<\/' + tagArray[i] + '>', 'ig');
            let begin = 0;
            let end = 0;
            let begMactches = content.match(reBegin);
            let endMactches = content.match(reEnd);
            if(begMactches !== null)
            {
                for (let k = 0; k < begMactches.length; k++)
                {
                    begin++;
                }
            }
            if (endMactches !== null)
            {
                for(let j = 0; j < endMactches.length; j++)
                {
                    end++;
                }
            }
            if(begin !== end)
            {
                return `含有未闭合的【${tagArray[i]}】标签`;
            }
        }

        let begMactches = content.match(new RegExp('<\!\-\-', 'ig'));
        let endMactches = content.match(new RegExp('\-\->', 'ig'));
        let a = 0;
        let b = 0;
        if(begMactches !== null)
        {
            for(let n = 0; n < begMactches.length; n++)
            {
                a++;
            }
        }

        if(endMactches !== null)
        {
            for(let m = 0; m < endMactches.length; m++)
            {
                b++;
            }
        }
        if(a !== b)
        {
            return '含有未闭合的【<!-- -->】标签';
        }

        return '';
    }
}