import './ContextMenu.css';
import SubMenu from './SubMenu';
import MenuItem from './MenuItem';
import EntityCommonClass from './Entity/EntityCommonClass';
import EntityPosition from './Entity/EntityPosition';
import EntityStyle from './Entity/EntityStyle';
import { OpenDirection } from './Enum/OpenDirection';

export default class ContextMenu
{
    private position!: EntityPosition;
    /** 位置 */
    public get Position(): EntityPosition { return this.position; }
    public set Position(v: EntityPosition)
    {
        this.position = v;
        if (!!this.mainMenuInstance === false)
        {
            return;
        }

        (this.mainMenuInstance as SubMenu).Position = v;
    };
    private forbidClose = false;
    /** 禁止关闭菜单
     * 当需要保持菜单展示时可以设置为true
     */
    public get ForbidClose(): boolean { return this.forbidClose; }
    public set ForbidClose(v: boolean)
    {
        if (v === this.forbidClose)
        {
            return;
        }

        this.forbidClose = v;
    }
    /** 节点列表 */
    private itemList = new Array<MenuItem>();
    /** 样式 */
    private style!: EntityStyle;
    /** 自定义menu样式 */
    private customClass!: string;
    /** 公共样式 */
    private commonClass = new EntityCommonClass();

    /** 菜单是否一直存在 */
    private keepAlive = false;
    private isShow = true;
    public get IsShow(): boolean { return this.isShow; };
    private mainMenuInstance!: SubMenu | null;
    private mouseListening = false;

    // 回调函数
    public HookClose: Function | null = null;
    public HookShow: Function | null = null;
    public HookHidden: Function | null = null;


    constructor(position: EntityPosition, itemList: Array<MenuItem>, keepAlive = false, style = new EntityStyle(), customClass = '')
    {
        this.position = position;
        this.itemList = itemList;
        this.keepAlive = keepAlive
        this.style = style;
        this.customClass = customClass;

        this.commonClass.Menu = 'cMenu';
        this.commonClass.MenuItem = 'cMenuItem';
        this.commonClass.MenuItemClickable = 'cMenu_item-clickable';
        this.commonClass.MenuItemUnclickable = 'cMenu_item-unclickable';

        this.mainMenuInstance = new SubMenu(null, position, this.itemList, this.commonClass, OpenDirection.Right, style, this.customClass);
        setTimeout(() =>
        {
            this.AddListener();
        }, 16);
    }

    private MouseWheelListener(): void
    {
        this.Close();
    }

    private MouseDownListener(e: MouseEvent): void
    {
        let el = e.target as Element;
        const menus = this.GetElementsByClassName(this.commonClass.Menu);
        while (!menus.find((m) => m === el) && el.parentElement)
        {
            el = el.parentElement;
        }
        if (!menus.find((m) => m === el))
        {
            this.Close();
        }
    }

    private MouseClickListener(e: MouseEvent): void
    {
        let el = e.target as Element;
        const menus = this.GetElementsByClassName(this.commonClass.Menu);
        const menuItems = this.GetElementsByClassName(this.commonClass.MenuItem);
        const unclickableMenuItems = this.GetElementsByClassName(this.commonClass.MenuItemUnclickable);
        while (!menus.find((m) => m === el) && !menuItems.find((m) => m === el) && el.parentElement)
        {
            el = el.parentElement;
        }
        if (menuItems.find((m: Element) => m === el))
        {
            if (e.button !== 0 || unclickableMenuItems.find((m) => m === el))
            {
                return;
            }
            this.Close();
            return;
        }
        if (!menus.find((m: Element) => m === el))
        {
            this.Close();
        }
    }

    private AddListener(): void
    {
        if (this.mouseListening === false)
        {
            this.Close = this.Close.bind(this);
            this.MouseClickListener = this.MouseClickListener.bind(this);
            this.MouseDownListener = this.MouseDownListener.bind(this);
            this.MouseWheelListener = this.MouseWheelListener.bind(this);
            window.addEventListener('blur', this.Close);
            document.addEventListener('click', this.MouseClickListener, false);
            document.addEventListener('mousedown', this.MouseDownListener);
            document.addEventListener('mousewheel', this.MouseWheelListener);
            this.mouseListening = true;
        }
    }

    private RemoveListener(): void
    {
        if (this.mouseListening === true)
        {
            window.removeEventListener('blur', this.Close);
            document.removeEventListener('click', this.MouseClickListener);
            document.removeEventListener('mousedown', this.MouseDownListener);
            document.removeEventListener('mousewheel', this.MouseWheelListener);
            this.mouseListening = false;
        }
    }

    public AddItem(item: MenuItem): void
    {
        this.mainMenuInstance?.AddItem(item);
    }

    /** 触发当前项的点击事件 */
    public EnterItem(): void
    {
        (this.mainMenuInstance as SubMenu)?.EnterItem();
    }

    /** 焦点项向上/下 */
    public UpDown(type: 'up' | 'down'): void
    {
        (this.mainMenuInstance as SubMenu)?.UpDown(type);
    }

    /**
     * 焦点项向左/右
     * 当向右且有子节点时，返回true
     * 当向左且有父节点时，返回true
     */
    public LeftRight(type: 'left' | 'right'): boolean
    {
        return (this.mainMenuInstance as SubMenu)?.LeftRight(type);
    }

    public Close() :void
    {
        if (this.ForbidClose === true)
        {
            return;
        }

        this.RemoveListener();
        if (this.keepAlive === false)
        {
            (this.mainMenuInstance as SubMenu)?.Close();
            this.mainMenuInstance = null;
            this.isShow = false;
            this.HookClose?.();
            this.HookShow = null;
            this.HookHidden = null;
            this.HookClose = null;
        }
        else
        {
            this.Hidden();
        }
    }

    /** 显示隐藏菜单 */
    public Show(): void
    {
        if (this.isShow === true)
        {
            return;
        }

        this.isShow = true;
        this.AddListener();
        (this.mainMenuInstance as SubMenu).Show();
        this.HookShow?.();
    }

    /** 隐藏菜单 */
    public Hidden(): void
    {
        if (this.isShow === false)
        {
            return;
        }
        
        this.isShow = false;
        (this.mainMenuInstance as SubMenu).Hidden();
        this.HookHidden?.();
    }

    private GetElementsByClassName(className: string): Element[]
    {
        let els = [];
        for (let el of document.getElementsByClassName(className) || [])
        {
            els.push(el);
        }
        return els;
    }
}