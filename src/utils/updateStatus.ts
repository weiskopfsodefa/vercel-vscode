import { formatDistance } from 'date-fns';
import { ThemeColor } from 'vscode';
import fetchDeployments from '@/utils/fetchDeployments';
import parseError from '@/utils/parseError';
import toSentenceCase from '@/utils/sentenceCase';
import { triangle } from './const';
import { getActiveBranch } from './getCurrentBranch';
import type { StatusBarItem } from 'vscode';

const updateStatus = async ({
  statusBarItem,
  accessToken,
  projectId,
  orgId,
}: {
  statusBarItem: StatusBarItem;
  accessToken: string;
  projectId: string;
  orgId?: string;
}): Promise<void> => {
  try {
    const currentBranch = await getActiveBranch();
    const deployment = await fetchDeployments(
      accessToken,
      projectId,
      orgId,
      currentBranch
    );

    if (!deployment) {
      statusBarItem.text = `${triangle} No deployment found`;
      statusBarItem.tooltip = `There was no deployment found for this branch.`;
      return;
    }

    const { state, name, createdAt, source } = deployment;
    const formattedDate = createdAt
      ? formatDistance(new Date(createdAt), new Date())
      : 'a while';

    statusBarItem.text = `${triangle} ${toSentenceCase(state)}`;
    statusBarItem.backgroundColor =
      deployment.state === 'ERROR'
        ? new ThemeColor('statusBarItem.errorBackground')
        : new ThemeColor('statusBar.background');
    statusBarItem.tooltip = [
      name ?? 'unknown repo',
      `(${state.toLowerCase()})`,
      `${formattedDate} ago`,
      'via',
      source ?? 'unknown source',
      currentBranch?.branchName ? `on ${currentBranch.branchName}` : '',
    ].join(' ');
  } catch (error) {
    const message = parseError(error);

    console.error(message);
  }
};

export default updateStatus;
