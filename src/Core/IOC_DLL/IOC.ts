import { Container, type BindToFluentSyntax, type GetOptions, type OptionalGetOptions, type ServiceIdentifier } from 'inversify';

export default class IOC
{
    public static provider: Container;
    public static get Provider(): Container
    {
        return this.provider;
    }

    public static SetContainer(container: Container): void
    {
        this.provider = container;
    }

    public static Set<T>(serviceIdentifier: ServiceIdentifier<T>, target: { new(): T }): void
    {
        this.provider.bind<T>(serviceIdentifier).to(target);
    }

    public static SetSingletonScope<T>(serviceIdentifier: ServiceIdentifier<T>, target: { new(): T }): void
    {
        this.provider.bind<T>(serviceIdentifier).to(target).inSingletonScope();
    }


    public static Get<T>(serviceIdentifier: ServiceIdentifier<T>, options: OptionalGetOptions): T | undefined;
    public static Get<T>(serviceIdentifier: ServiceIdentifier<T>, options?: GetOptions): T;
    public static Get<T>(serviceIdentifier: ServiceIdentifier<T>, options?: OptionalGetOptions | GetOptions): T | undefined {
        return this.provider.get(serviceIdentifier, options as any);
    }
}