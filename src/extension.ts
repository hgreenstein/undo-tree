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
	let disposable = vscode.commands.registerCommand('undo-tree.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Undo Tree!');
		//Add functionality that when a new event is added to the Undo Stack it is logged to the console
		let previousText: string | undefined = vscode.window.activeTextEditor?.document.getText();
		vscode.window.onDidChangeTextEditorSelection((event) => {
			//Parse through every property of the event, if it is a string, log it to the console, else if it is an object, parse through it
			// recursivelyParseObject(event);
			const selectedRange = new vscode.Range(event.selections[0].start.line, event.selections[0].start.character - 1, event.selections[0].end.line, event.selections[0].end.character); 
			const position = new vscode.Position(event.selections[0].start.line, event.selections[0].start.character - 1);
			const currentText = event.textEditor.document.getText();
			//if either current text or previous text is undefined and the other is not undefined, then the text was replaced
			if((currentText === undefined && previousText !== undefined) || (currentText !== undefined && previousText === undefined)){
				console.log("Text was inserted");
			}
			else if(currentText === undefined || previousText === undefined){
				console.log("This should never log");
			}
			else if(currentText !== previousText){
				if(currentText.length > previousText.length){
					console.log("Text was added");
				}
				else if(currentText.length < previousText.length){
					console.log("Text was deleted");
				}
				else{
					console.log("Text was replaced");
				}
			}
			else{
				console.log("No change");
				{ console.log("") }
			}
			previousText = currentText;

			// console.log(recursivelyParseObject(event.textEditor.document.getWordRangeAtPosition(position)));
			// console.log(event.textEditor.document.getText(event.textEditor.document.getWordRangeAtPosition(position)));
			//check if the event is inserting text or deleting text
		});
	});
}
function recursivelyParseObject(obj, path = '', visited = new WeakSet()) {
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
// This method is called when your extension is deactivated
export function deactivate() {}
