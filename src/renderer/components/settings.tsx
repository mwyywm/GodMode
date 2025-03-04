import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useEffect, useState } from 'react';
import { Settings } from 'lib/types';
import { Button } from './ui/button';
import { Switch } from '@headlessui/react';
import {
	convertKeyCode,
	convertModifierKey,
	modifierKeys,
	isValidShortcut,
	type ShortcutKey,
} from 'lib/utils';
import { Input } from './ui/input';

export default function SettingsMenu({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [shortcut, setShortcut] = useState<string[]>([]);
	const [validShortcut, setValidShortcut] = useState<string[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [metaKey, setMetaKey] = useState('');
	const [openAtLogin, setOpenAtLogin] = useState(false);
	const [superpromptFocus, setSuperpromptFocus] = useState(false);
	const [zoomSetting, setZoomSetting] = useState(2);

	function classNames(...classes) {
		return classes.filter(Boolean).join(' ');
	}

	const settings = window.settings as Settings;
	let pressedKeys = new Set<string>();

	function recordShortcut(event: KeyboardEvent) {
		event.preventDefault();
		if (!isRecording) return;

		let workingShortcut = shortcut;
		const { key } = event;

		// const fetchPlatform = async () => {
		// 	const platform = await settings.getPlatform();
		// 	return platform;
		// };

		const pressedKey = modifierKeys.has(key as ShortcutKey)
			? convertModifierKey(key as ShortcutKey)
			: convertKeyCode(event.code);

		pressedKeys.add(pressedKey);
		workingShortcut = Array.from(pressedKeys);

		if (isValidShortcut(workingShortcut)) {
			pressedKeys.clear();
			setIsRecording(false);

			setValidShortcut([...workingShortcut]);
		}

		setShortcut([...workingShortcut]);
	}

	function keyUp(event: KeyboardEvent) {
		event.preventDefault();
		// if (!isRecording) return;
		const { key } = event;
		if (modifierKeys.has(key as ShortcutKey)) {
			pressedKeys.delete(convertModifierKey(key as ShortcutKey));
		} else {
			pressedKeys.delete(convertKeyCode(event.code));
		}
		if (key === 'Escape') setIsRecording(false);
	}

	// Set the meta key on mount based on platform (cmd on mac, ctrl on windows)
	useEffect(() => {
		const fetchPlatform = async () => {
			const platform = await settings.getPlatform();
			setMetaKey(platform === 'darwin' ? 'CmdOrCtrl' : 'Control');
		};
		if (isValidShortcut(shortcut)) fetchPlatform();
	}, []);

	// Set the initial super prompt focus and shortcut states from the main process on mount
	useEffect(() => {
		const displayShortcut = async () => {
			const initialShortcut = await settings.getGlobalShortcut();
			console.debug('initialShortcut', initialShortcut);
			setShortcut(initialShortcut?.split('+'));
		};
		const setInitialSuperpromptFocus = async () => {
			const initialState = await settings.getFocusSuperpromptSetting();
			setSuperpromptFocus(initialState);
		};
		displayShortcut();
		setInitialSuperpromptFocus();
	}, []);

	// Whenever shortcut is updated, update it in the electron store in the main process via IPC
	useEffect(() => {
		if (!isValidShortcut(validShortcut)) return;
		const updateShortcut = async (shortcut: string[]) => {
			const newShortcut = shortcut.join('+');
			const sc = await settings.setGlobalShortcut(newShortcut);
			setValidShortcut([]);
		};
		updateShortcut(validShortcut);
	}, [validShortcut]);
	// Toggle superprompt focus setting in electron store
	useEffect(() => {
		const updateSuperpromptFocus = async () => {
			await settings.setFocusSuperpromptSetting(superpromptFocus);
		};
		updateSuperpromptFocus();
	}, [superpromptFocus]);
	// Turn on key listeners when recording shortcuts
	useEffect(() => {
		if (isRecording && validShortcut.length === 0) {
			console.log('inside recording');
			window.addEventListener('keydown', recordShortcut);
			window.addEventListener('keyup', keyUp);
		} else {
			console.log('inside not recording');
			window.removeEventListener('keydown', recordShortcut);
			window.removeEventListener('keyup', keyUp);
		}
		return () => {
			window.removeEventListener('keydown', recordShortcut);
			window.removeEventListener('keyup', keyUp);
		};
	}, [isRecording, validShortcut]);

	// Turn off recording when the dialog is closed
	useEffect(() => {
		if (!open) setIsRecording(false);
	}, [open]);

	useEffect(() => {
		const fetchOpenAtLogin = async () => {
			const isOpen = await settings.getOpenAtLogin();
			setOpenAtLogin(isOpen);
		};
		fetchOpenAtLogin();
	}, []);

	useEffect(() => {
		openAtLogin
			? window.electron.browserWindow.enableOpenAtLogin()
			: window.electron.browserWindow.disableOpenAtLogin();
	}, [openAtLogin]);

	useEffect(() => {
		const fetchZoomSetting = async () => {
			const level = await settings.getZoomSetting();
			setZoomSetting(level);
		};
		fetchZoomSetting();
	}, []);

	useEffect(() => {
		const updateZoomSetting = async () => {
			await settings.setZoomSetting(zoomSetting);
		};
		updateZoomSetting();
	}, [zoomSetting]);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="bg-white">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>
				<Switch.Group as="div" className="flex items-center justify-between">
					<span className="flex flex-col flex-grow">
						<Switch.Label
							as="span"
							className="text-sm font-medium leading-6 text-gray-900"
							passive
						>
							Automatically Open GodMode at Login
						</Switch.Label>
					</span>
					<Switch
						checked={openAtLogin}
						onChange={setOpenAtLogin}
						className={classNames(
							openAtLogin ? 'bg-indigo-600' : 'bg-gray-200',
							'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
						)}
					>
						<span
							aria-hidden="true"
							className={classNames(
								openAtLogin ? 'translate-x-5' : 'translate-x-0',
								'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
							)}
						/>
					</Switch>
				</Switch.Group>
				<Switch.Group as="div" className="flex items-center justify-between">
					<span className="flex flex-col flex-grow">
						<Switch.Label
							as="span"
							className="text-sm font-medium leading-6 text-gray-900"
							passive
						>
							Focus Superprompt on Quick Open Shortcut
						</Switch.Label>
					</span>
					<Switch
						checked={superpromptFocus}
						onChange={setSuperpromptFocus}
						className={classNames(
							superpromptFocus ? 'bg-indigo-600' : 'bg-gray-200',
							'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
						)}
					>
						<span
							aria-hidden="true"
							className={classNames(
								superpromptFocus ? 'translate-x-5' : 'translate-x-0',
								'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
							)}
						/>
					</Switch>
				</Switch.Group>
				<div className="flex items-center justify-between py-4">
					<span className="text-sm font-medium leading-6 text-gray-900">
						Preview Zoom Level
					</span>
					<Input
						type="number"
						min={0}
						max={6}
						step={0.5}
						value={zoomSetting}
						onChange={(e) => {
							const value = +parseFloat(e.target.value).toFixed(2);
							if (!isNaN(value) && value >= 0 && value <= 6) {
								setZoomSetting(value);
							}
						}}
						className="w-20 text-center"
					/>
				</div>
				<span className="flex flex-col flex-grow">
					<div
						as="span"
						className="text-sm font-medium leading-6 text-gray-900"
						passive
					>
						Change Shortcut
					</div>
				</span>

				<div
					id="accelerator-container"
					className="flex flex-row justify-center"
				>
					{shortcut?.map((key, index) => (
						<div key={index} className="flex items-center">
							<div className="px-2 py-1 text-xs bg-gray-200 rounded-md dark:bg-gray:700">
								{key}
							</div>
							<div className="mx-2 text-sm">
								{index < shortcut.length - 1 && '+'}
							</div>
						</div>
					))}
				</div>
				{isRecording ? (
					<Button
						onClick={() => setIsRecording(!isRecording)}
						variant="outline"
						className="text-red-500"
					>
						Recording...
					</Button>
				) : (
					<Button
						onClick={() => setIsRecording(!isRecording)}
						variant="outline"
						className=""
					>
						Record shortcut
					</Button>
				)}
			</DialogContent>
		</Dialog>
	);
}
