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

let retries = 0;

export const getActiveBranch = async (): Promise<
  { branchName?: string; commitDate?: Date } | undefined
> => {
  const gitApi = gitExtensionApi ?? getGitExtension();

  const wsFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!wsFolderUri) throw new Error('No workspace folder found');

  const repository = gitApi.getRepository(wsFolderUri);

  try {
    if (repository) {
      const { HEAD } = repository.state;
      if (!HEAD?.commit) throw new Error('No HEAD found');
      const commit = await repository.getCommit(HEAD.commit);
      const date = commit.commitDate;
      retries = 0;
      return { branchName: HEAD.name, commitDate: date };
    }
    throw new Error('No repository found');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    retries += 1;

    // eslint-disable-next-line promise/avoid-new
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    if (retries <= 5) {
      console.log('Retrying...');
      return getActiveBranch();
    }
    throw new Error('Failed to get active branch');
  }
};
