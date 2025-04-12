from github import Github, GithubIntegration
from typing import Any
import os
from pathlib import Path

class GithubHandler:
    github: Github
    integration: GithubIntegration

    def __init__(self, github_app_token: str):
        self.github = None
        base_dir = Path(os.path.dirname(os.path.abspath(__file__))).parent.parent
        privkey_path = os.path.join(base_dir, "files/gh-app-privkey.pem")
        with open(privkey_path, "r") as f:
            private_key = f.read()
        self.integration = GithubIntegration(github_app_token, private_key)
    
    def get_repo_metadata(self, owner: str, repo_name: str):
        repo = self.github.get_repo(f"{owner}/{repo_name}")
        return {
            "description": repo.description,
            "topics": repo.get_topics(),
            "language": repo.language,
            "default_branch": repo.default_branch,
            "repo_obj": repo
        }
    
    def clone_repo_with_github_app(self, repo_url: str):
        owner, repo = repo_url.split("/")[-2:]
        repo_name = repo.replace(".git", "")
        installation = self.integration.get_repo_installation(owner, repo_name)
        access_token = self.integration.get_access_token(installation.id).token
        self.github = Github(access_token)
        authenticated_repo_url = repo_url.replace("https://", f"https://x-access-token:{access_token}@")
        os.environ['GIT_USERNAME'] = 'x-access-token'
        os.environ['GIT_PASSWORD'] = access_token
        return authenticated_repo_url        
    
    def create_pull_request(self, repo: Any, branch_name: str, title: str, body: str) -> Any:
        return repo.create_pull(
            title=title,
            body=body,
            head=branch_name,
            base=repo.default_branch
        )