/** 运行平台 */
export const enum EMPlatform
{
	Web,
	Windows,
	Linux,
	Mac
}

/** 底层操作系统 */
export const enum EMOperatingSystem
{
	Windows = 1,
	Linux = 2,
	Macintosh = 3
}


export default class PlatformInfo
{
    private static platform: EMPlatform;
    public static get Platform(): EMPlatform { return this.platform; }
    private static operatingSystem: EMOperatingSystem;
    public static get OperatingSystem(): EMOperatingSystem { return this.operatingSystem; }
    private static isMaui: boolean;
    public static get IsMaui(): boolean { return this.isMaui; }
    public static get IsWindows(): boolean { return this.operatingSystem === EMOperatingSystem.Windows; }
    public static get IsLinux(): boolean { return this.operatingSystem === EMOperatingSystem.Linux; }
    public static get IsMacintosh(): boolean { return this.operatingSystem === EMOperatingSystem.Macintosh; }

    constructor()
    {
        PlatformInfo.isMaui = PlatformInfo.GetIsMaui();
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Windows') >= 0)
        {
            PlatformInfo.platform = EMPlatform.Windows;
            PlatformInfo.operatingSystem = EMOperatingSystem.Windows;
        }
        else if (userAgent.indexOf('Macintosh') >= 0 || userAgent.indexOf('iPad') >= 0 || userAgent.indexOf('iPhone') >= 0)
        {
            PlatformInfo.platform = EMPlatform.Mac;
            PlatformInfo.operatingSystem = EMOperatingSystem.Macintosh;
        }
        else if (userAgent.indexOf('Linux') >= 0)
        {
            PlatformInfo.platform = EMPlatform.Linux;
            PlatformInfo.operatingSystem = EMOperatingSystem.Linux;
        }
    }

    private static GetIsMaui(): boolean
    {
        const g = globalThis as any;

        // Windows (WebView2)
        if (g.chrome?.webview)
        {
            return true;
        }

        // Android / iOS (native WebView injection)
        if (g.external?.sendMessage)
        {
            return true;
        }

        // iOS WKWebView
        if (g.webkit?.messageHandlers)
        {
            return true;
        }

        return false;
    }
}

const platformInfo = new PlatformInfo();