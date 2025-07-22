"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
function activate(context) {
    console.log('Quarkdown extension activated');
    const completionProvider = vscode.languages.registerCompletionItemProvider('qd', new QuarkdownCompletionProvider(context), ...getCompletionTriggers());
    context.subscriptions.push(completionProvider);
}
class QuarkdownCompletionProvider {
    constructor(context) {
        this.context = context;
        this.loadSuggestions();
    }
    loadSuggestions() {
        try {
            const suggestionsPath = path.join(this.context.extensionPath, 'src', 'data', 'suggestions.json');
            const suggestionsData = fs.readFileSync(suggestionsPath, 'utf8');
            const parsed = JSON.parse(suggestionsData);
            // Convertir les strings 'kind' en enum vscode.CompletionItemKind
            this.suggestions = {
                functions: parsed.functions.map((f) => ({
                    ...f,
                    kind: vscode.CompletionItemKind[f.kind]
                }))
            };
        }
        catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
            this.suggestions = { functions: [] };
        }
    }
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
        // Get function context
        if (linePrefix.match(/(^| )\.\w*$/)) {
            return 'function';
        }
        return 'general';
    }
    getFunctionCompletions() {
        return this.suggestions.functions.map(f => this.createCompletionItem(f));
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