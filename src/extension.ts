import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface TerminalConfig {
  cwd: string;
  shell?: string;
  command?: string;
  args?: string[];
  name?: string;
  color?: string;
  icon?: string;
}

const COLOR_MAP: Record<string, string> = {
  black:   'terminal.ansiBlack',
  red:     'terminal.ansiRed',
  green:   'terminal.ansiGreen',
  yellow:  'terminal.ansiYellow',
  blue:    'terminal.ansiBlue',
  magenta: 'terminal.ansiMagenta',
  cyan:    'terminal.ansiCyan',
  white:   'terminal.ansiWhite',
};

const managedTerminals: vscode.Terminal[] = [];

async function openTerminal(conf: TerminalConfig, managedTerminals: vscode.Terminal[]): Promise<void> {
  const term = vscode.window.createTerminal({
    name: conf.name,
    cwd: conf.cwd,
    shellPath: conf.shell,
    iconPath: conf.icon ? new vscode.ThemeIcon(conf.icon) : undefined,
    color: conf.color ? new vscode.ThemeColor(COLOR_MAP[conf.color] ?? conf.color) : undefined,
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
          await openTerminal(conf, managedTerminals);
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

  context.subscriptions.push(
    vscode.commands.registerCommand('open-terminals.runOne', async () => {
      const configPath = vscode.workspace.workspaceFolders?.[0]
        ? vscode.workspace.workspaceFolders[0].uri.fsPath + '/open-terminals.yml'
        : undefined;

      if (!configPath || !fs.existsSync(configPath)) {
        vscode.window.showErrorMessage('open-terminals: config file not found (open-terminals.yml)');
        return;
      }

      let configs: TerminalConfig[];
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.load(fileContent);
        if (!Array.isArray(parsed) || parsed.length === 0) return;
        configs = parsed as TerminalConfig[];
      } catch {
        return;
      }

      const items = configs.map((conf, index) => ({
        label: conf.name ?? conf.cwd,
        description: conf.name ? conf.cwd : undefined,
        index,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a terminal to open',
      });

      if (!selected) return;

      await openTerminal(configs[selected.index], managedTerminals);
    })
  );
}

export function deactivate() {}
