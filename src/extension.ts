import { Uri, commands, env, workspace } from 'vscode';
import updateStatus from '@/utils/updateStatus';
import { getAccessToken } from './utils/config';
import { triangle } from './utils/const';
import toast from './utils/toast';
import getVercelJson from './utils/vercelJson';
import fetchDeploymentForBranch from './utils/fetchDeployments';
import { getActiveBranch } from './utils/getCurrentBranch';
import MyStatusBarItem from './utils/statusBarItem';
import type { ExtensionContext } from 'vscode';

// eslint-disable-next-line no-undef
let interval: NodeJS.Timeout | null = null;

export const activate = async (context: ExtensionContext): Promise<void> => {
  // check if workspace is loaded
  const root = workspace.workspaceFolders?.[0];
  if (!root) {
    return;
  }

  const accessToken = getAccessToken();

  console.log('Loaded Vercel Access Token');

  if (!accessToken) {
    await toast.error(
      'Please set your [Vercel Access Token](https://vercel.com/account/tokens) in the extension settings `vercelVSCode.accessToken`.'
    );
    return;
  }

  const myStatusBarItem = new MyStatusBarItem();

  const disposable = commands.registerCommand(
    'vercelVSCode.openVercel',
    async () => {
      const vercelJson = await getVercelJson({ myStatusBarItem });
      if (!vercelJson) {
        return;
      }
      const { projectId, orgId } = vercelJson;
      const currentBranch = await getActiveBranch();
      const deployments = await fetchDeploymentForBranch(
        accessToken,
        projectId,
        orgId,
        currentBranch
      );
      if (!deployments.latestDeploymentForBranch?.inspectorUrl) {
        await toast.error('No deployment url found');
        return;
      }
      const uri = Uri.parse(deployments.latestDeploymentForBranch.inspectorUrl);
      await env.openExternal(uri);
    }
  );

  context.subscriptions.push(disposable);

  myStatusBarItem.setText(`${triangle} Loading`);
  myStatusBarItem.setTooltip('Loading Vercel deployment status...');
  myStatusBarItem.command('vercelVSCode.openVercel');

  const update = async () =>
    updateStatus({
      myStatusBarItem,
      accessToken,
    });

  await update();
  interval = setInterval(async () => {
    await update();
  }, 5000);
};

export const deactivate = (): void => {
  if (interval) {
    clearInterval(interval);
  }
};
