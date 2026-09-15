/** 用于IOC获取对象 */
export default class Sym
{
    public static get ServiceLog(): symbol { return Symbol.for('ServiceLog'); }
    public static get ServiceFile(): symbol { return Symbol.for('ServiceFile'); }
    public static get ServiceSetting(): symbol { return Symbol.for('ServiceSetting'); }
    public static get ServiceTheme(): symbol { return Symbol.for('ServiceTheme'); }
}