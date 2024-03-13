import { StatusBarAlignment, window } from 'vscode';
import updateStatus from '@/utils/updateStatus';
import { getAccessToken } from './utils/config';
import { triangle } from './utils/const';
import toast from './utils/toast';
import getVercelJson from './utils/vercelJson';

// eslint-disable-next-line no-undef
let interval: NodeJS.Timeout | null = null;

export const activate = async (): Promise<void> => {
  const accessToken = getAccessToken();

  console.log('Loaded Vercel Access Token');

  if (!accessToken) {
    await toast.error(
      'Please set your Vercel Access Token in the extension settings'
    );
    return;
  }

  const vercelJson = await getVercelJson();

  if (!vercelJson) {
    await toast.error('No Vercel Project JSON found');
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

  const statusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right,
    100
  );

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
