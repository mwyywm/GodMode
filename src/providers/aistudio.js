const Provider = require('./provider');

class AIStudio extends Provider {
	static webviewId = 'webviewAIS';
	static fullName = 'Google AI Studio';
	static shortName = 'AIStudio';

	static url = 'https://aistudio.google.com/';

	static handleInput(input) {
		const fullName = this.fullName;
		this.getWebview().executeJavaScript(`{
        var textarea = document.querySelector('textarea.textarea');
        if (textarea) {
            textarea.focus();
            textarea.select();
            document.execCommand("insertText", false, \`${input}\`);
            textarea.focus();
        }
      }`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
        var btn = document.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.click();
        }
    }
      `);
	}

	static handleCss() {}

	static isEnabled() {
		return window.electron.electronStore.get(`${this.webviewId}Enabled`, true);
	}
}

module.exports = AIStudio;
