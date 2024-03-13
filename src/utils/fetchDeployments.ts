import fetch from 'cross-fetch';

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
};
type VercelResponse = {
  error?: Error;
  deployments?: VercelDeployment[];
};

const fetchDeploymentForBranch = async (
  accessToken: string,
  projectId: string,
  teamId?: string,
  currentBranch?: string
): Promise<VercelDeployment | undefined> => {
  const response = await fetch(
    teamId
      ? `https://api.vercel.com/v6/deployments?teamId=${teamId}&projectId=${projectId}&limit=10`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10`,
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
    (deployment) => deployment.meta?.githubCommitRef === currentBranch
  );
  return deploymentOfBranch;
};

export default fetchDeploymentForBranch;
