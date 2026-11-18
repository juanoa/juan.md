import { getRepositoryLines } from "./github-commit-lines";

export interface Week {
  start: string;
  end: string;
  total: number;
  repositories: {
    name: string;
    count: number;
    favicon?: string;
    lines?: { additions: number; deletions: number };
  }[];
  privateCount: number;
}

type Repository = {
  nameWithOwner: string;
  visibility: string;
  homepageUrl: string | null;
  defaultBranchRef: { prefix: string; name: string } | null;
};
type Group = { repository: Repository; contributions: { totalCount: number } };
type Collection = {
  contributionCalendar: {
    weeks: {
      contributionDays: { date: string; contributionCount: number }[];
    }[];
  };
  restrictedContributionsCount: number;
  commits: Group[];
  issues: Group[];
  pullRequests: Group[];
  reviews: Group[];
  creations: { nodes: { repository: Repository }[] };
};

const repository =
  "repository { visibility nameWithOwner homepageUrl defaultBranchRef { prefix name } }";
const group = `{ ${repository} contributions(first: 1) { totalCount } }`;
const fields = `{
  contributionCalendar { weeks { contributionDays { date contributionCount } } }
  restrictedContributionsCount
  commits: commitContributionsByRepository(maxRepositories: 100) ${group}
  issues: issueContributionsByRepository(maxRepositories: 100) ${group}
  pullRequests: pullRequestContributionsByRepository(maxRepositories: 100) ${group}
  reviews: pullRequestReviewContributionsByRepository(maxRepositories: 100) ${group}
  creations: repositoryContributions(first: 100) { nodes { ${repository} } }
}`;

function summarize(
  start: string,
  end: string,
  data: Collection,
  homepages: Map<string, string>,
  branches: Map<string, string>,
): Week {
  const counts = new Map<string, number>();
  let privateCount = data.restrictedContributionsCount;
  function add(repo: Repository, count: number) {
    if (repo.visibility === "PUBLIC") {
      if (repo.defaultBranchRef)
        branches.set(
          repo.nameWithOwner,
          repo.defaultBranchRef.prefix + repo.defaultBranchRef.name,
        );
      if (repo.homepageUrl) homepages.set(repo.nameWithOwner, repo.homepageUrl);
      counts.set(
        repo.nameWithOwner,
        (counts.get(repo.nameWithOwner) ?? 0) + count,
      );
    } else {
      privateCount += count;
    }
  }
  for (const group of [
    ...data.commits,
    ...data.issues,
    ...data.pullRequests,
    ...data.reviews,
  ]) {
    add(group.repository, group.contributions.totalCount);
  }
  for (const creation of data.creations.nodes) add(creation.repository, 1);
  const total = data.contributionCalendar.weeks
    .flatMap((week) => week.contributionDays)
    .filter((day) => day.date >= start && day.date <= end)
    .reduce((sum, day) => sum + day.contributionCount, 0);
  const repositories = Array.from(counts, ([name, count]) => ({ name, count }))
    .filter((repo) => repo.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { start, end, total, repositories, privateCount };
}

function mockWeek(start: string, end: string, username: string): Week {
  let hash = 0;
  for (const character of start) {
    hash = (hash * 31 + character.charCodeAt(0)) % 2_147_483_647;
  }
  const total = 25 + (hash % 176);
  const privateCount = [0, Math.floor(total / 3), total][hash % 3];
  const publicCount = total - privateCount;
  const repositories = [
    {
      name: `${username}/juan.md`,
      count: Math.ceil(publicCount / 2),
      favicon: hash % 2 ? "/favicon.ico" : undefined,
      lines: { additions: 100 + (hash % 1250), deletions: hash % 275 },
    },
    {
      ...(hash % 2
        ? {
            name: `${username}/coruna.fyi`,
            favicon: "https://coruna.juan.md/favicon.svg",
          }
        : { name: `${username}/example-project` }),
      count: Math.floor(publicCount / 2),
      lines: { additions: hash % 420, deletions: hash % 135 },
    },
  ].filter((repo) => repo.count > 0);
  return { start, end, total, privateCount, repositories };
}

async function findFavicon(homepage: string): Promise<string | undefined> {
  const site = URL.parse(homepage);
  if (!site || !["https:", "http:"].includes(site.protocol)) return;

  // The index can find icons outside the site's root, but may miss SVGs.
  const icon = new URL("https://t3.gstatic.com/faviconV2");
  icon.search = new URLSearchParams({
    client: "SOCIAL",
    type: "FAVICON",
    size: "32",
    url: site.origin,
  }).toString();
  try {
    const response = await fetch(icon, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });
    if (
      response.ok &&
      response.headers.get("content-type")?.startsWith("image/")
    )
      return icon.href;
  } catch {
    // Fall back to the site's own icon when the index is unavailable.
  }
  return new URL("/favicon.svg", site.origin).href;
}

