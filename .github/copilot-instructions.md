---
description: 'TheDeskFishTankEditor (TypeScript + Vue)'
applyTo: "**/TheDeskFishTankEditor/**/*"
---
# TheDeskFishTankEditor 项目规范

## 项目概述

TheDeskFishTankEditor 是基于 TypeScript + Vue 3 的

## 代码编译

禁止使用build编译代码，可以使用typescript语法检测来判断项目是否有报错。

#### 依赖注入模式

```typescript
// 注册服务 (单例)
IOC.SetSingletonScope<IServiceTool>(Sym.ServiceTool, ServiceTool);

// 获取服务
const sTool = AppIOC.Get<IServiceTool>(Sym.ServiceTool);
```

#### 命名规范

- **函数名**: 除 Vue 生命周期钩子外，所有自定义函数名首字母必须大写 (PascalCase)
- **Array 参数**: 使用 `List` 结尾 (如 `itemList`)，不要用 `s`
- **Map 参数**: 使用 `Map` 结尾 (如 `configMap`)，不要用 `s`

### 2. Vue 组件规范

- 使用 `<script setup lang="ts">` 语法
- 组件名使用 PascalCase
- Props 使用接口定义
- 事件使用 `defineEmits` 显式声明

### 3. 服务使用规范

通过 IOC 容器获取服务：

```typescript
import { AppIOC } from '@/App/IOC_DLL/IOC';
import { Sym } from '@/App/IOC_DLL/Sym';

const sTool = AppIOC.Get<IServiceTool>(Sym.ServiceTool);
```

#### 文件系统抽象

支持多种文件系统后端：

- `indexeddb://` - IndexedDB 存储
- `html://` - HTML FileSystem API
- `file://` - 本地文件系统

```typescript
// 使用 URI 操作文件
const uri = new URI('indexeddb:///workspace/project/file.txt');
await sFile.ReadFile(uri);
await sFile.WriteFile(uri, data);
await sFile.Watch(uri, (event, filename) => { /* 文件变化回调 */ });
await sFile.UnWatch(uri, listener);   // 取消监听

// 其他操作
await sFile.Exists(uri);
await sFile.CopyFile(fromUri, toUri, overwrite);  // 复制文件
await sFile.RM(uri);        // 删除文件
await sFile.RMDir(uri);     // 删除文件夹
await sFile.MKDir(uri);     // 创建文件夹
await sFile.ReadDir(uri);   // 读取目录

// 注册自定义文件系统
sFile.RegisterFileSystem('custom', myFileSystem);
```
