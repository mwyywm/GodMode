const Provider = require('./provider');

/**
 * @class Mistral
 * @extends Provider
 * @description Provider class for Mistral AI chat interface integration
 */
class Mistral extends Provider {
	static webviewId = 'webviewMistral';
	static fullName = 'Mistral';
	static shortName = 'Mistral';

	static url = 'https://chat.mistral.ai/';

	/**
	 * @param {string} input - The text input to be sent to Mistral
	 * @throws {Error} If the input element cannot be found
	 */
	static handleInput(input) {
		this.getWebview().executeJavaScript(`
            try {
                const inputElement = document.querySelector("body > main textarea");
                if (!inputElement) {
                    throw new Error('Input element not found');
                }
                inputElement.value = \`${input}\`;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (error) {
                console.error('Error in Mistral handleInput:', error);
            }
        `);
	}

	/**
	 * Triggers the submit action for the chat input
	 */
	static handleSubmit() {
		this.getWebview().executeJavaScript(`
            try {
                const inputElement = document.querySelector("body > main textarea");
		let tempValue = inputElement.value;
		inputElement.value = "";
                inputElement.setRangeText(tempValue); // submit button doesn't work without this.
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));

                const submitButton = document.querySelector('button[aria-label^="Send"]');
                if (!submitButton) {
                    throw new Error('Submit button not found');
                }
                submitButton.click();
            } catch (error) {
                console.error('Error in Mistral handleSubmit:', error);
            }
        `);
	}

	/**
	 * Applies custom CSS styling to the Mistral chat interface
	 */
	static handleCss() {}

	/**
	 * @returns {boolean} Whether the Mistral provider is enabled
	 */
	static isEnabled() {
		return window.electron?.electronStore?.get(`${this.webviewId}Enabled`, true) ?? false;
	}
}

module.exports = Mistral;
