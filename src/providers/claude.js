const Provider = require('./provider');

class Claude extends Provider {
	static webviewId = 'webviewCLAUDE';
	static fullName = 'Anthropic Claude';
	static shortName = 'Claude.ai';

	static url = 'https://claude.ai/new';

	static handleInput(input) {
		this.getWebview().executeJavaScript(`{
    var inputElement = document.querySelector('div.ProseMirror')
		if (inputElement) {
			inputElement.innerHTML = \`${input}\`
		}
	}`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
		var btn = document.querySelector('button[aria-label="Send message"]')
		if (btn) {
			btn.disabled = false;
			btn.click();
		}
  }`);
	}

	static handleCss() {
		// this.getWebview().addEventListener('dom-ready', () => {});
	}

	static handleDarkMode(isDarkMode) {
		if (isDarkMode) {
			this.getWebview().insertCSS(`
				body {
					background-color: #1d1d1d !important;
					filter: invert(100%) hue-rotate(180deg);
				}
			`);
		} else {
			this.getWebview().insertCSS(`
				body {
					background-color: #ffffff !important;
					filter: none;
				}
			`);
		}
	}

	static getUserAgent() {
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
	}

	static isEnabled() {
		return window.electron.electronStore.get(`${this.webviewId}Enabled`, true);
	}
}

module.exports = Claude;
