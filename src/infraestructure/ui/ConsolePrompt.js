import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

export class ConsolePrompt {
    #rl = null;

    _getInterface() {
        if (!this.#rl) {
            this.#rl = createInterface({ input: stdin, output: stdout });
        }
        return this.#rl;
    }

    ask(question) {
        const rl = this._getInterface();
        return new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer.trim()));
        });
    }

    show(message) {
        console.log(message);
    }

    showError(message) {
        console.log(`✖ ${message}`);
    }

    clear() {
        console.clear();
    }

    close() {
        if (this.#rl) {
            this.#rl.close();
            this.#rl = null;
        }
    }
}
