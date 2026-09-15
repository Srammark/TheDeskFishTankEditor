import './ContextMenu.css';
import { OpenDirection } from './Enum/OpenDirection';
import MenuItem from './MenuItem';
import EntityCommonClass from './Entity/EntityCommonClass';
import EntityPosition from './Entity/EntityPosition';
import EntityStyle from './Entity/EntityStyle';
import EventActiveSubmenu from './Entity/EventActiveSubMenu';

export default class SubMenu
{
    private dom!: HTMLDivElement;
    /** 布局的div对象 */
    public get Dom(): HTMLDivElement { return this.dom; }
    public set Dom(v: HTMLDivElement) { this.dom = v; }

    private panelDom!: HTMLDivElement;
    /** 容器的div对象 */
    public get PanelDom(): HTMLDivElement { return this.panelDom; }
    public set PanelDom(v: HTMLDivElement) { this.panelDom = v; }

    private parent: SubMenu | null = null;
    /** 父菜单 */
    public get Parent(): SubMenu | null { return this.parent; }
    public set Parent(v: SubMenu | null) { this.parent = v; }

    /** 位置 */
    private position!: EntityPosition;
    public get Position(): EntityPosition { return this.position; };
    public set Position(v: EntityPosition)
    {
        this.position = v;
        this.SetPos();
    }
    /** 节点列表 */
    private itemList = new Array<MenuItem>();
    /** 打开方向 */
    private openDirection = OpenDirection.Right;
    /** 公共样式 */
    private commonClass!: EntityCommonClass;
    /** 基本样式 */
    private style!: EntityStyle;
    /** 活动目录 */
    private activeSubmenu = new EventActiveSubmenu();
    /** 最小宽度 */
    private minWidth!: number;
    /** 层级 */
    private zIndex = 99999;
    /** 自定义menu样式 */
    private customClass!: string;
    private width = 0;
    private height = 0;
    private focusItemIndex = -1;

    private SUBMENU_X_OFFSET = 3;
    private SUBMENU_Y_OFFSET = 5;

    /**　是否显示 */
    private visible = false;

    constructor(parent: SubMenu | null, position: EntityPosition, itemList: Array<MenuItem>, commonClass: EntityCommonClass, openDirection = OpenDirection.Right,  style = new EntityStyle(), customClass = '')
    {
        this.parent = parent as SubMenu;
        this.position = position;
        this.itemList = itemList;
        this.commonClass = commonClass;
        this.openDirection = openDirection;
        this.style = style;
        this.customClass = customClass;

        this.visible = true;
        this.CreatePanel();
       
        this.SetPos();
    }

    /** 创建布局 */
    private CreatePanel(): void
    {
        this.Dom = document.createElement('div');
        this.Dom.className = `${this.commonClass.Menu} cMenu_sub ${this.customClass}`;
        this.Dom.style.top = `${this.style.Top}px`;
        this.Dom.style.left = `${this.style.Left}px`;
        this.Dom.style.minWidth = `${this.style.MinWidth}px`;
        this.Dom.style.zIndex = `${this.style.ZIndex}`;
        this.Dom.addEventListener('contextmenu', (e: MouseEvent) => { e.preventDefault(); });
        this.CreatePanelDom();
        document.body.appendChild(this.Dom);
    }

    private CreatePanelDom(): void
    {
        this.PanelDom = document.createElement('div');
        this.PanelDom.className = `cMenu_sub_body`;
        this.Dom.appendChild(this.PanelDom);
        this.CreateItemDom();
    }

