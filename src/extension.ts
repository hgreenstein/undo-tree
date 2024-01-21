// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "undo-tree" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('undo-tree.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Undo Tree!');
		//Add functionality that when a new event is added to the Undo Stack it is logged to the console
		vscode.window.onDidChangeTextEditorSelection((event) => {
			//We should group events together to logical units
			getTextEditorSelection(event);
		});
	});
	const getTextEditorSelection = ((event: vscode.TextEditorSelectionChangeEvent) => {
		//get the text from the range of the event
		const text = event.textEditor.document.getText(new vscode.Range(event.selections[0].start.line, event.selections[0].start.character - 1, event.selections[0].end.line, event.selections[0].end.character));
		console.log(text);
		//in addition to the selected text we should get any inserted text

	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
