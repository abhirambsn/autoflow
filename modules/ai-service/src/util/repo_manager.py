from typing import Tuple, Any, Dict
import os
import shutil
from git import Repo

class RepositoryManager:
    def __init__(self, base_dir: str) -> None:
        self.base_dir = base_dir

    def clone_repo(self, repo_url: str, branch_name: str, repo_branch: str = "main") -> Tuple[str, Any]:
        repo_name = repo_url.split("/")[-1].replace(".git", "")
        repo_path = os.path.join(self.base_dir, repo_name)
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)
        env = os.environ.copy()
        repo = Repo.clone_from(repo_url, repo_path, branch=repo_branch, env=env)
        repo.git.checkout(repo_branch)
        repo.git.checkout("-b", branch_name)
        return repo_path, repo
    
    def write_files(self, repo_path: str, files: Dict[str, str]) -> None:
        for filepath, content in files.items():
            os.makedirs(os.path.dirname(os.path.join(repo_path, filepath)), exist_ok=True)
            with open(os.path.join(repo_path, filepath), "w") as f:
                f.write(content)
    
    def commit_and_push(self, repo: Any, branch_name: str, app_data: Any, files_list_str: str = "") -> None:
        with repo.config_writer() as config:
            config.set_value("user", "name", app_data["name"])
            config.set_value("user", "email", app_data["bot_email"])
        repo.git.add(A=True)
        repo.git.commit(m=f"Auto-generated {files_list_str} infra setup")
        origin = repo.remote(name="origin")
        origin.push(branch_name)
    
    def cleanup(self, repo_path: str) -> None:
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)