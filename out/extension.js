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
        switch (contextType) {
            case 'function':
                completions.push(...this.getFunctionCompletions());
            default:
                completions.push(...this.getAllCompletions());
        }
        return completions;
    }
    detectContext(linePrefix, document, position) {
        // Détection des fonctions Quarkdown
        if (linePrefix.includes('.') && !linePrefix.includes(' ')) {
            return 'function';
        }
        return 'general';
    }
    getFunctionCompletions() {
        const functions = [
            {
                label: '.center{}',
                insertText: '.center{${1:contenu}}',
                detail: 'Centrer le contenu',
                documentation: 'Centre le contenu spécifié',
                kind: vscode.CompletionItemKind.Function
            },
            {
                label: '.align{}',
                insertText: '.align{${1|left,center,right,justify|}}{\n\t${2:contenu}\n}',
                detail: 'Aligner le contenu',
                documentation: 'Aligne le contenu selon l\'option choisie',
                kind: vscode.CompletionItemKind.Function
            },
            // Ajoutez d'autres fonctions Quarkdown ici
        ];
        return functions.map(f => this.createCompletionItem(f));
    }
    getAllCompletions() {
        return [
            ...this.getFunctionCompletions(),
        ];
    }
    createCompletionItem(data) {
        const item = new vscode.CompletionItem(data.label, data.kind);
        item.detail = data.detail;
        item.insertText = new vscode.SnippetString(data.insertText);
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