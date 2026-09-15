import { Delegate } from 'sumi-tsextension';
import { argbFromHex, Hct, hexFromArgb, SchemeContent, themeFromSourceColor } from "@ktibow/material-color-utilities-nightly";
import SettingSourceColor from "./Setting/SettingSourceColor";
import IOC from '../../../Core/IOC_DLL/IOC';
import Sym from '../../../Core/IOC_DLL/Sym';
import { type default as IServiceTheme, Color } from '../../../Core/IOC_DLL/Interface/Theme/IServiceTheme';
import type IServiceSetting from '../../../Core/IOC_DLL/Interface/Setting/IServiceSetting';

export default class ServiceTheme implements IServiceTheme
{
    public get Color(): typeof Color { return Color; }
    private isDark = false;
    public get IsDark(): boolean{ return this.isDark; }
    private set IsDark(v: boolean)
    {
        if (this.isDark === v)
        {
            return;
        }

        this.isDark = v;
        this.dLightDarkChange.InvokeAsync(v);
    }
    private dLightDarkChange = new Delegate<(isDark: boolean) => void>();
    public get DLightDarkChange() { return this.dLightDarkChange.Event; }
    private dColorChange = new Delegate();
    public get DColorChange() { return this.dColorChange.Event; }

    private settingSourceColor = new SettingSourceColor();

    constructor()
    {
        IOC.Get<IServiceSetting>(Sym.ServiceSetting).Register(this.settingSourceColor);
    }

    /** 修改源色 */
    public ChangeSourceColor(hexColor: string, isDark: boolean): void
    {
        this.IsDark = isDark;
        this.UpdateColor(hexColor, isDark);
        this.ChangeDocumentStyle();
        this.settingSourceColor.Value = hexColor;
        this.dColorChange.InvokeAsync();
    }

    private UpdateColor(hexColor: string, isDark: boolean): void
    {
        const hct = Hct.fromInt(argbFromHex(hexColor));
        const scheme = new SchemeContent(hct, isDark, 0, '2025');

        Color.Primary = hexFromArgb(scheme.primary);
        Color.PrimaryOn = hexFromArgb(scheme.onPrimary);
        Color.PrimaryContainer = hexFromArgb(scheme.primaryContainer);
        Color.PrimaryContainerOn = hexFromArgb(scheme.onPrimaryContainer);
        Color.PrimaryFixed = hexFromArgb(scheme.primaryFixed);
        Color.PrimaryFixedOn = hexFromArgb(scheme.onPrimaryFixed);
        Color.PrimaryFixedDim = hexFromArgb(scheme.primaryFixedDim);
        Color.PrimaryFixedVariant = hexFromArgb(scheme.onPrimaryFixedVariant);
        Color.Secondary = hexFromArgb(scheme.secondary);
        Color.SecondaryOn = hexFromArgb(scheme.onSecondary);
        Color.SecondaryContainer = hexFromArgb(scheme.secondaryContainer);
        Color.SecondaryContainerOn = hexFromArgb(scheme.onSecondaryContainer);
        Color.SecondaryFixed = hexFromArgb(scheme.secondaryFixed);
        Color.SecondaryFixedOn = hexFromArgb(scheme.onSecondaryFixed);
        Color.SecondaryFixedDim = hexFromArgb(scheme.secondaryFixedDim);
        Color.SecondaryFixedVariant = hexFromArgb(scheme.onSecondaryFixedVariant);
        Color.Tertiary = hexFromArgb(scheme.tertiary);
        Color.TertiaryOn = hexFromArgb(scheme.onTertiary);
        Color.TertiaryContainer = hexFromArgb(scheme.tertiaryContainer);
        Color.TertiaryContainerOn = hexFromArgb(scheme.onTertiaryContainer);
        Color.TertiaryFixed = hexFromArgb(scheme.tertiaryFixed);
        Color.TertiaryFixedOn = hexFromArgb(scheme.onTertiaryFixed);
        Color.TertiaryFixedDim = hexFromArgb(scheme.tertiaryFixedDim);
        Color.TertiaryFixedVariant = hexFromArgb(scheme.onTertiaryFixedVariant);
        Color.Surface = hexFromArgb(scheme.surface);
        Color.SurfaceOn = hexFromArgb(scheme.onSurface);
        Color.SurfaceVariantOn = hexFromArgb(scheme.onSurfaceVariant);
        Color.SurfaceDim = hexFromArgb(scheme.surfaceDim);
        Color.SurfaceBright = hexFromArgb(scheme.surfaceBright);
        Color.SurfaceContainerLowest = hexFromArgb(scheme.surfaceContainerLowest);
        Color.SurfaceContainerLow = hexFromArgb(scheme.surfaceContainerLow);
        Color.SurfaceContainer = hexFromArgb(scheme.surfaceContainer);
        Color.SurfaceContainerHigh = hexFromArgb(scheme.surfaceContainerHigh);
        Color.SurfaceContainerHighest = hexFromArgb(scheme.surfaceContainerHighest);
        Color.Outline = hexFromArgb(scheme.outline);
        Color.OutlineVariant = hexFromArgb(scheme.outlineVariant);
        Color.Error = hexFromArgb(scheme.error);
        Color.ErrorOn = hexFromArgb(scheme.onError);
        Color.ErrorContainer = hexFromArgb(scheme.errorContainer);
        Color.ErrorContainerOn = hexFromArgb(scheme.onErrorContainer);
        Color.InverseSurface = hexFromArgb(scheme.inverseSurface);
        Color.InverseSurfaceOn = hexFromArgb(scheme.inverseOnSurface);
        Color.InversePrimary = hexFromArgb(scheme.inversePrimary);
        Color.Scrim = hexFromArgb(scheme.scrim);
        Color.Shadow = hexFromArgb(scheme.shadow);
    }

