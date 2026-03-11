import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface TerminalConfig {
  cwd: string;
  shell?: string;
  command?: string;
  args?: string[];
  name?: string;
}

const managedTerminals: vscode.Terminal[] = [];

export function activate(context: vscode.ExtensionContext) {
  // 当 terminal 被外部关闭时，从列表中移除
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal(closed => {
      const idx = managedTerminals.indexOf(closed);
      if (idx !== -1) managedTerminals.splice(idx, 1);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('open-terminals.run', async () => {
      const configPath = vscode.workspace.workspaceFolders?.[0]
        ? vscode.workspace.workspaceFolders[0].uri.fsPath + '/open-terminals.yml'
        : undefined;

      if (!configPath || !fs.existsSync(configPath)) {
        const term = vscode.window.createTerminal({ location: { viewColumn: vscode.ViewColumn.One } });
        term.show();
        managedTerminals.push(term);
        return;
      }

      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const configs = yaml.load(fileContent) as TerminalConfig[];
        if (!Array.isArray(configs)) return;
        for (const conf of configs) {
          const term = vscode.window.createTerminal({
            name: conf.name,
            cwd: conf.cwd,
            shellPath: conf.shell,
            location: { viewColumn: vscode.ViewColumn.One }
          });
          term.show();
          managedTerminals.push(term);
          if (conf.command) {
            const fullCmd = conf.args ? `${conf.command} ${conf.args.join(' ')}` : conf.command;
            const delay = vscode.workspace.getConfiguration('openTerminals').get<number>('shellInitDelay', 500);
            await new Promise(resolve => setTimeout(resolve, delay));
            term.sendText(fullCmd, true);
          }
        }
      } catch {}
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('open-terminals.close', () => {
      managedTerminals.forEach(term => term.dispose());
      managedTerminals.length = 0;
    })
  );
}

export function deactivate() {}
