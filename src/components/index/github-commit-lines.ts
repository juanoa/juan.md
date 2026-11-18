type LineCounts = { additions: number; deletions: number };
type Commit = LineCounts & { oid: string; authoredDate: string };
type History = {
  nodes: Commit[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const query = `
  query($owner: String!, $name: String!, $author: ID!, $ref: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      visibility
      branch: ref(qualifiedName: $ref) {
        target {
          ... on Commit {
            history(author: {id: $author}, first: 100, after: $cursor) {
              nodes { oid authoredDate additions deletions }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
    }
  }
`;

export async function getRepositoryLines(
  nameWithOwner: string,
  defaultBranch: string,
  author: string,
  token: string,
  from: string,
  to: string,
): Promise<Map<string, LineCounts> | undefined> {
  const [owner, name] = nameWithOwner.split("/");
  const seen = new Set<string>();
  const totals = new Map<string, LineCounts>();
  const firstDay = Date.parse(from);
  try {
    // Both branches can credit contributions. A commit can belong to both.
    for (const ref of new Set([defaultBranch, "refs/heads/gh-pages"])) {
      let cursor: string | null = null;
      do {
        const response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { owner, name, author, ref, cursor },
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) throw new Error();
        const result = (await response.json()) as {
          errors?: unknown[];
          data?: {
            repository: {
              visibility: string;
              branch: { target: { history: History } } | null;
            } | null;
          };
        };
        const repo = result.data?.repository;
        if (result.errors?.length || repo?.visibility !== "PUBLIC")
          throw new Error();
        if (!repo.branch && ref !== defaultBranch) break;
        const history = repo.branch?.target.history;
        if (!history) throw new Error();
        for (const commit of history.nodes) {
          const day = commit.authoredDate.slice(0, 10);
          if (day < from || day > to || seen.has(commit.oid)) continue;
          seen.add(commit.oid);
          const weekMs = 7 * 86_400_000;
          const weekStart = new Date(
            firstDay +
              Math.floor((Date.parse(day) - firstDay) / weekMs) * weekMs,
          )
            .toISOString()
            .slice(0, 10);
          const sum = totals.get(weekStart) ?? { additions: 0, deletions: 0 };
          sum.additions += commit.additions;
          sum.deletions += commit.deletions;
          totals.set(weekStart, sum);
        }
        cursor = history.pageInfo.hasNextPage
          ? history.pageInfo.endCursor
          : null;
      } while (cursor);
    }
    return totals;
  } catch {
    // Discard partial histories instead of presenting partial sums as totals.
    console.warn(`GitHub line totals unavailable for ${nameWithOwner}.`);
  }
}
