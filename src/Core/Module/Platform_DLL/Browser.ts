
export default class Browser
{
    private static userAgent: string;

    private static isFirefox: boolean;
    public static get IsFirefox(): boolean { return this.isFirefox; }

    private static isWebKit: boolean;
    public static get IsWebKit(): boolean { return this.isWebKit; }

    private static isChrome: boolean;
    public static get IsChrome(): boolean { return this.isChrome; }

    private static isSafari: boolean;
    public static get IsSafari(): boolean { return this.isSafari; }

    private static isWebkitWebView: boolean;
    public static get IsWebkitWebView(): boolean { return this.isWebkitWebView; }

    private static isElectron: boolean;
    public static get IsElectron(): boolean { return this.isElectron; }

    private static isAndroid: boolean;
    public static get IsAndroid(): boolean { return this.isAndroid; }

    private static standalone: boolean;
    public static get IsStandalone(): boolean { return this.standalone; }

    constructor()
    {
        Browser.userAgent = navigator.userAgent;

        Browser.isFirefox = (Browser.userAgent.indexOf('Firefox') >= 0);
        Browser.isWebKit = (Browser.userAgent.indexOf('AppleWebKit') >= 0);
        Browser.isChrome = (Browser.userAgent.indexOf('Chrome') >= 0);
        Browser.isSafari = (!Browser.isChrome && (Browser.userAgent.indexOf('Safari') >= 0));
        Browser.isWebkitWebView = (!Browser.isChrome && !Browser.isSafari && Browser.isWebKit);
        Browser.isElectron = (Browser.userAgent.indexOf('Electron/') >= 0);
        Browser.isAndroid = (Browser.userAgent.indexOf('Android') >= 0);
    }
}

const browser = new Browser();
