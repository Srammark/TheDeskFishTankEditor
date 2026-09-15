import IOC from '../../IOC_DLL/IOC';
import Sym from '../../IOC_DLL/Sym';
import type IServiceLog from '../../IOC_DLL/Interface/Log/IServiceLog';

export default class MAUI
{
    private static instance: MAUI;
    public static get Instance() : MAUI
    {
        if (!MAUI.instance)
        {
            MAUI.instance = new MAUI();
        }

        return MAUI.instance;
    }

    /** 调用 MAUI 端文件服务方法 */
    public static async DotNetInvokeMethod<T>(methodName: string, ...args: any[]): Promise<T>
    {
        try
        {
            // 通过 DotNet.invokeMethodAsync 调用 MAUI 端方法
            const result = await (globalThis as any).DotNet.invokeMethodAsync('SumiStudio2026', methodName, ...args);
            return result;
        }
        catch (error)
        {
            IOC.Get<IServiceLog>(Sym.ServiceLog).Error(`MAUI operation failed: ${methodName}`, error);
            throw error;
        }
    }
}