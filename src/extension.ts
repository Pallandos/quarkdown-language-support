import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface CompletionData {
    label: string;
    insertText: string;
    detail: string;
    documentation?: string;
    kind: vscode.CompletionItemKind;
    triggerCharacters?: string[];
}

interface SuggestionsData {
    functions: CompletionData[];
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Quarkdown extension activated');

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'qd',
        new QuarkdownCompletionProvider(context),
        ...getCompletionTriggers()
    );

    context.subscriptions.push(completionProvider);
}

class QuarkdownCompletionProvider implements vscode.CompletionItemProvider {
    private suggestions!: SuggestionsData;

    constructor(private context: vscode.ExtensionContext) {
        this.loadSuggestions();
    }

    private loadSuggestions(): void {
        try {
            const suggestionsPath = path.join(this.context.extensionPath, 'src', 'data', 'suggestions.json');
            const suggestionsData = fs.readFileSync(suggestionsPath, 'utf8');
            const parsed = JSON.parse(suggestionsData);
            
            // Convertir les strings 'kind' en enum vscode.CompletionItemKind
            this.suggestions = {
                functions: parsed.functions.map((f: any) => ({
                    ...f,
                    kind: vscode.CompletionItemKind[f.kind as keyof typeof vscode.CompletionItemKind]
                }))
            };
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
            this.suggestions = { functions: [] };
        }
    }
    
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] | vscode.CompletionList {
        
        const completions: vscode.CompletionItem[] = [];
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

    private detectContext(linePrefix: string, document: vscode.TextDocument, position: vscode.Position): string {
        // Get function context
        if (linePrefix.match(/(^| )\.\w*$/)) {
            return 'function';
        }
        
        return 'general';
    }

    private getFunctionCompletions(): vscode.CompletionItem[] {
        return this.suggestions.functions.map(f => this.createCompletionItem(f));
    }

    private createCompletionItem(data: CompletionData): vscode.CompletionItem {
        const item = new vscode.CompletionItem(data.label, data.kind);
        item.detail = data.detail;
        item.insertText = data.insertText;
        if (data.documentation) {
            item.documentation = new vscode.MarkdownString(data.documentation);
        }
        return item;
    }
}

function getCompletionTriggers(): string[] {
    return ['.'];
}

export function deactivate() {}