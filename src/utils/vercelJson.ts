import { workspace, Uri } from 'vscode';
import parseError from '@/utils/parseError';
import toast from './toast';
import { triangle } from './const';
import type { MyStatusBarItemType } from './statusBarItem';

export type VercelProjectJson = {
  projectId: string;
  orgId: string;
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

// eslint-disable-next-line @typescript-eslint/init-declarations
let res: VercelProjectJson | undefined;

const getVercelJson = async ({
  myStatusBarItem,
}: {
  myStatusBarItem: MyStatusBarItemType;
}): Promise<VercelProjectJson | undefined> => {
  if (res) {
    return res;
  }

  const root = workspace.workspaceFolders?.[0];

  if (!root) {
    return undefined;
  }

  const filePath = `${root.uri.path}/.vercel/project.json`;
  const fileUri: Uri = Uri.file(filePath);

  let vercelProjectJson: Uint8Array | null = null;

  try {
    vercelProjectJson = await workspace.fs.readFile(fileUri);
  } catch {
    myStatusBarItem.setText(`${triangle} Not Linked`);
    myStatusBarItem.setTooltip(
      'Run `vercel link` to link this project to Vercel deployments and enable this extension.'
    );
    return undefined;
  }

  try {
    const stringJson: string = Buffer.from(vercelProjectJson).toString('utf8');
    const parsedVercelProjectJSON = JSON.parse(
      stringJson
    ) as Optional<VercelProjectJson>;

    const { orgId, projectId } = parsedVercelProjectJSON;

    if (!projectId) {
      myStatusBarItem.setText(`${triangle} Not Linked`);
      myStatusBarItem.setTooltip('No Vercel Project ID found in vercel json');
      return undefined;
    }

    if (!orgId) {
      myStatusBarItem.setText(`${triangle} Not Linked`);
      myStatusBarItem.setTooltip('No Vercel Org ID found in vercel json');
      return undefined;
    }

    // eslint-disable-next-line require-atomic-updates
    res = parsedVercelProjectJSON as VercelProjectJson;
    return res;
  } catch (error) {
    const message = parseError(error);
    await toast.error(message);
    return undefined;
  }
};

export default getVercelJson;
