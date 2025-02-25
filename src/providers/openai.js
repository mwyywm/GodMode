const Provider = require('./provider');

class OpenAI extends Provider {
	static webviewId = 'webviewOAI';
	static fullName = 'OpenAI ChatGPT';
	static shortName = 'ChatGPT';

	static url = 'https://chat.openai.com/?model=gpt-4-code-interpreter'; // TODO - let people switch

	static handleInput(input) {
		const fullName = this.fullName;
		this.getWebview().executeJavaScript(`{
        var inputElement = document.querySelector('div#prompt-textarea > p')
        if (inputElement) {
          inputElement.textContent = \`${input}\`; // must be escaped backticks to support multiline
        }
      }`);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
        var btn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[data-testid="fruitjuice-send-button"]');
        if (btn) {
            btn.focus();
            btn.disabled = false;
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

module.exports = OpenAI;
