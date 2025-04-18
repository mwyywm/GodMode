import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
// https://electron-react-boilerplate.js.org/docs/styling#tailwind-integration
import Pane from 'components/pane';
import { allProviders } from 'lib/constants';
import React from 'react';
import Split from 'react-split';
import 'tailwindcss/tailwind.css';
import { CmdOrCtrlKey, getEnabledProviders } from 'lib/utils';
import './App.css';
import { BrowserPane } from './browserPane';
import { ProviderInterface } from 'lib/types';
import { TitleBar } from './TitleBar';
import SettingsMenu from './components/settings';

// @ts-ignore
export type paneInfo = { webviewId: string; shortName: string };
const defaultPaneList = getEnabledProviders(
	allProviders as ProviderInterface[],
).map((x) => ({
	webviewId: x.webviewId,
	shortName: x.shortName,
})); // in future we will have to disconnect the provider from the webview Id
const storedPaneList: paneInfo[] = window.electron.electronStore.get(
	'paneList',
	defaultPaneList,
);

export default function Layout() {
	const [superprompt, setSuperprompt] = React.useState('');
	const [paneList, setPaneList] = React.useState(storedPaneList);
	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

	const originalAlwaysOnTop = window.electron.browserWindow.getAlwaysOnTop();
	const [isAlwaysOnTop, setisAlwaysOnTop] = React.useState(originalAlwaysOnTop);
	const toggleIsAlwaysOnTop = () => {
		const newstate = window.electron.browserWindow.getAlwaysOnTop();
		setisAlwaysOnTop(!newstate);
		window.electron.browserWindow.setAlwaysOnTop(!newstate);
	};

	const enabledProviders = paneList.map(
		(x) => allProviders.find((y) => y.webviewId === (x.webviewId || x.id))!,
	);

	const [sizes, setSizes] = React.useState(updateSplitSizes(enabledProviders));

	React.useEffect(() => {
		window.electron.electronStore.set('paneList', paneList);
	}, [paneList]);

	const resetPaneList = () => setPaneList(defaultPaneList);

	const nonEnabledProviders: ProviderInterface[] = allProviders.filter(
		(x) => !enabledProviders.includes(x),
	);

	/*
	 * Apply provider-specific CSS and custom paste behavior
	 */
	React.useEffect(() => {
		enabledProviders.forEach((provider) => {
			provider.handleCss();
			provider.setupCustomPasteBehavior();
		});
	}, [enabledProviders]);

	React.useEffect(() => {
		enabledProviders.forEach((provider) => {
			// Call provider-specific CSS handling and custom paste setup
			try {
				// regex to sanitize superprompt from backticks since we will put it into a template string
				// solves https://github.com/smol-ai/GodMode/issues/218
				provider.handleInput(superprompt.replace(/`/g, '\\`'));
			} catch (err) {
				console.error('error settling ' + provider.paneId(), err);
			}
		});
	}, [enabledProviders, superprompt]);

	const SuperPromptEnterKey = window.electron.electronStore.get(
		'SuperPromptEnterKey',
		false,
	);

	function submitProviders() {
		enabledProviders.forEach((provider) => {
			provider.handleSubmit(superprompt);
		});
	}

	function enterKeyHandler(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		const isCmdOrCtrl = event.metaKey || event.ctrlKey;
		const isEnter = event.key === 'Enter';

		if ((SuperPromptEnterKey && isEnter) || (isCmdOrCtrl && isEnter)) {
			event.preventDefault();
			submitProviders();
		}
	}

	function updateSplitSizes(panes: any[], focalIndex: number | null = null) {
		const remainingWidth = 100;
		// Handle specific pane focus
		if (focalIndex !== null || focalIndex === 'A') {
			let sizes = new Array(panes.length).fill(0);
			sizes[focalIndex] = remainingWidth;
			return sizes;
		} else {
			// Evenly distribute remaining space among all panes
			let remainingPercentage = remainingWidth / panes.length;
			let sizes = new Array(panes.length).fill(remainingPercentage);
			return sizes;
		}
	}

	const paneShortcutKeys: Record<string, number | null> = {};
	for (let i = 0; i < enabledProviders.length; i++) {
		paneShortcutKeys[`${i + 1}`] = i;
	}

	console.warn('paneShortcutKeys', paneShortcutKeys);

	const [currentlyOpenPreviewPane, setOpenPreviewPane] = React.useState(0);

	async function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		const isCmdOrCtrl = event.metaKey || event.ctrlKey;
		const isShift = event.shiftKey;
		console.debug('keydown', event.key, isCmdOrCtrl, event);
		if (
			isCmdOrCtrl &&
			(event.key in paneShortcutKeys ||
				(event.code.match(/Digit[1-9]/) &&
					event.code[event.code.length - 1] in paneShortcutKeys))
		) {
			const digit = +event.key || +event.code[event.code.length - 1];
			if (paneShortcutKeys[digit] === null) {
				window.electron.browserWindow.reload(); // this is a hack; setSizes by itself does not seem to update the splits, seems like a bug, but we dont have a choice here
			} else {
				setOpenPreviewPane(digit);
				const previewProvider = enabledProviders.find(
					(provider) =>
						provider.webviewId === storedPaneList[digit - 1].webviewId,
				);
				const zoomSetting =
					// @ts-ignore
					previewProvider.getWebview()?.getZoomLevel() +
					(await window.settings.getZoomSetting());
				// @ts-ignore
				previewProvider.getWebview().setZoomLevel(zoomSetting);
			}
		} else if (isCmdOrCtrl && isShift && event.key.toLowerCase() === 'a') {
			window.electron.browserWindow.reload();
			window.electron.mainWindow.focusSuperprompt();
		} else if (
			(isCmdOrCtrl && event.key === '+') ||
			(isCmdOrCtrl && event.key === '=')
		) {
			// Increase zoom level with Cmd/Ctrl + '+' or '='
			enabledProviders.forEach((provider) => {
				// @ts-ignore
				provider
					.getWebview()
					// @ts-ignore
					.setZoomLevel(provider.getWebview().getZoomLevel() + 1);
			});
		} else if (isCmdOrCtrl && event.key === '0') {
			// reset zoomlevel
			enabledProviders.forEach((provider) => {
				// @ts-ignore
				provider
					.getWebview()
					// @ts-ignore
					.setZoomLevel(0);
			});
		} else if (isCmdOrCtrl && event.key === '-') {
			// Decrease zoom level with Cmd/Ctrl + '-'
			enabledProviders.forEach((provider) => {
				// @ts-ignore
				provider
					.getWebview()
					// @ts-ignore
					.setZoomLevel(provider.getWebview().getZoomLevel() - 1);
			});
		} else if (isCmdOrCtrl && event.key === 'p') {
			toggleIsAlwaysOnTop();
		} else if (
			event.shiftKey &&
			event.metaKey &&
			(event.key === 'L' || event.key === 'l')
		) {
			// Toggle dark mode with Cmd/Ctrl + Shift + L
			let isDarkMode = window.electron.electronStore.get('isDarkMode', false);
			isDarkMode = !isDarkMode;
			window.electron.electronStore.set('isDarkMode', isDarkMode);

			enabledProviders.forEach((provider) => {
				provider.handleDarkMode(isDarkMode);
			});
		}

		enterKeyHandler(event);
	}

	return (
		<div className="flex flex-col">
			<TitleBar {...{ isAlwaysOnTop, toggleIsAlwaysOnTop }} />
			<SettingsMenu
				open={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
			<Split
				sizes={sizes}
				minSize={0}
				expandToMin={false}
				gutterSize={3}
				gutterAlign="center"
				// snapOffset={30}
				dragInterval={1}
				direction="horizontal"
				// cursor="col-resize"
				className="flex"
			>
				{enabledProviders.map((provider, index) => (
					<Pane
						provider={provider as ProviderInterface}
						number={index + 1}
						currentlyOpenPreviewPane={currentlyOpenPreviewPane}
						setOpenPreviewPane={setOpenPreviewPane}
						key={index}
					/>
				))}
			</Split>
			<div
				// not a form, because the form submit causes a reload for some reason even if we preventdefault.
				id="form"
				className=""
				// onKeyDown={handleSubmit}
			>
				<div id="form-wrapper">
					<textarea
						rows={4}
						className="resize-none"
						id="prompt"
						value={superprompt}
						onChange={(e) => setSuperprompt(e.target.value)}
						onKeyDown={onKeyDown}
						name="prompt"
						placeholder={`Enter a superprompt here.
- Quick Open: ${CmdOrCtrlKey}+Shift+G or Submit: ${CmdOrCtrlKey}+Enter
- Switch windows: ${CmdOrCtrlKey}+1/2/3/etc, or Global Resize/Pin: ${CmdOrCtrlKey} -/+/p
- New chat: ${CmdOrCtrlKey}+R or Reset windows evenly: ${CmdOrCtrlKey}+Shift+A`}
					/>
					<div className="flex items-center justify-center p-4 space-x-2">
						<button
							className="flex items-center justify-center w-12 h-12 p-1 text-white transition bg-gray-600 rounded-lg shadow-inner hover:bg-gray-200"
							id="btn"
							onClick={submitProviders}
							type="submit"
							title={`${CmdOrCtrlKey}+Enter to submit`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
								/>
							</svg>
						</button>
						<BrowserPane
							{...{
								superprompt,
								setSuperprompt,
								paneList,
								setPaneList,
								resetPaneList,
								nonEnabledProviders,
								isAlwaysOnTop,
								toggleIsAlwaysOnTop,
								isSettingsOpen,
								setIsSettingsOpen,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
