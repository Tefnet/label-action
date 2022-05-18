const core = require("@actions/core");
const github = require("@actions/github");
const token = core.getInput("token");
const type = core.getInput("type");
const label = core.getInput("label");
const state = (core.getInput('state', { required: false }) || 'open').toLowerCase();


async function main() {
    const context = github.context;
    const octokit = github.getOctokit(token);
    const sha = process.env.GITHUB_SHA;
    let pr = null;
    
    if (context.payload.pull_request) {
        pr = context.payload.pull_request;
    } else {
        const result = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
            owner: context.repo.owner,
            repo: context.repo.repo,
            commit_sha: sha,
        });

        const prs = result.data.filter((el) => state === 'all' || el.state === state);
        pr = prs[0];
    }

    console.log(pr);
    console.log(context.repo);
    console.log(sha);

    if (!pr) {
        console.log("Unknown PR number");
        return;
    }
    if (type == "add") {
        await octokit.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: pr.number,
            labels: [label] 
        });
    }
    if (type == "remove") {
        await octokit.rest.issues.removeLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: pr.number,
            name: label
        });
    }
}

main();

