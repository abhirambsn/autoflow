from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Any, List, Dict
import os
from pathlib import Path
import re

class InfraGenerator:
    def __init__(self, model_name: str) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0
        )
    
    def _generate_prompt(self, repo_metadata: Any, workflow_type: str, required_files: List[str], additional_requirements: str) -> str:
        global system_prompt
        global human_prompt
        system_prompt = ""
        human_prompt = ""

        BASE_PATH = Path(os.path.dirname(os.path.abspath(__file__))).parent.parent

        with open(os.path.join(BASE_PATH, "files/system_prompt.txt"), "r") as f:
            system_prompt = f.read()

        with open(os.path.join(BASE_PATH, "files/human_prompt.txt"), "r") as f:
            human_prompt = f.read()

        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                system_prompt
            ),
            (
                "human",
                human_prompt
            )
        ])
        return prompt.format(
            metadata=repo_metadata,
            workflow_type=workflow_type,
            required_files=required_files,
            additional_requirements=additional_requirements,
        )
    
    def generate_files(self, repo_metadata: Any, workflow_type: str, required_files: List[str], additional_requirements: str) -> Dict[str, str]:
        prompt = self._generate_prompt(repo_metadata, workflow_type, required_files, additional_requirements)
        print(f"Prompt: {prompt}")
        response = self.llm.invoke(prompt)
        print(f"Response: {response.content}")

        result = {}

        pattern = r"===START: (.*?)===\n```(?:.*?)\n(.*?)```\n===END: \1==="
        matches = re.findall(pattern, response.content, re.DOTALL)

        for filename, content in matches:
            result[filename] = content.strip()
        return result


        

    
