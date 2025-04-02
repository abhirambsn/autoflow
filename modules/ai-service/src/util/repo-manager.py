from typing import Tuple, Any, Dict
import os
import shutil
import uuid
from git import Repo

class RepositoryManager:
    def __init__(self, base_dir: str) -> None:
        self.base_dir = base_dir

    def clone_repo(self, repo_url: str, branch_name: str) -> Tuple[str, Any]:
        repo_name = repo_url.split("/")[-1].replace(".git", "")
        repo_path = os.path.join(self.base_dir, repo_name)
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)
        Repo.clone_from(repo_url, repo_path)
        repo = Repo(repo_path)
        repo.git.checkout("-b", branch_name)
        return repo_path, repo
    
    def write_files(self, repo_path: str, files: Dict[str, str]) -> None:
        for filename, content in files.items():
            with open(os.path.join(repo_path, filename), "w") as f:
                f.write(content)
    
    def commit_and_push(self, repo: Any, branch_name: str) -> None:
        repo.git.add(A=True)
        repo.git.commit(m="Auto-generated infra setup")
        origin = repo.remote(name="origin")
        origin.push(branch_name)
    
    def cleanup(self, repo_path: str) -> None:
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)