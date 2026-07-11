from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    def run(self, input_data: dict) -> dict:
        """Run the agent logic on input data and return a structured dictionary."""
        pass
