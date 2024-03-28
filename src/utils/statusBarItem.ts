import { window, StatusBarAlignment, ThemeColor } from 'vscode';
import type { StatusBarItem } from 'vscode';

export type MyStatusBarItemType = MyStatusBarItem;

class MyStatusBarItem {
  private statusBarItem: StatusBarItem;

  public constructor() {
    this.statusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.show();
  }
  public setText(text: string): void {
    this.statusBarItem.text = text;
  }
  public setTooltip(tooltip: string): void {
    this.statusBarItem.tooltip = tooltip;
  }
  public setBackgroundColor(color: string): void {
    this.statusBarItem.backgroundColor = new ThemeColor(color);
  }
  public command(command: string): void {
    this.statusBarItem.command = command;
  }
}

export default MyStatusBarItem;
