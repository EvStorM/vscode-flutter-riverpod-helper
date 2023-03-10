import { ChildProcess, spawn } from "child_process";
import * as vscode from "vscode";
import * as kill from "tree-kill";
import { getOutputChannel } from "./extension";

enum State {
  initializing,
  watching,
  idle,
}

export class BuildRunnerWatch {
  constructor(context: vscode.ExtensionContext, id: string, watchProcess: ChildProcess, enableFVM: string) {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    this.statusBar.command = id;
    this.statusBar.tooltip = "Watch with Flutter build_runner";
    this.statusBar.text = this.text();
    this.watchProcess = watchProcess;
    this.enableFVM = enableFVM ?? "flutter";
    context.subscriptions.push(this.statusBar);
  }
  state: State = State.idle;
  enableFVM: string;
  watchProcess: ChildProcess;
  readonly watchString = "$(eye) Watch";
  readonly loadingString = "$(loading~spin) Initializing";
  readonly removeWatchString = "$(eye-closed) Remove watch";

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
    vscode.window.showInformationMessage("Started Codegen Process");
    this.watchProcess = spawn(this.enableFVM, ["packages", "pub", "run", "build_runner", "watch", "--delete-conflicting-outputs"], {
      shell: true,
      cwd: vscode.workspace.rootPath,
      //   detached: true
    });
    this.watchProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      getOutputChannel().appendLine(data);
    });
    this.watchProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      getOutputChannel().appendLine(data);
    });

    this.watchProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      getOutputChannel().appendLine(`child process exited with code ${code}`);
    });
    this.setState(State.watching);
    // }
  }
  removeWatch(): void {
    vscode.window.showInformationMessage("stop Codegen Process");
    if (this.watchProcess && !this.watchProcess.killed) {
      kill(this.watchProcess.pid);
      this.watchProcess.kill();
      this.setState(State.idle);
    }
  }
}
