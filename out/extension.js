"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    console.log('Quarkdown extension activated');
    const completionProvider = vscode.languages.registerCompletionItemProvider('qd', new QuarkdownCompletionProvider(), ...getCompletionTriggers());
    context.subscriptions.push(completionProvider);
}
class QuarkdownCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const completions = [];
        const lineText = document.lineAt(position).text;
        const linePrefix = lineText.substring(0, position.character);
        // Détection du contexte
        const contextType = this.detectContext(linePrefix, document, position);
        // Seulement dans le contexte des fonctions
        if (contextType === 'function') {
            completions.push(...this.getFunctionCompletions());
        }
        return completions;
    }
    detectContext(linePrefix, document, position) {
        // Détection du contexte fonction : un point suivi de caractères sans espace
        if (linePrefix.match(/( )\.\w*$/)) {
            return 'function';
        }
        return 'general';
    }
    getFunctionCompletions() {
        const functions = [
            {
                label: 'center',
                insertText: 'center',
                detail: 'Centrer le contenu',
                documentation: 'Centre le contenu spécifié',
                kind: vscode.CompletionItemKind.Function
            },
            {
                label: 'align',
                insertText: 'align',
                detail: 'Aligner le contenu',
                documentation: 'Aligne le contenu selon l\'option choisie',
                kind: vscode.CompletionItemKind.Function
            },
            // TODO : add more functions
        ];
        return functions.map(f => this.createCompletionItem(f));
    }
    createCompletionItem(data) {
        const item = new vscode.CompletionItem(data.label, data.kind);
        item.detail = data.detail;
        item.insertText = data.insertText;
        if (data.documentation) {
            item.documentation = new vscode.MarkdownString(data.documentation);
        }
        return item;
    }
}
function getCompletionTriggers() {
    return ['.'];
}
function deactivate() { }
//# sourceMappingURL=extension.js.map