import * as vscode from 'vscode';
import type { API, GitExtension } from '@/types/git';

// eslint-disable-next-line @typescript-eslint/init-declarations
let gitExtensionApi: API | undefined;

const getGitExtension = () => {
  console.log('Getting git extension');
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
  const gitExtensionExports = vscodeGit?.exports;
  if (gitExtensionExports) {
    gitExtensionApi = gitExtensionExports.getAPI(1);
    return gitExtensionApi;
  }
  throw new Error('Git extension is not available');
};

export const getActiveBranch = (): string | undefined => {
  const gitApi = gitExtensionApi ?? getGitExtension();

  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
  if (!activeEditorUri) throw new Error('No active editor found');

  const wsFolderUri = vscode.workspace.getWorkspaceFolder(activeEditorUri)?.uri;
  if (!wsFolderUri) throw new Error('No workspace folder found');

  const repository = gitApi.getRepository(wsFolderUri);

  if (repository) {
    const { HEAD } = repository.state;
    return HEAD?.name;
  }
  throw new Error('No repository found');
};