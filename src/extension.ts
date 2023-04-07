// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import * as kill from "tree-kill";
import { BuildRunnerWatch } from "./watch";
import { Insert } from "./insert";
import { FgenRunnerWatch } from "./watchFgen";

let _watchProcess: ChildProcess;
let _watchFgenProcess: ChildProcess;
let enableFVM = vscode.workspace.getConfiguration("FlutterRiverpodHelpers").get("enableFVM") === true ? "fvm flutter " : "flutter";
export async function activate(context: vscode.ExtensionContext) {
  // item is selected
  const myCommandId = "flutterRiverpodHelper.statusBarWatch";
  const watch = new BuildRunnerWatch(context, myCommandId, _watchProcess, enableFVM);
  watch.show();
  const watchBuildRunner = vscode.commands.registerCommand(myCommandId, async () => await watch.toggle());
  context.subscriptions.push(watchBuildRunner);
  if (vscode.workspace.getConfiguration("FlutterRiverpodHelpers").get("enableFgen") === true) {
    const fgenCommandId = "flutterRiverpodHelper.fgenStatusBarWatch";
    const watchFgen = new FgenRunnerWatch(context, fgenCommandId, _watchFgenProcess);
    watchFgen.show();
    const watchFgenRun = vscode.commands.registerCommand(fgenCommandId, async () => await watchFgen.toggle());
    context.subscriptions.push(watchFgenRun);
  }
  // If the insert function is turned on
  if (vscode.workspace.getConfiguration("FlutterRiverpodHelpers").get("enableInsert") === true) {
    // 添加 menus editor/context
    const insert = new Insert(context);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (_watchProcess && !_watchProcess.killed) {
    kill(_watchProcess.pid);
    _watchProcess.kill();
  }
}
