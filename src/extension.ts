import {
  StatusBarAlignment,
  Uri,
  commands,
  env,
  window,
  workspace,
} from 'vscode';
import updateStatus from '@/utils/updateStatus';
import { getAccessToken } from './utils/config';
import { triangle } from './utils/const';
import toast from './utils/toast';
import getVercelJson from './utils/vercelJson';
import fetchDeploymentForBranch from './utils/fetchDeployments';
import { getActiveBranch } from './utils/getCurrentBranch';
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

  const statusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right,
    100
  );

  const vercelJson = await getVercelJson();

  if (!vercelJson) {
    statusBarItem.text = `${triangle} Not Linked`;
    statusBarItem.tooltip =
      'Run `vercel link` to link this project to Vercel deployments and enable this extension.';
    statusBarItem.show();
    return;
  }

  const { orgId, projectId } = vercelJson;

  if (!projectId) {
    await toast.error('No Vercel Project ID found in vercel json');
    return;
  }

  if (!orgId) {
    await toast.error('No Vercel Org ID found in vercel json');
    return;
  }

  const disposable = commands.registerCommand(
    'vercelVSCode.openVercel',
    async () => {
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

  statusBarItem.command = 'vercelVSCode.openVercel';

  statusBarItem.text = `${triangle} Loading`;
  statusBarItem.tooltip = 'Loading Vercel deployment status...';
  statusBarItem.show();

  const update = async () =>
    updateStatus({
      statusBarItem,
      accessToken,
      projectId,
      orgId,
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
