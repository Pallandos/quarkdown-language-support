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
        
        switch (contextType) {
            case 'function':
                completions.push(...this.getFunctionCompletions());
            default:
                completions.push(...this.getAllCompletions());
        }
        
        return completions;
    }

    private detectContext(linePrefix: string, document: vscode.TextDocument, position: vscode.Position): string {
        // Détection des fonctions Quarkdown
        if (linePrefix.includes('.') && !linePrefix.includes(' ')) {
            return 'function';
        }
        
        return 'general';
    }

    private getFunctionCompletions(): vscode.CompletionItem[] {
        const functions: CompletionData[] = [
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

    private getAllCompletions(): vscode.CompletionItem[] {
        return [
            ...this.getFunctionCompletions(),
        ];
    }

    private createCompletionItem(data: CompletionData): vscode.CompletionItem {
        const item = new vscode.CompletionItem(data.label, data.kind);
        item.detail = data.detail;
        item.insertText = new vscode.SnippetString(data.insertText);
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