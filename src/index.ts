import type { App } from 'vue';
import TheDeskFishTankEditor from '@/GUI/Main_DLL/Main.vue';

const components = [{ name: 'TheDeskFishTankEditor', component: TheDeskFishTankEditor }];

const install = (app: App, options?: { prefix?: string }): void => {
    components.forEach(({ name, component }) => {
        const componentName = options?.prefix  ? `${options.prefix}-${name}`  : name;
        app.component(componentName, component);
    });
};

if (typeof window !== 'undefined')
{
    (window as any).TheDeskFishTankEditorPlugin = { install };
}

export { TheDeskFishTankEditor };
export default { install };
