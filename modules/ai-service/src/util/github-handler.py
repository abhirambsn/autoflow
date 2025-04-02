from github import Github
from typing import Any

class GithubHandler:
    def __init__(self, github_app_token: str):
        self.github = Github(github_app_token)
    
    def get_repo_metadata(self, owner: str, repo_name: str):
        repo = self.github.get_repo(f"{owner}/{repo_name}")
        return {
            "description": repo.description,
            "topics": repo.get_topics(),
            "language": repo.language,
            "default_branch": repo.default_branch,
            "repo_obj": repo
        }
    
    def create_pull_request(self, repo: Any, branch_name: str, title: str, body: str) -> Any:
        return repo.create_pull(
            title=title,
            body=body,
            head=branch_name,
            base=repo.default_branch
        )