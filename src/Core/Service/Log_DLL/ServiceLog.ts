import { EMLogLevel } from "../../../Core/IOC_DLL/Interface/Log/Enum/EMLogLevel";
import type IServiceLog from "../../../Core/IOC_DLL/Interface/Log/IServiceLog";

export default class ServiceLog implements IServiceLog
{
    private level: EMLogLevel = EMLogLevel.Info;

	get Level(): EMLogLevel { return this.level; }
    set Level(v: EMLogLevel)
    {
		if (this.level !== v)
        {
			this.level = v;
		}
	}

    private CanLog(messageLevel: EMLogLevel): boolean
    {
		return this.level !== EMLogLevel.Off && this.level <= messageLevel;
	}

	Trace(message: string, ...args: unknown[]): void
    {
		if (this.CanLog(EMLogLevel.Trace))
        {
            console.log(message, ...args);
		}
	}

	Debug(message: string, ...args: unknown[]): void
    {
		if (this.CanLog(EMLogLevel.Debug))
        {
			console.log(message, ...args);
		}
	}

	Info(message: string, ...args: unknown[]): void
    {
		if (this.CanLog(EMLogLevel.Info))
        {
		    console.log(message, ...args);
		}
	}

	Warn(message: string | Error, ...args: unknown[]): void
    {
		if (this.CanLog(EMLogLevel.Warning))
        {
				console.warn(message, ...args);
		}
	}

	Error(message: string, ...args: unknown[]): void
    {
		if (this.CanLog(EMLogLevel.Error))
        {
			console.error(message, ...args);
		}
	}

}