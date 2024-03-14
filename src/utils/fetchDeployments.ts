import fetch from 'cross-fetch';
import { addMinutes } from 'date-fns';

type VercelDeployment = {
  source?: string;
  name?: string;
  createdAt?: string;
  state:
    | 'BUILDING'
    | 'CANCELED'
    | 'ERROR'
    | 'INITIALIZING'
    | 'QUEUED'
    | 'READY';
  meta?: {
    githubCommitRef: string;
  };
  inspectorUrl: string;
};
type VercelResponse = {
  error?: Error;
  deployments?: VercelDeployment[];
};

const fetchDeploymentForBranch = async (
  accessToken: string,
  projectId: string,
  teamId?: string,
  currentBranch?: { branchName?: string; commitDate?: Date }
): Promise<VercelDeployment | undefined> => {
  const untilParam = currentBranch?.commitDate
    ? `&until=${addMinutes(currentBranch.commitDate, 1).getTime()}`
    : '';

  const response = await fetch(
    teamId
      ? `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=10${untilParam}`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10${untilParam}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = (await response.json()) as VercelResponse;

  if (data.error) {
    throw new Error(data.error.message);
  }

  const deploymentOfBranch = data.deployments?.find(
    (deployment) =>
      deployment.meta?.githubCommitRef === currentBranch?.branchName
  );
  return deploymentOfBranch;
};

export default fetchDeploymentForBranch;
