# Open Terminals

A VS Code extension that silently reads a configuration file and opens multiple terminals in the editor area in sequence.

**Perfect for managing multiple Claude Code sessions** — define all your Claude instances once in a config file, then open them all with a single shortcut.

[中文文档](#中文文档)

---

## Features

- Reads `open-terminals.yml` from the workspace root
- Opens terminals in the **editor area** (not the panel)
- Configurable per terminal: working directory, shell, command, args, and name
- If no config file is found, opens a single blank terminal
- Tracks managed terminals — close only the ones opened by this extension

## Commands

| Command                                | Shortcut         | Description                                       |
| -------------------------------------- | ---------------- | ------------------------------------------------- |
| `Open Terminals - Open (Editor Area)`  | `Ctrl+Alt+T`     | Read config and open terminals                    |
| `Open Terminals - Close All`           | `Ctrl+Alt+W`     | Close only terminals opened by this extension     |

## Configuration

Place `open-terminals.yml` in your workspace root.

### Example: Managing Multiple Claude Sessions

A common use case is launching multiple Claude Code instances across different projects simultaneously:

```yaml
- name: claude - project-a
  cwd: C:/projects/project-a
  shell: bash
  command: claude

- name: claude - project-b
  cwd: C:/projects/project-b
  shell: bash
  command: claude

- name: claude - project-c
  cwd: C:/projects/project-c
  shell: bash
  command: claude
```

Press `Ctrl+Alt+T` and all three Claude sessions open instantly in the editor area, each in its own project directory.

### Full Example

```yaml
- name: server                # optional — terminal tab name
  cwd: C:/projects/my-server  # working directory
  shell: powershell           # optional — bash / powershell / cmd, or full path
  command: npm start          # optional — command to run
  args:                       # optional — arguments
    - --verbose

- name: client
  cwd: C:/projects/my-client
  shell: C:/Users/you/AppData/Local/Programs/Git/bin/bash.exe
  command: npm run dev
```

### Fields

| Field     | Required | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| `cwd`     | Yes      | Terminal working directory                                     |
| `name`    | No       | Name shown on the terminal tab                                 |
| `shell`   | No       | Shell: `bash`, `powershell`, `cmd`, or a full executable path  |
| `command` | No       | Command to execute after the terminal opens                    |
| `args`    | No       | Arguments passed to the command (list)                         |

## Usage

1. Create `open-terminals.yml` in your workspace root (see configuration above)
2. Press `Ctrl+Alt+T` or run `Open Terminals - Open (Editor Area)` from the Command Palette

---

## 中文文档

VS Code 扩展，静默读取配置文件，按顺序在编辑区打开多个终端。

**非常适合管理多个 Claude Code 会话** —— 在配置文件中定义所有 Claude 实例，一个快捷键即可全部打开。

### 功能

- 从工作区根目录读取 `open-terminals.yml`
- 在**编辑区**（非底部面板）打开终端
- 每个终端可单独配置：工作目录、Shell 类型、命令、参数、名称
- 没有配置文件时，自动开启一个空终端
- 只关闭插件自己打开的终端，不影响用户手动开启的终端

### 命令

| 命令                                   | 快捷键           | 说明                     |
| -------------------------------------- | ---------------- | ------------------------ |
| `Open Terminals - Open (Editor Area)`  | `Ctrl+Alt+T`     | 读取配置并开启终端       |
| `Open Terminals - Close All`           | `Ctrl+Alt+W`     | 只关闭插件开启的终端     |

### 配置示例

在工作区根目录创建 `open-terminals.yml`：

#### 场景：同时管理多个 Claude 会话

```yaml
- name: claude - 项目A
  cwd: C:/projects/project-a
  shell: bash
  command: claude

- name: claude - 项目B
  cwd: C:/projects/project-b
  shell: bash
  command: claude

- name: claude - 项目C
  cwd: C:/projects/project-c
  shell: bash
  command: claude
```

按下 `Ctrl+Alt+T`，三个 Claude 会话立即在编辑区分别打开，各自位于对应的项目目录。

#### 完整示例

```yaml
- name: server
  cwd: C:/projects/my-server
  shell: powershell
  command: npm start

- name: client
  cwd: C:/projects/my-client
  shell: C:/Users/you/AppData/Local/Programs/Git/bin/bash.exe
  command: npm run dev
  args:
    - --verbose
```

### 字段说明

| 字段      | 必填 | 说明                                                         |
| --------- | ---- | ------------------------------------------------------------ |
| `cwd`     | 是   | 终端工作目录                                                 |
| `name`    | 否   | 终端标签页名称                                               |
| `shell`   | 否   | 使用的 Shell：`bash` / `powershell` / `cmd` 或完整路径       |
| `command` | 否   | 终端打开后执行的命令                                         |
| `args`    | 否   | 命令的参数列表                                               |
