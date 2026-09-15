import type { EMLogLevel } from "./Enum/EMLogLevel";

export default interface IServiceLog
{
    get Level(): EMLogLevel;
    set Level(v: EMLogLevel);

    Trace(message: string, ...args: unknown[]): void;
	Debug(message: string, ...args: unknown[]): void;
	Info(message: string, ...args: unknown[]): void;
	Warn(message: string, ...args: unknown[]): void;
	Error(message: string | Error, ...args: unknown[]): void;
}