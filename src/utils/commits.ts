import { Octokit } from "@octokit/rest";

const cache = new Map<string, any>();
const oneDay = 1000 * 60 * 60 * 24;

const getLastCommits = async (repo: string, count: number) => {
    const currentTime = Date.now();
    const cachedData = cache.get(repo);
    if (cachedData && (currentTime - cachedData.timestamp < oneDay)) {
        return cachedData.commits;
    }
    const octokit = new Octokit();
    const { data } = await octokit.repos.listCommits({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        per_page: count
    });
    cache.set(repo, {
        timestamp: currentTime,
        commits: data
    });
    return data;
};

export { getLastCommits };