    private ChangeDocumentStyle(): void
    {
        const css = `:root {
            --sumiStudioCore-color-primary: ${Color.Primary};
            --sumiStudioCore-color-primary-on: ${Color.PrimaryOn};
            --sumiStudioCore-color-primary-container: ${Color.PrimaryContainer};
            --sumiStudioCore-color-primary-container-on: ${Color.PrimaryContainerOn};
            --sumiStudioCore-color-primary-fixed: ${Color.PrimaryFixed};
            --sumiStudioCore-color-primary-fixed-on: ${Color.PrimaryFixedOn};
            --sumiStudioCore-color-primary-fixed-dim: ${Color.PrimaryFixedDim};
            --sumiStudioCore-color-primary-fixed-variant: ${Color.PrimaryFixedVariant};

            --sumiStudioCore-color-secondary: ${Color.Secondary};
            --sumiStudioCore-color-secondary-on: ${Color.SecondaryOn};
            --sumiStudioCore-color-secondary-container: ${Color.SecondaryContainer};
            --sumiStudioCore-color-secondary-container-on: ${Color.SecondaryContainerOn};
            --sumiStudioCore-color-secondary-fixed: ${Color.SecondaryFixed};
            --sumiStudioCore-color-secondary-fixed-on: ${Color.SecondaryFixedOn};
            --sumiStudioCore-color-secondary-fixed-dim: ${Color.SecondaryFixedDim};
            --sumiStudioCore-color-secondary-fixed-variant: ${Color.SecondaryFixedVariant};

            --sumiStudioCore-color-tertiary: ${Color.Tertiary};
            --sumiStudioCore-color-tertiary-on: ${Color.TertiaryOn};
            --sumiStudioCore-color-tertiary-container: ${Color.TertiaryContainer};
            --sumiStudioCore-color-tertiary-container-on: ${Color.TertiaryContainerOn};
            --sumiStudioCore-color-tertiary-fixed: ${Color.TertiaryFixed};
            --sumiStudioCore-color-tertiary-fixed-on: ${Color.TertiaryFixedOn};
            --sumiStudioCore-color-tertiary-fixed-dim: ${Color.TertiaryFixedDim};
            --sumiStudioCore-color-tertiary-fixed-variant: ${Color.TertiaryFixedVariant};

            --sumiStudioCore-color-surface: ${Color.Surface};
            --sumiStudioCore-color-surface-on: ${Color.SurfaceOn};
            --sumiStudioCore-color-surface-on-10: ${Color.SurfaceOn}1A;
            --sumiStudioCore-color-surface-on-20: ${Color.SurfaceOn}33;
            --sumiStudioCore-color-surface-variant-on: ${Color.SurfaceVariantOn};
            --sumiStudioCore-color-surface-dim: ${Color.SurfaceDim};
            --sumiStudioCore-color-surface-bright: ${Color.SurfaceBright};
            --sumiStudioCore-color-surface-container-lowest: ${Color.SurfaceContainerLowest};
            --sumiStudioCore-color-surface-container-low: ${Color.SurfaceContainerLow};
            --sumiStudioCore-color-surface-container: ${Color.SurfaceContainer};
            --sumiStudioCore-color-surface-container-high: ${Color.SurfaceContainerHigh};
            --sumiStudioCore-color-surface-container-highest: ${Color.SurfaceContainerHighest};

            --sumiStudioCore-color-outline: ${Color.Outline};
            --sumiStudioCore-color-outline-variant: ${Color.OutlineVariant};

            --sumiStudioCore-color-error: ${Color.Error};
            --sumiStudioCore-color-error-on: ${Color.ErrorOn};
            --sumiStudioCore-color-error-container: ${Color.ErrorContainer};
            --sumiStudioCore-color-error-container-on: ${Color.ErrorContainerOn};

            --sumiStudioCore-color-inverse-surface: ${Color.InverseSurface};
            --sumiStudioCore-color-inverse-surface-on: ${Color.InverseSurfaceOn};
            --sumiStudioCore-color-inverse-primary: ${Color.InversePrimary};

            --sumiStudioCore-color-scrim: ${Color.Scrim};
            --sumiStudioCore-color-scrim-5: ${Color.Scrim}0D;
            --sumiStudioCore-color-scrim-10: ${Color.Scrim}1A;
            --sumiStudioCore-color-scrim-20: ${Color.Scrim}33;
            --sumiStudioCore-color-scrim-30: ${Color.Scrim}4D;
            --sumiStudioCore-color-scrim-40: ${Color.Scrim}66;
            --sumiStudioCore-color-scrim-50: ${Color.Scrim}80;
            --sumiStudioCore-color-scrim-60: ${Color.Scrim}99;
            --sumiStudioCore-color-scrim-70: ${Color.Scrim}B3;
            --sumiStudioCore-color-scrim-80: ${Color.Scrim}CC;
            --sumiStudioCore-color-scrim-90: ${Color.Scrim}E6;
            --sumiStudioCore-color-shadow: ${Color.Shadow};
            --sumiStudioCore-color-shadow-5: ${Color.Shadow}0D;
            --sumiStudioCore-color-shadow-10: ${Color.Shadow}1A;
            --sumiStudioCore-color-shadow-20: ${Color.Shadow}33;
            --sumiStudioCore-color-shadow-30: ${Color.Shadow}4D;
            --sumiStudioCore-color-shadow-40: ${Color.Shadow}66;
            --sumiStudioCore-color-shadow-50: ${Color.Shadow}80;
            --sumiStudioCore-color-shadow-60: ${Color.Shadow}99;
            --sumiStudioCore-color-shadow-70: ${Color.Shadow}B3;
            --sumiStudioCore-color-shadow-80: ${Color.Shadow}CC;
            --sumiStudioCore-color-shadow-90: ${Color.Shadow}E6;
        }`;

        let styleTag = document.getElementById('sumiStudioCore-theme-style') as HTMLStyleElement;
        if (!styleTag)
        {
            styleTag = document.createElement('style');
            styleTag.id = 'sumiStudioCore-theme-style';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = css;
    }
}