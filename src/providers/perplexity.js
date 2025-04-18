const Provider = require('./provider');

class Perplexity extends Provider {
	static webviewId = 'webviewPerplexity';
	static fullName = 'Perplexity';
	static shortName = 'Perplexity';

	static url = 'https://www.perplexity.ai/';

	static handleInput(input) {
		const fullName = this.fullName;
		this.getWebview().executeJavaScript(`
        var inputElement = document.querySelector('textarea[placeholder*="Ask"]'); // can be "Ask anything" or "Ask follow-up"
        if (inputElement) {
          var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
          nativeTextAreaValueSetter.call(inputElement, \`${input}\`);

          var event = new Event('input', { bubbles: true});
          inputElement.dispatchEvent(event);
        }
      `);
	}

	static handleSubmit() {
		this.getWebview().executeJavaScript(`{
        var buttons = Array.from(document.querySelectorAll('button.bg-super'));
				if (buttons[0]) {
					var buttonsWithSvgPath = buttons.filter(button => button.querySelector('svg path'));
					var button = buttonsWithSvgPath[buttonsWithSvgPath.length - 1];
					button.click();
				}
      }`);
	}

	static handleCss() {}

	static getUserAgent() {
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
	}

	static isEnabled() {
		return window.electron.electronStore.get(`${this.webviewId}Enabled`, true);
	}
}

module.exports = Perplexity;
