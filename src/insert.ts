import * as vscode from "vscode";
import { getChild, getNode, getRegSelection, getSelection } from "./utils/utils";

export class Insert {
  // reg = `\(([^\(\)]++|(?R))*+\)`;
  constructor(context: vscode.ExtensionContext) {
    let insertParent = vscode.commands.registerCommand("flutterRiverpodHelper.insertParent", this.insertParent);
    context.subscriptions.push(insertParent);
    let removeParent = vscode.commands.registerCommand("flutterRiverpodHelper.removeParent", this.removeParent);
    context.subscriptions.push(removeParent);
    let insertSibling = vscode.commands.registerCommand("flutterRiverpodHelper.insertSibling", this.insertSibling);
    context.subscriptions.push(insertSibling);
  }

  removeParent() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      // Match words forward, get the starting position of the word
      const start = editor.document.getWordRangeAtPosition(editor.selection.active, /[\w.:]+/)?.start.character || 0;
      const currentNode = getNode(editor);
      if (currentNode && currentNode[1].value) {
        // Get the child of the current node
        const currentNodeChild = getChild(currentNode);
        if (currentNodeChild && currentNodeChild[1].value) {
          const currentNodeSelection = getRegSelection(currentNode);
          const currentNodeChildSelection = getRegSelection(currentNodeChild);
          const selec: vscode.Selection = getSelection(editor.document, currentNodeSelection, start);
          editor.edit((editBuilder) => {
            editBuilder.replace(selec, currentNodeChildSelection);
          });
        }
      } else {
        vscode.window.showWarningMessage("Matching Failed.No node found.");
      }
    }
  }

  insertParent() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const currentNode = getNode(editor);
      if (currentNode && currentNode[0].value) {
        const line = editor.selection.active.line;
        // If the current line is empty or no match is found, then prompt for matching failure.
        if (line == null || editor.document.lineAt(line).text.trim().length === 0 || !editor.document.lineAt(line).text.trim().match(/\(/)) {
          vscode.window.showWarningMessage("Matching Failed.");
          return;
        }
        const currentNodeSelection = getRegSelection(currentNode);
        const start = editor.document.getWordRangeAtPosition(editor.selection.active, /[\w.:]+/)?.start.character || 0;
        const selec: vscode.Selection = getSelection(editor.document, currentNodeSelection, start);
        const newText = `Container(
          decoration: const BoxDecoration(),
          margin: EdgeInsets.symmetric(),
          padding: EdgeInsets.symmetric(),
          child: ${currentNodeSelection},
        )`;
        editor.edit((editBuilder) => {
          editBuilder.replace(selec, newText);
        });
      } else {
        vscode.window.showWarningMessage("Matching Failed.No node found.");
      }
    }
  }
  insertSibling() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const currentNode = getNode(editor);
      if (currentNode && currentNode[0].value) {
        const line = editor.selection.active.line;
        // If the current line is empty or no match is found, then prompt for matching failure.
        if (line == null || editor.document.lineAt(line).text.trim().length === 0 || !editor.document.lineAt(line).text.trim().match(/\(/)) {
          vscode.window.showWarningMessage("Matching Failed.");
          return;
        }
        const currentNodeSelection = getRegSelection(currentNode);
        const start = editor.document.getWordRangeAtPosition(editor.selection.active, /[\w.:]+/)?.start.character || 0;
        const selec: vscode.Selection = getSelection(editor.document, currentNodeSelection, start);
        const newText = `Flex(
          direction: Axis.horizontal,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children:  [${currentNodeSelection}],
        )`;
        editor.edit((editBuilder) => {
          editBuilder.replace(selec, newText);
        });
      } else {
        vscode.window.showWarningMessage("Matching Failed. No node found.");
      }
    }
  }
}
