import { CharCode } from './CharCode';

export default class StringHandle
{
    /** 邮箱格式验证 */
    public static ValidateEmail(value: string)
    {
        if (!!value === false)
        {
            return '邮箱不能为空';
        }
        else
        {
            const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!reg.test(value))
            {
                return '请输入有效的邮箱';
            }
            else
            {
                return 'true';
            }
        }
    }
    
    /** 生成随机字符串 */
    public static RandomString(min: number, max: number)
    {
        let str = '';
        let range: number = Math.round(Math.random() * (max - min)) + min;
        const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        for (let i = 0; i < range; i++)
        {
            const pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    }

    public static GetTime(time: Date, fmt: string): string
    {
        const nowTime = time;
        const o = {
            'M+': nowTime.getMonth() + 1,
            'd+': nowTime.getDate(),
            'h+': nowTime.getHours(),
            'm+': nowTime.getMinutes(),
            's+': nowTime.getSeconds(),
            'q+': Math.floor((nowTime.getMonth() + 3) / 3),
            'S': nowTime.getMilliseconds()
        };
        if (/(y+)/.test(fmt))
        {
            fmt = fmt.replace(RegExp.$1, (nowTime.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (let k in o)
        {
            let kk = k as 'M+' | 'd+' | 'h+' | 'm+' | 's+' | 'q+' | 'S';
            if (new RegExp('(' + k + ')').test(fmt))
            {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[kk] as any) : (('00' + o[kk]).substr(('' + o[kk]).length)));
            }
        }
        return fmt;
    }
    
    public static StrLen(_str: string): number
    {
        let len = 0;
        for (let i = 0; i < _str.length; i++)
        {
            if (_str.charCodeAt(i) > 127 || _str.charCodeAt(i) == 94)
            {
                len += 2;
            }
            else
            {
                len++;
            }
        }
        return len;
    }

    public static StrSubstr(_str: string, _len: number, changeText: string = '...'): string
    {
        const strLen = this.StrLen(_str);
        if (strLen < _len)
        {
            return _str;
        }

        let text = '';
        let len = 0;
        for (let i = 0; i < _str.length; i++)
        {
            if (_str.charCodeAt(i) > 127 || _str.charCodeAt(i) == 94)
            {
                len += 2;
            }
            else
            {
                len++;
            }
            if (len <= _len)
            {
                text = text + _str.slice(i, i + 1);
            }
            else
            {
                break;
            }
        }

        return text + changeText;
    }

    public static IsNumber(val: string | object | number): boolean
    {
        if (typeof val === 'number' && !isNaN(val))
        {
            return true;
        }

        val = val.toString();
        const regPos = /^\d+(\.\d+)?$/; //非负浮点数
        const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(val) || regNeg.test(val))
        {
            if (val[0] === '0' && val.length > 1)
            {
                return false;
            }
            if (val[0] === '-' && val[1] === '0' && val[2] !== '.')
            {
                return false;
            }
            return true;
        }
        else
        {
            return false;
        }
    }

    public static Uint8ArrayToStr(array: Uint8Array): string
    {
        let c;
        let char2, char3;
        let out = '';
        let len = array.length;
        let i = 0;

        while(i < len)
        {
            c = array[i++];
            switch(c >> 4)
            {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out = out + String.fromCharCode(c);
                break;
                case 12:
                case 13:
                    // 110x xxxx 10xx xxxx
                    char2 = array[i++];
                    out = out + String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
                case 14:
                    // 1110 xxxx 10xx xxxx 10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out = out + String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
            }
        }

        return out;
    }

    public static B64ToUint8Array(str: string): Uint8Array
    {
        let raw = window.atob(str);
        let length = raw.length;

        let array = new Uint8Array(length);
        for (let i = 0; i < length; i++)
        {
            array[i] = raw.charCodeAt(i);
        }

        return array;
    }

    /** 返回字符串的哈希值 */
    public static HashNum(str: string): number
    {
        let hash = 0;
        let chr = 0;

        if (str.length === 0)
        {
            return hash;
        }

        for (let i = 0; i < str.length; i++)
        {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            // Convert to 32bit integer
            hash |= 0;
        }

        return hash;
    }

    /** 防止XSS攻击 */
    public static HtmlEncode(html: string): string
    {
        // 1.动态创建一个容器标签元素，如DIV
        const temp = document.createElement ('div');
        // 2.将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent !== undefined ) ? (temp.textContent = html) : (temp.innerText = html);
        // 3.返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        const output = temp.innerHTML;
        return output;
    }

    
    public static StartsWithIgnoreCase(str: string, candidate: string): boolean 
    {
        const candidateLength = candidate.length;
        if (candidate.length > str.length) {
            return false;
        }

        return this.CompareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
    }

    public static CompareSubstring(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            const codeA = a.charCodeAt(aStart);
            const codeB = b.charCodeAt(bStart);
            if (codeA < codeB) {
                return -1;
            } else if (codeA > codeB) {
                return 1;
            }
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        } else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }

    public static CompareSubstringIgnoreCase(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number
    {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++)
        {

            let codeA = a.charCodeAt(aStart);
            let codeB = b.charCodeAt(bStart);

            if (codeA === codeB) {
                // equal
                continue;
            }

            if (codeA >= 128 || codeB >= 128) {
                // not ASCII letters -> fallback to lower-casing strings
                return this.CompareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
            }

            // mapper lower-case ascii letter onto upper-case varinats
            // [97-122] (lower ascii) --> [65-90] (upper ascii)
            if (this.IsLowerAsciiLetter(codeA)) {
                codeA -= 32;
            }

            if (this.IsLowerAsciiLetter(codeB)) {
                codeB -= 32;
            }

            // compare both code points
            const diff = codeA - codeB;
            if (diff === 0) {
                continue;
            }

            return diff;
        }

        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;

        if (aLen < bLen) {
            return -1;
        } else if (aLen > bLen) {
            return 1;
        }

        return 0;
    }
    
    public static IsAsciiDigit(code: number): boolean
    {
        return code >= CharCode.Digit0 && code <= CharCode.Digit9;
    }

    public static IsLowerAsciiLetter(code: number): boolean
    {
        return code >= CharCode.a && code <= CharCode.z;
    }

    public static IsUpperAsciiLetter(code: number): boolean
    {
        return code >= CharCode.A && code <= CharCode.Z;
    }

    public static EqualsIgnoreCase(a: string, b: string): boolean
    {
        return a.length === b.length && this.CompareSubstringIgnoreCase(a, b) === 0;
    }

    /**
     * Removes all occurrences of needle from the end of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim
     */
    public static RemoveTrim(haystack: string, needle: string): string
    {
        if (!haystack || !needle) {
                return haystack;
        }

        const needleLen = needle.length,
            haystackLen = haystack.length;

        if (needleLen === 0 || haystackLen === 0) {
            return haystack;
        }

        let offset = haystackLen,
            idx = -1;

        while (true) {
            idx = haystack.lastIndexOf(needle, offset - 1);
            if (idx === -1 || idx + needleLen !== offset) {
                break;
            }
            if (idx === 0) {
                return '';
            }
            offset = idx;
        }

        return haystack.substring(0, offset);
    }

    public static Compare(a: string, b: string): number
    {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }

}