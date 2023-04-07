import { ChildProcess, spawn } from "child_process";
import * as vscode from "vscode";
import * as kill from "tree-kill";

enum State {
  initializing,
  watching,
  idle,
}
let _channel: vscode.OutputChannel;
export function getOutputChannel(ChannelName: string): vscode.OutputChannel {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel(ChannelName);
  }
  return _channel;
}
export class FgenRunnerWatch {
  constructor(context: vscode.ExtensionContext, id: string, watchProcess: ChildProcess) {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.statusBar.command = id;
    this.statusBar.tooltip = "Watch with Flutter Fgen";
    this.statusBar.text = this.text();
    this.watchProcess = watchProcess;
    this.myCommandId = id;
    context.subscriptions.push(this.statusBar);
  }
  state: State = State.idle;
  watchProcess: ChildProcess;
  myCommandId: string;
  ChannelName = "Flutter Fgen";
  readonly watchString = "$(eye) Fgen Watch";
  readonly loadingString = "$(loading~spin) Fgen Initializing";
  readonly removeWatchString = "$(eye-closed) Fgen Remove watch";

  readonly statusBar: vscode.StatusBarItem;

  show(): void {
    this.statusBar.show();
  }

  text(): string {
    switch (this.state) {
      case State.idle:
        return this.watchString;
      case State.watching:
        return this.removeWatchString;
      case State.initializing:
        return this.loadingString;
    }
  }

  setState(state: State): void {
    this.state = state;
    this.statusBar.text = this.text();
  }

  async toggle(): Promise<void> {
    switch (this.state) {
      case State.idle:
        return this.watch();
      case State.watching:
        return this.removeWatch();
      case State.initializing:
        break;
    }
  }
  watch(): void {
    // if (this.watchProcess && !this.watchProcess.killed) {
    //   vscode.window.showInformationMessage("Stopped Codegen Process");
    //   kill(this.watchProcess.pid);
    //   this.watchProcess.kill();
    //   this.setState(State.idle);
    // } else {
    vscode.window.showInformationMessage("Started Fgen Process");
    this.watchProcess = spawn("fgen", {
      shell: true,
      cwd: vscode.workspace.rootPath,
      //   detached: true
    });
    this.watchProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      getOutputChannel(this.ChannelName).appendLine(data);
    });
    this.watchProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      getOutputChannel(this.ChannelName).appendLine(data);
    });
    this.watchProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      getOutputChannel(this.ChannelName).appendLine(`child process exited with code ${code}`);
      this.setState(State.idle);
      let restart = "restart";
      vscode.window.showWarningMessage("Fgen exited, Need to restart?", restart).then((selection) => {
        if (selection === restart) {
          vscode.commands.executeCommand(this.myCommandId);
        }
      });
    });
    this.setState(State.watching);
    // }
  }
  removeWatch(): void {
    vscode.window.showInformationMessage("stop Fgen Process");
    if (this.watchProcess && !this.watchProcess.killed) {
      kill(this.watchProcess.pid);
      this.watchProcess.kill();
      this.setState(State.idle);
    }
  }
}