    private CreateItemDom(): void
    {
        for (let index = 0; index < this.itemList.length; index++)
        {
            let item = this.itemList[index];
            if (item.IsFirstBind === false)
            {
                
                this.panelDom.appendChild(item.Dom);
                continue;
            }
            item.ItemDom.classList.add(this.commonClass.MenuItem);
            if (item.Children.length > 0)
            {
                item.ItemDom.classList.add(this.commonClass.MenuItemUnclickable);
                item.ShowArrow = true;
                item.ItemDom.addEventListener('mouseenter', (e: MouseEvent) => { this.ItemEnter(item)});
            }
            else
            {
                item.ItemDom.classList.add(this.commonClass.MenuItemClickable);
                item.ItemDom.addEventListener('mouseenter', (e: MouseEvent) => { this.ItemEnter(item) });
                item.ItemDom.addEventListener('mouseleave', (e: MouseEvent) => { this.ItemMouseLeave(item) });
                item.ItemDom.addEventListener('click', (e: MouseEvent) => { this.ItemClick(item) });
                item.ItemDom.addEventListener('mousedown', (e: MouseEvent) => { this.ItemMouseDown(item) });
                item.ItemDom.addEventListener('mouseup', (e: MouseEvent) => { this.ItemMouseUp(item) });
            }

            item.IsFirstBind = false;
            this.panelDom.appendChild(item.Dom);
        }
    }

    public AddItem(item: MenuItem): void
    {
        item.ItemDom.classList.add(this.commonClass.MenuItem);
        if (item.Children.length > 0)
        {
            item.ItemDom.classList.add(this.commonClass.MenuItemUnclickable);
            item.ShowArrow = true;
            item.ItemDom.addEventListener('mouseenter', (e: MouseEvent) => { this.ItemEnter(item)});
        }
        else
        {
            item.ItemDom.classList.add(this.commonClass.MenuItemClickable);
            item.ItemDom.addEventListener('mouseenter', (e: MouseEvent) => { this.ItemEnter(item) });
            item.ItemDom.addEventListener('click', (e: MouseEvent) => { this.ItemClick(item) });
            item.ItemDom.addEventListener('mousedown', (e: MouseEvent) => { this.ItemMouseDown(item) });
            item.ItemDom.addEventListener('mouseup', (e: MouseEvent) => { this.ItemMouseUp(item) });
        }

        if (this.itemList.length === 0)
        {
            this.panelDom.appendChild(item.Dom);
            this.itemList.push(item);
        }
        else if (item.Order !== -1)
        {
            let flag = false;
            for (let i = 0; i < this.itemList.length; i++)
            {
                if (item.Order < this.itemList[i].Order || this.itemList[i].Order === -1)
                {
                    this.panelDom.insertBefore(item.Dom, this.itemList[i].Dom);
                    this.itemList.splice(i, 0, item);
                    flag = true;
                    break;
                }
            }
            if (flag === false)
            {
                this.panelDom.appendChild(item.Dom);
                this.itemList.push(item);
            }
        }
        else
        {
            this.panelDom.appendChild(item.Dom);
            this.itemList.push(item);
        }
    }

    /** 确定菜单位置 */
    private SetPos(): void
    {
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;
        const menuWidth = this.Dom.offsetWidth === 0 ? this.width : this.Dom.offsetWidth;
        const menuHeight = this.Dom.offsetHeight === 0 ? this.height : this.Dom.offsetHeight;
        if (this.Dom.offsetWidth !== 0)
        {
            this.width = this.Dom.offsetWidth;
            this.height = this.Dom.offsetHeight;
        }

        if (this.openDirection === OpenDirection.Left)
        {
            this.LeftOpen(windowWidth, windowHeight, menuWidth);
        }
        else
        {
            this.RightOpen(windowWidth, windowHeight, menuWidth);
        }
        this.style.Top = this.position.YPos;
        if (this.position.YPos + menuHeight > windowHeight)
        {
            if (this.position.Height === 0)
            {
                this.style.Top = this.position.YPos - menuHeight;
            } else
            {
                this.style.Top = windowHeight - menuHeight;
            }
        }

        this.Dom.style.top = `${this.style.Top}px`;
        this.Dom.style.left = `${this.style.Left}px`;
    }

