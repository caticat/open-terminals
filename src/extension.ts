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
const CONFIG_FILE_NAME = 'open-terminals.yml';

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

function getConfigPath(): string | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return undefined;

  const candidates = [
    vscode.Uri.joinPath(workspaceFolder.uri, '.vscode', CONFIG_FILE_NAME),
    vscode.Uri.joinPath(workspaceFolder.uri, CONFIG_FILE_NAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate.fsPath)) {
      return candidate.fsPath;
    }
  }

  return undefined;
}

function loadConfigs(configPath: string): TerminalConfig[] | undefined {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(fileContent);
    if (!Array.isArray(parsed) || parsed.length === 0) return undefined;
    return parsed as TerminalConfig[];
  } catch {
    return undefined;
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
      const configPath = getConfigPath();
      if (!configPath) {
        const term = vscode.window.createTerminal({ location: { viewColumn: vscode.ViewColumn.One } });
        term.show();
        managedTerminals.push(term);
        return;
      }

      const configs = loadConfigs(configPath);
      if (!configs) return;

      for (const conf of configs) {
        await openTerminal(conf, managedTerminals);
      }
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
      const configPath = getConfigPath();
      if (!configPath) {
        vscode.window.showErrorMessage('open-terminals: config file not found (.vscode/open-terminals.yml or open-terminals.yml)');
        return;
      }

      const configs = loadConfigs(configPath);
      if (!configs) {
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
