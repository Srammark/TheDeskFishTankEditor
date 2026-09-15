---
description: 'CSS 规范与设计系统'
applyTo: "**/TheDeskFishTankEditor/**/*.vue"
---
# CSS 规范与设计系统

## 1. 布局系统 (wRC Layout System)

**强制使用 wRC CSS 类进行布局，严禁随意手写 Flex 布局样式。**

- wRC CSS: `@/public/css/wRC.css`

### 类名规则

`.w[方向]_[水平对齐][垂直对齐][宽度模式]`

- **方向** (第2字符): `R` = Row (横向), `C` = Column (纵向)
- **水平对齐** (第4字符): `S` = Start (左), `C` = Center (中), `E` = End (右)
- **垂直对齐** (第5字符): `S` = Start (顶), `C` = Center (中), `E` = End (底), 省略 = 不设 align-items
- **宽度模式** (第6字符): `B` = 无 width:100% (由内容撑开), 省略 = 默认 width:100%

### 常用类

| 类名                | 说明                           |
| ------------------- | ------------------------------ |
| `.wR_HS`          | 横向，左对齐，宽100%           |
| `.wR_HCVC`        | 横向，水平垂直双居中，宽100%   |
| `.wC_HSB`         | 纵向，顶部对齐，宽度由内容决定 |
| `.wBlock`         | width:100%; display:block      |
| `.wCrossSlide`    | 横向滚动容器（隐藏滚动条）     |
| `.lineBreak[1-5]` | 文本截断，限制 1 到 5 行       |

## 2. CSS 编写规范

- **优先使用内联 Style**: 少量样式直接写在 `style="..."` 中，不要创建新的 class
- **Class 排序**: wRC 布局类必须放在首位
- **禁止属性换行**: 一个标签只能占一行
- **Class 命名**: 使用 camelCase (如 `searchColorCard`)，所属关系用下划线 (如 `button_stateLayer`)
- **CSS 变量**: 必须使用预定义变量，禁止创造不存在变量

## 3. 设计系统 Tokens

### Z-Index 层级

| 变量名                      | 值   | 用途        |
| --------------------------- | ---- | ----------- |
| `--sumiStudio-z-bg`       | -1   | 背景装饰层  |
| `--sumiStudio-z-default`  | 1    | 基础内容层  |
| `--sumiStudio-z-sticky`   | 100  | 悬浮交互层  |
| `--sumiStudio-z-navbar`   | 1000 | 导航固定层  |
| `--sumiStudio-z-dropdown` | 2000 | 下拉/气泡层 |
| `--sumiStudio-z-mask`     | 3000 | 遮罩层      |
| `--sumiStudio-z-drawer`   | 3000 | 抽屉层      |
| `--sumiStudio-z-modal`    | 4000 | 弹窗层      |
| `--sumiStudio-z-toast`    | 5000 | 全局通知层  |
| `--sumiStudio-z-loading`  | 6000 | 加载层      |
| `--sumiStudio-z-top`      | 9999 | 调试层      |

### 颜色变量 (Primary)

| 变量名                                           | 用途             |
| ------------------------------------------------ | ---------------- |
| `--sumiStudioCore-color-primary`               | 主色             |
| `--sumiStudioCore-color-primary-on`            | 主色上的文字     |
| `--sumiStudioCore-color-primary-container`     | 主色容器背景     |
| `--sumiStudioCore-color-primary-container-on`  | 主色容器上的文字 |
| `--sumiStudioCore-color-primary-fixed`         | 固定主色         |
| `--sumiStudioCore-color-primary-fixed-on`      | 固定主色上的文字 |
| `--sumiStudioCore-color-primary-fixed-dim`     | 暗色固定主色     |
| `--sumiStudioCore-color-primary-fixed-variant` | 固定主色变体     |

### 颜色变量 (Secondary)

| 变量名                                             | 用途             |
| -------------------------------------------------- | ---------------- |
| `--sumiStudioCore-color-secondary`               | 次色             |
| `--sumiStudioCore-color-secondary-on`            | 次色上的文字     |
| `--sumiStudioCore-color-secondary-container`     | 次色容器背景     |
| `--sumiStudioCore-color-secondary-container-on`  | 次色容器上的文字 |
| `--sumiStudioCore-color-secondary-fixed`         | 固定次色         |
| `--sumiStudioCore-color-secondary-fixed-on`      | 固定次色上的文字 |
| `--sumiStudioCore-color-secondary-fixed-dim`     | 暗色固定次色     |
| `--sumiStudioCore-color-secondary-fixed-variant` | 固定次色变体     |

