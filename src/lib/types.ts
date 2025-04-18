import Provider from 'providers/provider';

export interface ProviderInterface {
	new (): Provider;
	fullName: string;
	shortName: string;
	webviewId: string;
	getWebview(): Electron.WebviewTag;
	url: string;
	paneId(): string;
	setupCustomPasteBehavior(): void;
	handleInput(input: string): void;
	handleSubmit(input?: string): void;
	handleCss(): void;
	handleDarkMode(bool: boolean): void;
	getUserAgent(): string;
	isEnabled(): boolean;
	setEnabled(enabled: boolean): void;
	clearCookies?(): void;

	codeForInputElement?: string;
	codeForSetInputElementValue?(prompt: string): void;
	codeForClickingSubmit?: string;
	codeForExtractingResponse?: string;
}

export interface Settings {
	getGlobalShortcut: () => Promise<string>;
	setGlobalShortcut: (shortcut: string) => Promise<boolean>;
	getFocusSuperpromptSetting: () => Promise<boolean>;
	setFocusSuperpromptSetting: (state: boolean) => Promise<boolean>;
	getZoomSetting: () => Promise<number>;
	setZoomSetting: (level: number) => Promise<boolean>;
	getPlatform: () => Promise<string>;
}

// Tell typescript that the window object has a property called settings
declare global {
	interface Window {
		settings: Settings;
	}
}