    private LeftOpen(windowWidth: number, windowHeight: number, menuWidth: number): void
    {
        this.style.Left = this.position.XPos - menuWidth;
        this.openDirection = OpenDirection.Left;
        if (this.style.Left < 0)
        {
            this.openDirection = OpenDirection.Right;
            if (this.position.Width === 0)
            {
                this.style.Left = 0;
            }
            else
            {
                this.style.Left = this.position.XPos + this.position.Width;
            }
        }
    }

    private RightOpen(windowWidth: number, windowHeight: number, menuWidth: number): void
    {
        this.style.Left = this.position.XPos + this.position.Width;
        this.openDirection = OpenDirection.Right;
        if (this.style.Left + menuWidth > windowWidth)
        {
            this.openDirection = OpenDirection.Left;
            if (this.position.Width === 0)
            {
                this.style.Left = windowWidth - menuWidth;
            }
            else
            {
                this.style.Left = this.position.XPos - menuWidth;
            }
        }
    }

    private ItemEnter(item: MenuItem): void
    {
        if (this.visible === false)
        {
            return;
        }

        for (let temp of this.itemList)
        {
            temp.IsFocus = false;
        }
        item.IsFocus = true;
        let index = 0;
        for (let i = 0; i < this.itemList.length; i++)
        {
            if (this.itemList[i] === item)
            {
                index = i;
                break;
            }
        }
        this.focusItemIndex = index;
        
        if (!!this.activeSubmenu.Instance === true)
        {
            if (this.activeSubmenu.Index === index)
            {
                return;
            }
            else
            {
                this.activeSubmenu.Instance?.Close();
                this.activeSubmenu.Instance = null;
                this.activeSubmenu.Index = -1;
            }
        }
        if (item.Children.length === 0)
        {
            return;
        }

        const menuItemClientRect = item.Dom.getBoundingClientRect();
        let position = new EntityPosition();
        position.XPos = menuItemClientRect.x + this.SUBMENU_X_OFFSET;
        position.YPos = menuItemClientRect.y + this.SUBMENU_Y_OFFSET;
        position.Width = menuItemClientRect.width - 2 * this.SUBMENU_X_OFFSET;
        position.Height = menuItemClientRect.width;

        let style = new EntityStyle();
        style.MinWidth = typeof item.MinWidth === 'number' ? item.MinWidth : this.style.MinWidth;
        style.ZIndex = this.style.ZIndex;

        this.activeSubmenu.Instance = new SubMenu(this, position, item.Children, this.commonClass, this.openDirection, style, this.customClass);
    }

    private ItemMouseLeave(item: MenuItem): void
    {
        for (let temp of this.itemList)
        {
            temp.IsFocus = false;
        }
    }

    private ItemClick(item: MenuItem): void
    {
        if (item.IsHidden === true || item.IsDisabled === true || typeof item.HookClick !== 'function')
        {
            return;
        }

        item.HookClick();
    }

    private ItemMouseDown(item: MenuItem): void
    {
        if (item.IsHidden === true || item.IsDisabled === true || typeof item.HookMouseDown !== 'function')
        {
            return;
        }

        item.HookMouseDown();
    }

    private ItemMouseUp(item: MenuItem): void
    {
        if (item.IsHidden === true || item.IsDisabled === true || typeof item.HookMouseUp !== 'function')
        {
            return;
        }

        item.HookMouseUp();
    }

    /** 焦点项向上/下 */
    public UpDown(type: 'up' | 'down'): void
    {
        if (this.activeSubmenu.Instance === null)
        {
            if (this.itemList.length === 1)
            {
                this.itemList[0].IsFocus = true;
                return;
            }
    
            this.ToNextItem(this.focusItemIndex, this.focusItemIndex === -1 ? 0 : this.focusItemIndex, type, true);
        }
        else
        {
            this.activeSubmenu.Instance.UpDown(type);
        }
    }

