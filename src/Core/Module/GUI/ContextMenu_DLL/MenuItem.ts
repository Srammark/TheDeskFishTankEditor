export default class MenuItem
{
    private dom = document.createElement('div');
    /** div对象 */
    public get Dom(): HTMLDivElement { return this.dom; }

    private itemDom = document.createElement('div');
    /** 菜单项的div对象 */
    public get ItemDom(): HTMLDivElement { return this.itemDom; }

    private isFirstBind = true;
    /** 是否第一次绑定 */
    public get IsFirstBind(): boolean { return this.isFirstBind }
    public set IsFirstBind(v: boolean)
    {
        if (this.isFirstBind === v)
        {
            return;
        }

        this.isFirstBind = v;
    }
    
    private order = -1;
    /** 摆放顺序 越小越前面 */
    public get Order(): number { return this.order }
    public set Order(v: number)
    {
        if (this.order === v)
        {
            return;
        }

        this.order = v;
    }

    private hasIcon = false;
    /** 是否展示图标 */
    public get HasIcon(): boolean { return this.hasIcon }
    public set HasIcon(v: boolean)
    {
        if (this.hasIcon === v)
        {
            return;
        }

        this.hasIcon = v;
    }

    private leftText = '';
    /** 左侧文字 */
    public get LeftText(): string { return this.leftText }
    public set LeftText(v: string)
    {
        if (this.leftText === v)
        {
            return;
        }

        this.leftText = v;
        this.leftTextDom.innerText = v;
    }

    private altText = '';
    /** Alt文字 */
    public get AltText(): string { return this.altText }
    public set AltText(v: string)
    {
        if (this.altText === v)
        {
            return;
        }

        this.altText = v;
        this.altTextDom.innerText = v;
        if (v === '')
        {
            this.altBoxDom.style.display = 'none';
        }
        else
        {
            this.altBoxDom.style.display = 'flex';
        }
    }

    private rightText = '';
    /** 右侧文字 */
    public get RightText(): string { return this.rightText }
    public set RightText(v: string)
    {
        if (this.rightText === v)
        {
            return;
        }

        this.rightText = v;
        this.rightTextDom.innerText = v;
    }

    private isHidden = false;
    /** 是否隐藏菜单项 */
    public get IsHidden(): boolean { return this.isHidden }
    public set IsHidden(v: boolean)
    {
        if (this.isHidden === v)
        {
            return;
        }

        this.isHidden = v;
        if (v === true)
        {
            this.Dom.style.display = 'flex';
            if (this.ShowDivided === true)
            {
                this.dividedDom.style.display = 'block';
            }
        }
        else
        {
            this.Dom.style.display = 'none';
            if (this.ShowDivided === true)
            {
                this.dividedDom.style.display = 'none';
            }
        }
    }
    
    private isFocus = false;
    /** 是否处于聚焦状态 */
    public get IsFocus(): boolean { return this.isFocus }
    public set IsFocus(v: boolean)
    {
        if (this.IsHidden === true || this.IsDisabled === true || this.isFocus === v)
        {
            return;
        }

        this.isFocus = v;
        if (v === true)
        {
            this.ItemDom.classList.remove('cMenu_sub_item-available');
            this.ItemDom.classList.add('cMenu_sub_item-focus');
        }
        else
        {
            this.ItemDom.classList.remove('cMenu_sub_item-focus');
            this.ItemDom.classList.add('cMenu_sub_item-available');
        }
    }

    private isDisabled = false;
    /** 是否禁用菜单项 */
    public get IsDisabled(): boolean { return this.isDisabled }
    public set IsDisabled(v: boolean)
    {
        if (this.isDisabled === v)
        {
            return;
        }

        this.isDisabled = v;
        if (v === true)
        {
            this.ItemDom.classList.remove('cMenu_sub_item-available');
            this.ItemDom.classList.add('cMenu_sub_item-disabled');
        }
        else
        {
            this.ItemDom.classList.remove('cMenu_sub_item-disabled');
            this.ItemDom.classList.add('cMenu_sub_item-available');
        }
    }

    private showDivided = false;
    /** 是否显示分割线 */
    public get ShowDivided(): boolean { return this.showDivided }
    public set ShowDivided(v: boolean)
    {
        if (this.showDivided === v)
        {
            return;
        }

        this.showDivided = v;
        if (v === true)
        {
            // 确保分割线按位置放置
            this.RepositionDivided();
            this.dividedDom.style.display = 'flex';
        }
        else
        {
            this.dividedDom.style.display = 'none';
        }
    }

    private dividedPosition: 'top' | 'bottom' = 'top';
    /** 分割线显示位置，'top' 表示在菜单项上方，'bottom' 表示在下方，默认为 'top' */
    public get DividedPosition(): 'top' | 'bottom' { return this.dividedPosition }
    public set DividedPosition(v: 'top' | 'bottom')
    {
        if (this.dividedPosition === v)
        {
            return;
        }

        this.dividedPosition = v;
        // 如果当前分割线正在显示，则需要重新定位 DOM
        if (this.showDivided === true)
        {
            this.RepositionDivided();
        }
    }

    private showArrow = false;
    /** 是否显示箭头 */
    public get ShowArrow(): boolean { return this.showArrow }
    public set ShowArrow(v: boolean)
    {
        if (this.showArrow === v)
        {
            return;
        }
        
        this.showArrow = v;
        if (v === true)
        {
            this.arrowDom.style.display = 'flex';
        }
        else
        {
            this.arrowDom.style.display = 'none';
        }
    }

    private customClass = '';
    /** 自定义子菜单class */
    public get CustomClass(): string { return this.customClass }
    public set CustomClass(v: string)
    {
        if (this.customClass === v)
        {
            return;
        }

        this.customClass = v;
    }

    private minWidth = 20;
    /** 子菜单最小宽度 */
    public get MinWidth(): number { return this.minWidth }
    public set MinWidth(v: number)
    {
        if (this.minWidth === v)
        {
            return;
        }

        this.minWidth = v;
    }

    private children = new Array<MenuItem>();
    /** 子菜单结构信息 */
    public get Children(): Array<MenuItem> { return this.children }
    public set Children(v: Array<MenuItem>) { this.children = v }

    /** 菜单项点击事件 */
    public HookClick!: Function;
    /** 菜单项鼠标按下事件 */
    public HookMouseDown!: Function;
    /** 菜单项鼠标抬起事件 */
    public HookMouseUp!: Function;

    private iconBoxDom = document.createElement('div');
    private iconDom = document.createElement('div');
    private leftBoxDom = document.createElement('div');
    private leftTextDom = document.createElement('span');
    private altBoxDom = document.createElement('div');
    private altTextDom = document.createElement('span');
    private rightBoxDom = document.createElement('div');
    private rightTextDom = document.createElement('span');
    private arrowBoxDom = document.createElement('div');
    private arrowDom = document.createElement('div');
    private dividedDom = document.createElement('div');

    constructor()
    {
        this.itemDom.className = 'wR_HSVCB cMenu_sub_item cMenu_sub_item-available';
        this.Dom.appendChild(this.itemDom);
        this.CreateItem();
    }

    private CreateItem(): void
    {
        this.CreateIconBox();
        this.CreateLeftBox();
        this.CreateRightBox();
        this.CreateArrowBox();
        this.CreateDivided();
    }

    private CreateIconBox(): void
    {
        this.iconBoxDom.className = 'wR_HSVCB cMenu_sub_item_icon';
        this.iconDom.style.width = '100%';
        this.iconDom.style.height = '100%';
        this.iconBoxDom.appendChild(this.iconDom);
        this.itemDom.appendChild(this.iconBoxDom);
    }

    private CreateLeftBox(): void
    {
        this.leftBoxDom.className = 'wR_HSVCB cMenu_sub_item_left';
        this.leftBoxDom.appendChild(this.leftTextDom);
        this.itemDom.appendChild(this.leftBoxDom);
        this.CreateAltBox();
    }

    private CreateAltBox(): void
    {
        this.altBoxDom.className = 'wR_HSVCB cMenu_sub_item_alt';

        const leftBracketDom = document.createElement('span');
        leftBracketDom.innerText = '(';
        this.altBoxDom.appendChild(leftBracketDom);

        this.altTextDom = document.createElement('span');
        this.altTextDom.className = 'cMenu_sub_item_alt_text';
        this.altTextDom.innerText = this.AltText;
        this.altBoxDom.appendChild(this.altTextDom);

        const rightBracketDom = document.createElement('span');
        rightBracketDom.innerText = ')';
        this.altBoxDom.appendChild(rightBracketDom);

        if (this.AltText === '')
        {
            this.altBoxDom.style.display = 'none';
        }
        else
        {
            this.altBoxDom.style.display = 'flex';
        }

        this.leftBoxDom.appendChild(this.altBoxDom);
    }

    private CreateRightBox(): void
    {
        this.rightBoxDom.className = 'wR_HSVCB cMenu_sub_item_right';
        this.rightBoxDom.appendChild(this.rightTextDom);
        this.itemDom.appendChild(this.rightBoxDom);
    }

    private CreateArrowBox(): void
    {
        this.arrowBoxDom.className = 'wR_HSVCB cMenu_sub_item_arrow';
        this.arrowDom.className = 'wR_HSVC';
        this.arrowDom.innerHTML = `
        <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M702.6312 520.098445 356.711749 170.45723 321.103764 205.930139 634.023636 517.722328 321.63179 813.354466 357.135398 848.729138 669.533384 553.097 669.455613 553.108257Z" fill="#515151"></path>
        </svg>`;
        this.arrowDom.style.display = 'none';
        this.arrowBoxDom.appendChild(this.arrowDom);
        this.itemDom.appendChild(this.arrowBoxDom);
    }

    private CreateDivided(): void
    {
        this.dividedDom.className = 'wR_HC';
        this.dividedDom.style.display = 'none';
        let placeholder = document.createElement('div');
        placeholder.className = 'cMenu_sub_item_divided_placeholder';
        let line = document.createElement('div');
        line.className = 'cMenu_sub_item_divided';

        this.dividedDom.appendChild(placeholder);
        this.dividedDom.appendChild(line);
        // 根据分割线位置决定插入到上方还是下方，默认上方
        this.RepositionDivided();
    }

    private RepositionDivided(): void
    {
        // 确保 dividedDom 已经创建
        if (!this.dividedDom || !this.itemDom || !this.Dom)
        {
            return;
        }

        // 如果 dividedDom 尚未是 Dom 的子元素，先添加（append），后续再定位
        if (this.dividedDom.parentElement !== this.Dom)
        {
            this.Dom.appendChild(this.dividedDom);
        }

        if (this.dividedPosition === 'top')
        {
            // 插入到 itemDom 之前（上方）
            this.Dom.insertBefore(this.dividedDom, this.itemDom);
        }
        else
        {
            // 插入到 itemDom 之后（下方）
            if (this.itemDom.nextSibling)
            {
                this.Dom.insertBefore(this.dividedDom, this.itemDom.nextSibling);
            }
            else
            {
                this.Dom.appendChild(this.dividedDom);
            }
        }
    }

    /** 设置图标
     * svg需要带上<svg>标签
     */
    public SetIcon(type: 'path' | 'svg', text: string): void
    {
        this.iconDom.innerHTML = '';
        switch (type) {
            case 'path':
                let img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                img.src = text;
                this.iconDom.appendChild(img);
                break;
            case 'svg':
                this.iconDom.innerHTML = text;
                break;
        }
        this.HasIcon = true;
    }

    /** 显示或隐藏Alt文字下划线 */
    public SetAltUnderline(show: boolean): void
    {
        if (show === true)
        {
            this.altTextDom.classList.add('underline');
        }
        else
        {
            this.altTextDom.classList.remove('underline');
        }
    }
}