### 颜色变量 (Tertiary)

| 变量名                                            | 用途               |
| ------------------------------------------------- | ------------------ |
| `--sumiStudioCore-color-tertiary`               | 第三色             |
| `--sumiStudioCore-color-tertiary-on`            | 第三色上的文字     |
| `--sumiStudioCore-color-tertiary-container`     | 第三色容器背景     |
| `--sumiStudioCore-color-tertiary-container-on`  | 第三色容器上的文字 |
| `--sumiStudioCore-color-tertiary-fixed`         | 固定第三色         |
| `--sumiStudioCore-color-tertiary-fixed-on`      | 固定第三色上的文字 |
| `--sumiStudioCore-color-tertiary-fixed-dim`     | 暗色固定第三色     |
| `--sumiStudioCore-color-tertiary-fixed-variant` | 固定第三色变体     |

### 颜色变量 (Surface)

| 变量名                                               | 用途                |
| ---------------------------------------------------- | ------------------- |
| `--sumiStudioCore-color-surface`                   | 表面背景色          |
| `--sumiStudioCore-color-surface-on`                | 表面上文字          |
| `--sumiStudioCore-color-surface-on-10`             | 表面文字 10% 透明度 |
| `--sumiStudioCore-color-surface-on-20`             | 表面文字 20% 透明度 |
| `--sumiStudioCore-color-surface-variant-on`        | 表面变体文字        |
| `--sumiStudioCore-color-surface-dim`               | 暗色表面            |
| `--sumiStudioCore-color-surface-bright`            | 亮色表面            |
| `--sumiStudioCore-color-surface-container-lowest`  | 最低容器表面        |
| `--sumiStudioCore-color-surface-container-low`     | 低容器表面          |
| `--sumiStudioCore-color-surface-container`         | 容器表面            |
| `--sumiStudioCore-color-surface-container-high`    | 高容器表面          |
| `--sumiStudioCore-color-surface-container-highest` | 最高容器表面        |

### 颜色变量 (Outline & Error)

| 变量名                                        | 用途             |
| --------------------------------------------- | ---------------- |
| `--sumiStudioCore-color-outline`            | 边框色           |
| `--sumiStudioCore-color-outline-variant`    | 边框色变体       |
| `--sumiStudioCore-color-error`              | 错误色           |
| `--sumiStudioCore-color-error-on`           | 错误色上的文字   |
| `--sumiStudioCore-color-error-container`    | 错误容器背景     |
| `--sumiStudioCore-color-error-container-on` | 错误容器上的文字 |

### 颜色变量 (Inverse & Scrim)

| 变量名                                        | 用途              |
| --------------------------------------------- | ----------------- |
| `--sumiStudioCore-color-inverse-surface`    | 反色表面          |
| `--sumiStudioCore-color-inverse-surface-on` | 反色表面文字      |
| `--sumiStudioCore-color-inverse-primary`    | 反色主色          |
| `--sumiStudioCore-color-scrim`              | 遮罩色            |
| `--sumiStudioCore-color-scrim-5`            | 遮罩色 5% 透明度  |
| `--sumiStudioCore-color-scrim-10`           | 遮罩色 10% 透明度 |
| `--sumiStudioCore-color-scrim-20`           | 遮罩色 20% 透明度 |
| `--sumiStudioCore-color-scrim-30`           | 遮罩色 30% 透明度 |
| `--sumiStudioCore-color-scrim-40`           | 遮罩色 40% 透明度 |
| `--sumiStudioCore-color-scrim-50`           | 遮罩色 50% 透明度 |
| `--sumiStudioCore-color-scrim-60`           | 遮罩色 60% 透明度 |
| `--sumiStudioCore-color-scrim-70`           | 遮罩色 70% 透明度 |
| `--sumiStudioCore-color-scrim-80`           | 遮罩色 80% 透明度 |
| `--sumiStudioCore-color-scrim-90`           | 遮罩色 90% 透明度 |
| `--sumiStudioCore-color-shadow`             | 阴影色            |
| `--sumiStudioCore-color-shadow-5`           | 阴影色 5% 透明度  |
| `--sumiStudioCore-color-shadow-10`          | 阴影色 10% 透明度 |
| `--sumiStudioCore-color-shadow-20`          | 阴影色 20% 透明度 |
| `--sumiStudioCore-color-shadow-30`          | 阴影色 30% 透明度 |
| `--sumiStudioCore-color-shadow-40`          | 阴影色 40% 透明度 |
| `--sumiStudioCore-color-shadow-50`          | 阴影色 50% 透明度 |
| `--sumiStudioCore-color-shadow-60`          | 阴影色 60% 透明度 |
| `--sumiStudioCore-color-shadow-70`          | 阴影色 70% 透明度 |
| `--sumiStudioCore-color-shadow-80`          | 阴影色 80% 透明度 |
| `--sumiStudioCore-color-shadow-90`          | 阴影色 90% 透明度 |

