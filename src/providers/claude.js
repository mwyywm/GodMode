const Provider = require('./provider');

class Claude extends Provider {
	static webviewId = 'webviewCLAUDE';
	static fullName = 'Anthropic Claude';
	static shortName = 'Claude.ai';

	static url = 'https://claude.ai/chats/';

	static handleInput(input) {
		const fullName = this.fullName;
		this.getWebview().executeJavaScript(`{
    var inputElement = document.querySelector('div.ProseMirror')
		if (inputElement) {
			inputElement.innerHTML = \`${input}\`
		}
	}`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
		var btn = document.querySelector("button[aria-label*='Send Message']"); // subsequent screens use this
    if (!btn) var btn = document.querySelector('button:has(div svg)'); // new chats use this
    if (!btn) var btn = document.querySelector('button:has(svg)'); // last ditch attempt
		if (btn) {
			btn.focus();
			btn.disabled = false;
			btn.click();
		}
  }`);
	}

	static handleCss() {
		this.getWebview().addEventListener('dom-ready', () => {
			// hide message below text input, sidebar, suggestions on new chat
			setTimeout(() => {
				this.getWebview().insertCSS(`
        /* hide the claude avatar in response */
        .p-1.w-9.h-9.shrink-0 {
          display: none;
        }
        /* reduce claude prompt margins */
        .mx-4.md\:mx-12.mb-2.md\:mb-4.mt-2.w-auto {
          margin: 0 !important;
        }

        `);
			}, 1000);
			setTimeout(() => {
				this.getWebview().executeJavaScript(`{
				// hide welcome back title
				document.querySelector('h2').style.display = 'none';
				}`);
			}, 1000);
		});
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
