import * as vscode from 'vscode';

interface CompletionData {
    label: string;
    insertText: string;
    detail: string;
    documentation?: string;
    kind: vscode.CompletionItemKind;
    triggerCharacters?: string[];
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Quarkdown extension activated');

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'qd',
        new QuarkdownCompletionProvider(),
        ...getCompletionTriggers()
    );

    context.subscriptions.push(completionProvider);
}

class QuarkdownCompletionProvider implements vscode.CompletionItemProvider {
    
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
        // Détection du contexte fonction : un point suivi de caractères sans espace
        if (linePrefix.match(/( )\.\w*$/)) {
            return 'function';
        }
        
        return 'general';
    }

    private getFunctionCompletions(): vscode.CompletionItem[] {
        const functions: CompletionData[] = [
            {
                label: 'center',
                insertText: 'center',
                detail: 'Centrer le contenu',
                documentation: 'Centre le contenu spécifié',
                kind: vscode.CompletionItemKind.Function
            },
            // TODO : add more functions
        ];

        return functions.map(f => this.createCompletionItem(f));
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