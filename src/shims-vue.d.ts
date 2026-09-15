/* eslint-disable */
declare module '*.vue'
{
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// File System Access API 类型声明
interface FileSystemDirectoryHandle {
    readonly kind: 'directory';
    readonly name: string;
    requestPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied'>;
    queryPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'prompt' | 'denied'>;
}

interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}
