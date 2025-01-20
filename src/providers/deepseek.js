const Provider = require('./provider');

class Deepseek extends Provider {
	static webviewId = 'webviewDeepseek';
	static fullName = 'Deepseek chat';
	static shortName = 'Deepseek';

	static url = 'https://chat.deepseek.com/';

	static handleInput(input) {
		this.getWebview().executeJavaScript(`{
            const textarea = document.querySelector('textarea#chat-input');
            textarea.focus();
            textarea.select();
            document.execCommand("insertText", false, \`${input}\`);
            textarea.focus();
      }`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
			const button = document.querySelector('div[role=button]>div.f286936b')
			button.click()
    }`);
	}

	static handleCss() {
		// this.getWebview().addEventListener('dom-ready', () => {});
	}

	static getUserAgent() {
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
	}

	static isEnabled() {
		return window.electron.electronStore.get(`${this.webviewId}Enabled`, true);
	}
}

module.exports = Deepseek;
