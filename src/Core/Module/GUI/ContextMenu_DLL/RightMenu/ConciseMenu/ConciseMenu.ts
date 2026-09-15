import ContextMenu from '../../ContextMenu';
import EntityPosition from '../../Entity/EntityPosition';
import MenuItem from '../../MenuItem';

/** 右键菜单[剪切, 复制, 粘贴] */
export default class ConciseMenu
{
    private static instance: ConciseMenu | null = null;
    private contextMenu!: ContextMenu | null;
    private event!: MouseEvent;
    private clipboard = navigator.clipboard;

    constructor() {}

    public static GetInstance(): ConciseMenu
    {
        if (ConciseMenu.instance === null)
        {
            ConciseMenu.instance = new ConciseMenu();
        }
        
        return ConciseMenu.instance;
    }

    public ShowContextMenu(e: MouseEvent): void
    {
        this.event = e;
        e.preventDefault();

        if (!!this.contextMenu === true)
        {
            let position = new EntityPosition(this.event.pageX, this.event.pageY);
            (this.contextMenu as ContextMenu).Position = position;
            (this.contextMenu as ContextMenu).Show();
            return;
        }

        let itemList = new Array<MenuItem>();

        let item = new MenuItem();
        item.LeftText = '剪切';
        item.HookMouseDown = this.SetFocus.bind(this);
        item.HookClick = this.Cut.bind(this);
        itemList.push(item);

        let item2 = new MenuItem();
        item2.LeftText = '复制';
        item2.HookMouseDown = this.SetFocus.bind(this);
        item2.HookClick = this.Copy.bind(this);
        itemList.push(item2);

        let item3 = new MenuItem();
        item3.LeftText = '粘贴';
        item3.HookMouseDown = this.SetFocus.bind(this);
        item3.HookClick = this.Paste.bind(this);
        itemList.push(item3);

        let position = new EntityPosition(this.event.pageX, this.event.pageY);
        this.contextMenu = new ContextMenu(position, itemList, true);
    }

    public IsShowMenu(): boolean
    {
        return !!this.contextMenu && this.contextMenu.IsShow;
    }

    private Cut(): void
    {
        if (!!(window as any).getSelection().toString() === false)
        {
            if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
            {
                (this.event.target as HTMLInputElement).focus();
                (this.event.target as HTMLInputElement).setSelectionRange((this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
            }
            return;
        }
        this.clipboard.writeText((window.getSelection() as Selection).toString());
        if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
        {
            this.CutInputType(this.event.target as HTMLInputElement, (this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
        }
        else
        {
            let sel = window.getSelection() as Selection;
            sel.deleteFromDocument();
        }
    }

    private Copy(e: MouseEvent): void
    {
        if (!!(window as any).getSelection().toString() === false)
        {
            if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
            {
                (this.event.target as HTMLInputElement).focus();
                (this.event.target as HTMLInputElement).setSelectionRange((this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
            }
            return;
        }
        this.clipboard.writeText((window as any).getSelection().toString());

        if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
        {
            this.CopyInputType(this.event.target as HTMLInputElement, (this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
        }
    }
    
    private async Paste(e: MouseEvent): Promise<void>
    {
        if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
        {
            this.PasteInputType(this.event.target as HTMLInputElement, (this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
        }
        else
        {
            let sel = window.getSelection() as Selection;
            sel.deleteFromDocument();
            let r = sel.getRangeAt(0);
            r.insertNode(document.createTextNode(await this.clipboard.readText()));
        }
    }

    private CopyInputType(dom: HTMLInputElement, start: number, end: number): void
    {
        dom.focus();
        dom.setSelectionRange(start, end);
    }

    private CutInputType(dom: HTMLInputElement, start: number, end: number): void
    {
        dom.focus();
        if (dom.readOnly === true)
        {
            return;
        }

        const event = new Event('input', { bubbles: false, cancelable: true });
        dom.value = dom.value.substring(0, start) + dom.value.substring(end);
        dom.dispatchEvent(event);
        dom.setSelectionRange(start, start);
    }

    private async PasteInputType(dom: HTMLInputElement, start: number, end: number): Promise<void>
    {
        let text = await this.clipboard.readText();
        dom.focus();
        if (dom.readOnly === true)
        {
            return;
        }

        const event = new Event('input', { bubbles: false, cancelable: true });
        dom.value = dom.value.substring(0, start) + text + dom.value.substring(end, dom.value.length);
        dom.dispatchEvent(event);
        dom.setSelectionRange(start + text.length, start + text.length);
    }

    private SetFocus(): void
    {
        if ((this.event.target as Element).nodeName === 'INPUT' || (this.event.target as Element).nodeName === 'TEXTAREA')
        {
            setTimeout(() =>
            {
                (this.event.target as HTMLInputElement).focus();
                (this.event.target as HTMLInputElement).setSelectionRange((this.event.target as HTMLInputElement).selectionStart as number, (this.event.target as HTMLInputElement).selectionEnd as number);
            }, 1);
        }
    }
}