export async function getContributionWeeks(
  username: string,
  from: string,
  today: Date,
  development: boolean,
): Promise<Week[]> {
  const first = new Date(`${from}T00:00:00.000Z`);
  if (
    !Number.isFinite(first.valueOf()) ||
    first.toISOString().slice(0, 10) !== from ||
    first > today
  ) {
    throw new Error(`Invalid contribution start date "${from}".`);
  }
  const ranges = [];
  const weekMs = 7 * 86_400_000;
  for (let time = first.getTime(); time <= today.getTime(); time += weekMs) {
    ranges.push({
      from: new Date(time).toISOString(),
      to: new Date(Math.min(time + weekMs - 1, today.getTime())).toISOString(),
    });
  }
  if (development)
    return ranges.map((range) =>
      mockWeek(range.from.slice(0, 10), range.to.slice(0, 10), username),
    );
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token)
    throw new Error("Missing GITHUB_TOKEN for the GitHub contributions build.");

  const weeks: Week[] = [];
  const homepages = new Map<string, string>();
  const branches = new Map<string, string>();
  let author = "";
  // Batch fixed seven-day ranges so each repository count matches its square.
  for (let offset = 0; offset < ranges.length; offset += 8) {
    const batch = ranges.slice(offset, offset + 8);
    const selections = batch.map(
      ({ from, to }, i) =>
        `w${i}: contributionsCollection(from: "${from}", to: "${to}") ${fields}`,
    );
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query($login: String!) { user(login: $login) { id ${selections.join("\n")} } }`,
        variables: { login: username },
      }),
    });
    if (!response.ok)
      throw new Error(
        `GitHub contributions request failed (HTTP ${response.status}).`,
      );
    const result = (await response.json()) as {
      data?: { user: ({ id: string } & Record<string, Collection>) | null };
      errors?: { message: string }[];
    };
    const user = result.data?.user;
    if (!user || result.errors?.length)
      throw new Error(
        result.errors?.map((error) => error.message).join(", ") ||
          "GitHub user unavailable.",
      );
    author = user.id;
    batch.forEach(({ from, to }, i) =>
      weeks.push(
        summarize(
          from.slice(0, 10),
          to.slice(0, 10),
          user[`w${i}`],
          homepages,
          branches,
        ),
      ),
    );
  }
  const entries = Array.from(branches);
  for (let i = 0; i < entries.length; i += 3) {
    await Promise.all(
      entries.slice(i, i + 3).map(async ([name, branch]) => {
        const totals = await getRepositoryLines(
          name,
          branch,
          author,
          token,
          from,
          today.toISOString().slice(0, 10),
        );
        if (!totals) return;
        for (const week of weeks) {
          const repo = week.repositories.find((repo) => repo.name === name);
          if (repo)
            repo.lines = totals.get(week.start) ?? {
              additions: 0,
              deletions: 0,
            };
        }
      }),
    );
  }
  const icons = new Map(
    await Promise.all(
      Array.from(
        new Set(homepages.values()),
        async (homepage) => [homepage, await findFavicon(homepage)] as const,
      ),
    ),
  );
  for (const week of weeks) {
    for (const repo of week.repositories) {
      const homepage = homepages.get(repo.name);
      const favicon = homepage && icons.get(homepage);
      if (favicon) repo.favicon = favicon;
    }
  }
  return weeks;
}
