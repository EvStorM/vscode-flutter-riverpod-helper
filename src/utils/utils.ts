import { Selection, TextDocument, TextEditor } from "vscode";
import XRegExp = require("xregexp");
import * as vscode from "vscode";
import { MatchRecursiveValueNameMatch } from "xregexp";

export function getSelection(document: TextDocument, text: string, startingPos: number) {
  let documentText = document.getText();
  let start = document.positionAt(documentText.indexOf(text, startingPos));
  let end = document.positionAt(documentText.indexOf(text, startingPos) + text.length);
  return new Selection(start, end);
}

// Get the node where the current cursor is located
export function getNode(editor: TextEditor): MatchRecursiveValueNameMatch[] | undefined {
  if (editor) {
    const document = editor.document;
    const selection = editor.selection;
    const line = selection.active.line;
    // Match words forward, get the starting position of the word
    const start = document.getWordRangeAtPosition(selection.active, /[\w.:]+/)?.start.character || 0;
    // Get all text after the current cursor
    const allText = document.getText(new vscode.Range(line, start, document.lineCount, 0));
    const matchText = XRegExp.matchRecursive(allText, "\\(", "\\)", "g", {
      unbalanced: "skip",
      valueNames: ["literal", null, "value", null],
    });
    return matchText;
  }
}
// Get the child of the node where the current cursor is located
export function getChild(matchText: MatchRecursiveValueNameMatch[]): MatchRecursiveValueNameMatch[] | undefined {
  if (matchText && matchText[1].value) {
    // Match child:or sliver.
    const childreg = /(child:|sliver:|slivers:|children:)([\s\S]+)/g;
    const newText = XRegExp.exec(matchText[1].value, XRegExp(childreg));
    if (newText && newText[1] != null) {
      if (newText[1] === "child:" || newText[1] === "sliver:") {
        if (newText[2] != "null") {
          const childInfo = XRegExp.matchRecursive(newText[2], "\\(", "\\)", "g", {
            unbalanced: "skip",
            valueNames: ["literal", null, "value", null],
          });
          return childInfo;
        }
      } else if (newText[1] === "children:" || newText[1] === "slivers:") {
        vscode.window.showWarningMessage("Matching failed, this type is not supported.");
      } else {
        vscode.window.showWarningMessage("Matching Failed.");
      }
    } else {
      vscode.window.showWarningMessage("Matching Failed.");
    }
  } else {
    vscode.window.showInformationMessage("Matching Failed.");
  }
}
// Get the node information from the matched content
export function getRegSelection(matchText: MatchRecursiveValueNameMatch[]) {
  return `${matchText[0].value}(${matchText[1].value})`;
}
