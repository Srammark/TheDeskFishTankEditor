
export namespace Schemas {

	/**
	 * A schema that is used for models that exist in memory
	 * only and that have no correspondence on a server or such.
	 */
	export const inMemory = 'inmemory';

	/**
	 * A schema that is used for setting files
	 */
	export const indexedDB = 'indexedDB';

	/**
	 * A schema that is used for internal private files
	 */
	export const internal = 'private';

	/**
	 * A walk-through document.
	 */
	export const walkThrough = 'walkThrough';

	/**
	 * An embedded code snippet.
	 */
	export const walkThroughSnippet = 'walkThroughSnippet';

	export const http = 'http';

	export const https = 'https';

	export const file = 'file';

	export const mailto = 'mailto';

	export const untitled = 'untitled';

	export const data = 'data';

	export const command = 'command';

	export const vscodeRemote = 'vscode-remote';

	export const vscodeRemoteResource = 'vscode-remote-resource';

	export const vscodeManagedRemoteResource = 'vscode-managed-remote-resource';

	export const vscodeUserData = 'vscode-userdata';

	export const vscodeCustomEditor = 'vscode-custom-editor';

	export const vscodeNotebookCell = 'vscode-notebook-cell';
	export const vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
	export const vscodeNotebookCellMetadataDiff = 'vscode-notebook-cell-metadata-diff';
	export const vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
	export const vscodeNotebookCellOutputDiff = 'vscode-notebook-cell-output-diff';
	export const vscodeNotebookMetadata = 'vscode-notebook-metadata';
	export const vscodeInteractiveInput = 'vscode-interactive-input';

	export const vscodeSettings = 'vscode-settings';

	export const vscodeWorkspaceTrust = 'vscode-workspace-trust';

	export const vscodeTerminal = 'vscode-terminal';

	/** Scheme used for code blocks in chat. */
	export const vscodeChatCodeBlock = 'vscode-chat-code-block';

	/** Scheme used for LHS of code compare (aka diff) blocks in chat. */
	export const vscodeChatCodeCompareBlock = 'vscode-chat-code-compare-block';

	/** Scheme used for the chat input editor. */
	export const vscodeChatEditor = 'vscode-chat-editor';

	/** Scheme used for the chat input part */
	export const vscodeChatInput = 'chatSessionInput';

	/** Scheme for chat session content */
	export const vscodeChatSession = 'vscode-chat-session';

	/**
	 * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
	 */
	export const webviewPanel = 'webview-panel';

	/**
	 * Scheme used for loading the wrapper html and script in webviews.
	 */
	export const vscodeWebview = 'vscode-webview';

	/**
	 * Scheme used for extension pages
	 */
	export const extension = 'extension';

	/**
	 * Scheme used as a replacement of `file` scheme to load
	 * files with our custom protocol handler (desktop only).
	 */
	export const vscodeFileResource = 'vscode-file';

	/**
	 * Scheme used for temporary resources
	 */
	export const tmp = 'tmp';

	/**
	 * Scheme used vs live share
	 */
	export const vsls = 'vsls';

	/**
	 * Scheme used for the Source Control commit input's text document
	 */
	export const vscodeSourceControl = 'vscode-scm';

	/**
	 * Scheme used for input box for creating comments.
	 */
	export const commentsInput = 'comment';

	/**
	 * Scheme used for special rendering of settings in the release notes
	 */
	export const codeSetting = 'code-setting';

	/**
	 * Scheme used for output panel resources
	 */
	export const outputChannel = 'output';

	/**
	 * Scheme used for the accessible view
	 */
	export const accessibleView = 'accessible-view';

	/**
	 * Used for snapshots of chat edits
	 */
	export const chatEditingSnapshotScheme = 'chat-editing-snapshot-text-model';
	export const chatEditingModel = 'chat-editing-text-model';
}