    private ToNextItem(nowIndex: number, startIndex: number, type: 'up' | 'down', isFirst = false): void
    {
        if (startIndex === nowIndex && isFirst === false)
        {
            return;
        }

        if (this.itemList.length === 0)
        {
            return;
        }

        let vector = 1;
        if (type === 'up')
        {
            vector = -1;
            if (nowIndex + vector < 0)
            {
                this.ToNextItem(this.itemList.length, startIndex, type);
                return;
            }
        }
        else
        {
            if (nowIndex + vector > this.itemList.length - 1)
            {
                this.ToNextItem(-1, startIndex, type);
                return;
            }
        }

        if (this.itemList[nowIndex + vector].IsDisabled === true || this.itemList[nowIndex + vector].IsHidden === true)
        {
            this.ToNextItem(nowIndex + vector, startIndex, type);
            return;
        }
        this.focusItemIndex = nowIndex + vector;
        for (let temp of this.itemList)
        {
            temp.IsFocus = false;
        }
        this.itemList[this.focusItemIndex].IsFocus = true;
    }

    /**
     * 焦点项向左/右
     * 当向左且有父节点时，返回true
     * 当向右且有子节点时，返回true
     */
    public LeftRight(type: 'left' | 'right'): boolean
    {
        if (type === 'left')
        {
            if (this.activeSubmenu.Instance === null)
            {
                if (this.Parent === null)
                {
                    return false;
                }
                else
                {
                    this.Close();
                    return true;
                }
            }
            else
            {
                return this.activeSubmenu.Instance.LeftRight(type);
            }
        }
        else
        {
            if (this.focusItemIndex === -1)
            {
                return false;
            }

            if (this.itemList[this.focusItemIndex].Children.length === 0)
            {
                return false;
            }
            else
            {
                if (this.activeSubmenu.Instance === null)
                {
                    this.ItemEnter(this.itemList[this.focusItemIndex]);
                    (this.activeSubmenu.Instance as unknown as SubMenu).UpDown('down');
                    return true;
                }
                else
                {
                    return this.activeSubmenu.Instance.LeftRight(type);
                }
            }
        }
    }

    /** 触发当前项的点击事件 */
    public EnterItem(): void
    {
        if (this.focusItemIndex === -1)
        {
            return;
        }

        if (this.activeSubmenu.Instance === null)
        {
            if (this.itemList[this.focusItemIndex].Children.length > 0)
            {
                this.ItemEnter(this.itemList[this.focusItemIndex]);
                (this.activeSubmenu.Instance as unknown as SubMenu).UpDown('down');
            }
            else
            {
                this.ItemClick(this.itemList[this.focusItemIndex]);
            }
        }
        else
        {
            this.activeSubmenu.Instance.EnterItem();
        }
    }

    /** 关闭菜单 */
    public Close(): void
    {
        for (let temp of this.itemList)
        {
            temp.IsFocus = false;
        }
        this.focusItemIndex = -1;
        this.activeSubmenu.Instance?.Close();
        this.activeSubmenu.Instance = null;
        if (!!this.Parent === true)
        {
            (this.Parent as SubMenu).activeSubmenu.Instance = null;
        }
        if (this.Dom.parentElement === document.body)
        {
            document.body.removeChild(this.Dom);
        }
    }

    /** 显示隐藏菜单 */
    public Show(): void
    {
        this.visible = true;
        this.Dom.style.display = 'block';
    }

    /** 隐藏菜单 */
    public Hidden(): void
    {
        if (this.Parent === null)
        {
            for (let temp of this.itemList)
            {
                temp.IsFocus = false;
            }
            this.focusItemIndex = -1;
            this.visible = false;
            this.Dom.style.display = 'none';
            this.activeSubmenu.Instance?.Close();
            this.activeSubmenu.Instance = null;
        }
        else
        {
            this.Close();
        }
    }
}