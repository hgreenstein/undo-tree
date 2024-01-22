// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let replayed = false;
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error) // This line of code will only be executed once when your extension is activated console.log('Congratulations, your extension "undo-tree" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let replayCommand = vscode.commands.registerCommand('undo-tree.replayChanges', () => {
		vscode.window.showInformationMessage('Replaying window');
		replayed = false;
        replayChanges();
    });

	let disposable = vscode.commands.registerCommand('undo-tree.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Undo Tree!');
		//Add functionality that when a new event is added to the Undo Stack it is logged to the console
		let previousText: string | undefined = vscode.window.activeTextEditor?.document.getText();
		// vscode.window.onDidChangeTextEditorSelection((event) => {
		// 	//Parse through every property of the event, if it is a string, log it to the console, else if it is an object, parse through it
		// 	// recursivelyParseObject(event);
		// 	const selectedRange = new vscode.Range(event.selections[0].start.line, event.selections[0].start.character - 1, event.selections[0].end.line, event.selections[0].end.character); 
		// 	const position = new vscode.Position(event.selections[0].start.line, event.selections[0].start.character - 1);
		// 	const currentText = event.textEditor.document.getText();
		// 	//if either current text or previous text is undefined and the other is not undefined, then the text was replaced
		// 	if((currentText === undefined && previousText !== undefined) || (currentText !== undefined && previousText === undefined)){
		// 		console.log("Text was inserted");
		// 	}
		// 	else if(currentText === undefined || previousText === undefined){
		// 		console.log("This should never log");
		// 	}
		// 	else if(currentText !== previousText){
		// 		if(currentText.length > previousText.length){
		// 			console.log("Text was added");
		// 		}
		// 		else if(currentText.length < previousText.length){
		// 			console.log("Text was deleted");
		// 		}
		// 		else{
		// 			console.log("Text was replaced");
		// 		}
		// 	}
		// 	else{
		// 		console.log("No change");
		// 	}
		// 	previousText = currentText;

		// 	// console.log(recursivelyParseObject(event.textEditor.document.getWordRangeAtPosition(position)));
		// 	// console.log(event.textEditor.document.getText(event.textEditor.document.getWordRangeAtPosition(position)));
		// 	//check if the event is inserting text or deleting text
		// });
		// vscode.workspace.onDidChangeTextDocument((event) => {
		// 	//Parse through every property of the event, if it is a string, log it to the console, else if it is an object, parse through it
		// 	console.log(event.document.getText(event.contentChanges[0].range));
		// 	recursivelyParseObject(event.document.getText(new vscode.Range(event.contentChanges[0].range.start.line, event.contentChanges[0].range.start.character, event.contentChanges[0].range.end.line, event.contentChanges[0].range.end.character + 1)));
		// });
		// printChangedText();
		onDidChangeTextDocument();
	});
}
interface TextChange {
    range: vscode.Range;
    text: string;
    isDeletion: boolean;
}

let changes: TextChange[] = [];

let isReplayingChanges = false;
function onDidChangeTextDocument() {
    vscode.workspace.onDidChangeTextDocument(event => {
		if(isReplayingChanges){
			return;
		}
        event.contentChanges.forEach(change => {
            const textChange: TextChange = {
                range: change.range,
                text: change.text,
                isDeletion: change.text === ''
            };
            changes.push(textChange);
        });
    });
}
async function replayChanges() {
	 	isReplayingChanges = true;
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			// Clear the current document
			const firstCharPosition = new vscode.Position(0, 0);
			const lastCharPosition = new vscode.Position(editor.document.lineCount, 0);
			const fullRange = new vscode.Range(firstCharPosition, lastCharPosition);
			await editor.edit(editBuilder => editBuilder.delete(fullRange));
			// Apply each change
			for (const change of changes) {
				await editor.edit(editBuilder => {
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
function recursivelyParseObject(obj: any, path = '', visited = new WeakSet()) {
    for (var property in obj) {
        const currentPath = path ? `${path}.${property}` : property;

        if (typeof obj[property] === 'function') {
            const func = obj[property];
            console.log(`${currentPath} (Function)`);
            console.log(`Function Name: ${func.name || 'anonymous'}`);
            console.log(`Function Body: ${func.toString()}`);
            // Optionally, call the function and parse its result
            // Be cautious with this as it might have side effects or be dependent on specific arguments
            // recursivelyParseObject(func(), currentPath, visited);
        } else if (typeof obj[property] === 'object' && obj[property] !== null) {
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
    vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        const contentChanges = event.contentChanges;

        contentChanges.forEach(change => {
            if (change.text === '') {
                // Deletion case: Use the range to infer the deleted text
                const deletedRange = new vscode.Range(change.range.start, change.range.end);
                console.log('Deleted text:', document.getText(deletedRange));
				recursivelyParseObject(change);
            } else {
                // Insertion or modification case
                const insertionRange = new vscode.Range(
                    change.range.start.line, 
                    change.range.start.character, 
                    change.range.end.line, 
                    change.range.end.character + change.text.length
                );
                console.log('Inserted or modified text:', document.getText(insertionRange));
            }
        });
    });
}
// This method is called when your extension is deactivated
export function deactivate() {}
