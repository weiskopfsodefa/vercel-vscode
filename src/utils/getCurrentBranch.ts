import * as vscode from 'vscode';
import type { GitExtension } from '@/types/git';

const getGitExtension = () => {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
  const gitExtension = vscodeGit?.exports;
  console.log(vscodeGit?.isActive);
  if (gitExtension) {
    return gitExtension.getAPI(1);
  }
  throw new Error('Git extension is not available');
};

export const getActiveBranch = (): string | null => {
  const gitApi = getGitExtension();
  console.log({ gitApi: gitApi.repositories });
  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
  if (!activeEditorUri) throw new Error('No active editor found');
  const wsFolderUri = vscode.workspace.getWorkspaceFolder(activeEditorUri)?.uri;
  if (!wsFolderUri) throw new Error('No workspace folder found');
  const repository = gitApi.getRepository(wsFolderUri);
  console.log('repository', wsFolderUri);
  if (repository) {
    const { HEAD } = repository.state;
    return HEAD?.name ?? null;
  }
  throw new Error('No repository found');
};