### 字体大小变量

| 变量名                        | 大小 |
| ----------------------------- | ---- |
| `--sumiStudio-font-size-1`  | 11px |
| `--sumiStudio-font-size-2`  | 12px |
| `--sumiStudio-font-size-3`  | 14px |
| `--sumiStudio-font-size-4`  | 16px |
| `--sumiStudio-font-size-5`  | 18px |
| `--sumiStudio-font-size-6`  | 20px |
| `--sumiStudio-font-size-7`  | 22px |
| `--sumiStudio-font-size-8`  | 24px |
| `--sumiStudio-font-size-9`  | 28px |
| `--sumiStudio-font-size-10` | 32px |
| `--sumiStudio-font-size-11` | 36px |
| `--sumiStudio-font-size-12` | 40px |
| `--sumiStudio-font-size-13` | 45px |
| `--sumiStudio-font-size-14` | 51px |
| `--sumiStudio-font-size-15` | 57px |

### 字体大小别名变量

| 变量名                                     | 对应大小 |
| ------------------------------------------ | -------- |
| `--sumiStudio-font-label-small-size`     | 11px     |
| `--sumiStudio-font-label-medium-size`    | 12px     |
| `--sumiStudio-font-label-large-size`     | 14px     |
| `--sumiStudio-font-body-small-size`      | 12px     |
| `--sumiStudio-font-body-medium-size`     | 14px     |
| `--sumiStudio-font-body-large-size`      | 16px     |
| `--sumiStudio-font-title-small-size`     | 14px     |
| `--sumiStudio-font-title-medium-size`    | 16px     |
| `--sumiStudio-font-title-large-size`     | 22px     |
| `--sumiStudio-font-headline-small-size`  | 24px     |
| `--sumiStudio-font-headline-medium-size` | 28px     |
| `--sumiStudio-font-headline-large-size`  | 32px     |
| `--sumiStudio-font-display-small-size`   | 36px     |
| `--sumiStudio-font-display-medium-size`  | 45px     |
| `--sumiStudio-font-display-large-size`   | 57px     |

### 字体样式类

| 类名                                 | 大小 | 行高 |
| ------------------------------------ | ---- | ---- |
| `.sumiStudio_font_label-small`     | 11px | 16px |
| `.sumiStudio_font_label-medium`    | 12px | 16px |
| `.sumiStudio_font_label-large`     | 14px | 20px |
| `.sumiStudio_font_body-small`      | 12px | 16px |
| `.sumiStudio_font_body-medium`     | 14px | 20px |
| `.sumiStudio_font_body-large`      | 16px | 24px |
| `.sumiStudio_font_title-small`     | 14px | 20px |
| `.sumiStudio_font_title-medium`    | 16px | 24px |
| `.sumiStudio_font_title-large`     | 22px | 28px |
| `.sumiStudio_font_headline-small`  | 24px | 32px |
| `.sumiStudio_font_headline-medium` | 28px | 36px |
| `.sumiStudio_font_headline-large`  | 32px | 40px |
| `.sumiStudio_font_display-small`   | 36px | 44px |
| `.sumiStudio_font_display-medium`  | 45px | 52px |
| `.sumiStudio_font_display-large`   | 57px | 64px |

### 过渡时间变量

| 变量名                                  | 时间  |
| --------------------------------------- | ----- |
| `--sumiStudio-transition-time-fast`   | 0.1s  |
| `--sumiStudio-transition-time-medium` | 0.15s |
| `--sumiStudio-transition-time-slow`   | 0.2s  |

### 状态透明度变量

| 变量名                                  | 透明度 |
| --------------------------------------- | ------ |
| `--sumiStudio-state-hover-opacity`    | 0.12   |
| `--sumiStudio-state-focus-opacity`    | 0.14   |
| `--sumiStudio-state-pressed-opacity`  | 0.14   |
| `--sumiStudio-state-disabled-opacity` | 0.38   |
