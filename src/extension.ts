// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error) // This line of code will only be executed once when your extension is activated console.log('Congratulations, your extension "undo-tree" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let replayCommand = vscode.commands.registerCommand(
        'undo-tree.replayChanges',
        () => {
            vscode.window.showInformationMessage('Replaying window');
            replayChanges();
        }
    );

    let disposable = vscode.commands.registerCommand(
        'undo-tree.helloWorld',
        () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            vscode.window.showInformationMessage('Hello World from Undo Tree!');
            //Add functionality that when a new event is added to the Undo Stack it is logged to the console
            let previousText: string | undefined =
                vscode.window.activeTextEditor?.document.getText();
            // vscode.window.onDidChangeTextEditorSelection((event) => {
            // 	//Parse through every property of the event, if it is a string, log it to the console, else if it is an object, parse through it
            // 	// recursivelyParseObject(event);
            // 	const selectedRange = new vscode.Range(event.selections[0].start.line, event.selections[0].start.character - 1, event.selections[0].end.line, event.selections[0].end.character);
            // 	const position = new vscode.Position(event.selections[0].start.line, event.selections[0].start.character - 1);
            // 	const currentText = event.textEditor.document.getText();
            // 	// console.log(recursivelyParseObject(event.textEditor.document.getWordRangeAtPosition(position)));
            // 	// console.log(event.textEditor.document.getText(event.textEditor.document.getWordRangeAtPosition(position)));
            // });
            // vscode.workspace.onDidChangeTextDocument((event) => {
            // 	//Parse through every property of the event, if it is a string, log it to the console, else if it is an object, parse through it
            // 	console.log(event.document.getText(event.contentChanges[0].range));
            // 	recursivelyParseObject(event.document.getText(new vscode.Range(event.contentChanges[0].range.start.line, event.contentChanges[0].range.start.character, event.contentChanges[0].range.end.line, event.contentChanges[0].range.end.character + 1)));
            // });
            // printChangedText();
            onDidChangeTextDocument();
        }
    );
}
interface TextChange {
    range: vscode.Range;
    text: string;
    isDeletion: boolean;
}

let changes: TextChange[] = [];

/** pauses the onDidChangeTextDocument function if replaying changes */
let isReplayingChanges: boolean = false;
/** Upon activation current with the Hello World command, start listening and storing changes to the active text editor */
function onDidChangeTextDocument() {
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (isReplayingChanges) {
            return;
        }
        event.contentChanges.forEach((change) => {
            const textChange: TextChange = {
                range: change.range,
                text: change.text,
                isDeletion: change.text === '',
            };
            changes.push(textChange);
        });
    });
}
/**
 * Replays all changes in the active text editor in the order they were made
 * Pauses the onDidChangeTextDocument listener via the isReplayingChanges flag
 * while it is replaying changes to prevent infinite recursion
 * @async
 * @returns {Promise<void>}
 */
async function replayChanges() {
    isReplayingChanges = true;
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // Clear the current document
        const firstCharPosition = new vscode.Position(0, 0);
        const lastCharPosition = new vscode.Position(
            editor.document.lineCount,
            0
        );
        const fullRange = new vscode.Range(firstCharPosition, lastCharPosition);
        await editor.edit((editBuilder) => editBuilder.delete(fullRange));
        // Apply each change
        for (const change of changes) {
            await editor.edit((editBuilder) => {
                if (change.isDeletion) {
                    editBuilder.delete(change.range);
                } else {
                    editBuilder.insert(change.range.start, change.text);
                }
            });
        }
    }
    isReplayingChanges = false;
}
/**
 * Recursively parse an object and log its properties to the console
 *
 * @param {any} obj
 * @param {string} [path='']
 * @param {WeakSet} [visited=new WeakSet()]
 */
function recursivelyParseObject(obj: any, path = '', visited = new WeakSet()) {
    for (var property in obj) {
        const currentPath: string = path ? `${path}.${property}` : property;

        if (typeof obj[property] === 'function') {
            const func = obj[property];
            console.log(`${currentPath} (Function)`);
            console.log(`Function Name: ${func.name || 'anonymous'}`);
            console.log(`Function Body: ${func.toString()}`);
            // Optionally, call the function and parse its result
            // Be cautious with this as it might have side effects or be dependent on specific arguments
            // recursivelyParseObject(func(), currentPath, visited);
        } else if (
            typeof obj[property] === 'object' &&
            obj[property] !== null
        ) {
            if (visited.has(obj[property])) {
                console.log(`${currentPath}: [Circular Reference]`);
            } else {
                visited.add(obj[property]);
                console.log(`${currentPath} (Object)`);
                recursivelyParseObject(obj[property], currentPath, visited);
            }
        } else {
            console.log(`${currentPath}: ${obj[property]}`);
        }
    }
}
function printChangedText() {
    vscode.workspace.onDidChangeTextDocument((event) => {
        const document: vscode.TextDocument = event.document;
        const contentChanges: readonly vscode.TextDocumentContentChangeEvent[] =
            event.contentChanges;

        contentChanges.forEach(
            (change: vscode.TextDocumentContentChangeEvent) => {
                if (change.text === '') {
                    // Deletion case: Use the range to infer the deleted text
                    const deletedRange: vscode.Range = new vscode.Range(
                        change.range.start,
                        change.range.end
                    );
                    console.log(
                        'Deleted text:',
                        document.getText(deletedRange)
                    );
                    recursivelyParseObject(change);
                } else {
                    // Insertion or modification case
                    const insertionRange = new vscode.Range(
                        change.range.start.line,
                        change.range.start.character,
                        change.range.end.line,
                        change.range.end.character + change.text.length
                    );
                    console.log(
                        'Inserted or modified text:',
                        document.getText(insertionRange)
                    );
                }
            }
        );
    });
}
// This method is called when your extension is deactivated
export function deactivate() {}
