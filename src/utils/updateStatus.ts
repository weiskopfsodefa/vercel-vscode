import { formatDistance } from 'date-fns';
import fetchDeployments from '@/utils/fetchDeployments';
import parseError from '@/utils/parseError';
import toSentenceCase from '@/utils/sentenceCase';
import { triangle } from './const';
import { getActiveBranch } from './getCurrentBranch';
import getVercelJson from './vercelJson';
import type { MyStatusBarItemType } from './statusBarItem';

const updateStatus = async ({
  myStatusBarItem,
  accessToken,
}: {
  myStatusBarItem: MyStatusBarItemType;
  accessToken: string;
}): Promise<void> => {
  try {
    const vercelJson = await getVercelJson({ myStatusBarItem });
    if (!vercelJson) {
      return;
    }

    const currentBranch = await getActiveBranch();
    const { projectId, orgId } = vercelJson;

    const deploymentsResult = await fetchDeployments(
      accessToken,
      projectId,
      orgId,
      currentBranch
    );

    if (deploymentsResult.error) {
      const err = deploymentsResult.error;
      myStatusBarItem.setText(`${triangle} Error`);
      myStatusBarItem.setTooltip(`${err.message}`);
      myStatusBarItem.setBackgroundColor('statusBarItem.warningBackground');

      return;
    }

    if (!deploymentsResult.latestDeploymentForBranch) {
      myStatusBarItem.setText(`${triangle} No deployment found`);
      myStatusBarItem.setTooltip(
        `There was no deployment found for this branch.`
      );

      return;
    }

    const { state, name, createdAt, source } =
      deploymentsResult.latestDeploymentForBranch;
    const formattedDate = createdAt
      ? formatDistance(new Date(createdAt), new Date())
      : 'a while';

    myStatusBarItem.setText(`${triangle} ${toSentenceCase(state)}`);
    myStatusBarItem.setBackgroundColor(
      state === 'ERROR'
        ? 'statusBarItem.errorBackground'
        : 'statusBar.background'
    );
    myStatusBarItem.setTooltip(
      [
        name ?? 'unknown repo',
        `(${state.toLowerCase()})`,
        `${formattedDate} ago`,
        'via',
        source ?? 'unknown source',
        currentBranch?.branchName ? `on ${currentBranch.branchName}` : '',
      ].join(' ')
    );
  } catch (error) {
    const message = parseError(error);

    console.error(message);
  }
};

export default updateStatus;
