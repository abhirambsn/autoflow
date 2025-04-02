from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Any

class InfraGenerator:
    def __init__(self, model_name: str) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=None
        )
    
    def _generate_prompt(self, repo: Any):
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                ""
            ),
            (
                "human",
                ""
            )
        ])
        return prompt
    
    
