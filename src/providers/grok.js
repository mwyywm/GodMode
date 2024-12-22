const Provider = require('./provider');

class Grok extends Provider {
	static webviewId = 'webviewGrok';
	static fullName = 'Grok by X';
	static shortName = 'Grok';

	static url = 'https://x.com/i/grok';

	static handleInput(input) {
		this.getWebview().executeJavaScript(`{
            const textarea = document.querySelector('textarea[placeholder="Ask anything"]');
            textarea.focus();
            textarea.select();
            document.execCommand("insertText", false, \`${input}\`);
            textarea.focus();
      }`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
        var btn = document.querySelector('button[aria-label="Grok something"]');
        if (btn) {
            btn.disabled = null;
            btn.ariaDisabled = null;
            btn.tabindex = null;
            btn.click();
        }
    }
      `);
	}

	static handleCss() {
		// this.getWebview().addEventListener('dom-ready', () => {});
	}

	static isEnabled() {
		return window.electron.electronStore.get(`${this.webviewId}Enabled`, true);
	}
}

module.exports = Grok;
