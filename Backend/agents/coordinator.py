from typing import Dict
from .base import BaseAgent
from .startup_agent import StartupAgent
from .crew_agent import CrewAgent

class AgentCoordinator:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        # Register the CrewAgent as the primary startup validator
        self.register_agent("startup", CrewAgent())
        # Register the single Gemini StartupAgent as a fallback
        self.register_agent("startup_fallback", StartupAgent())

    def register_agent(self, name: str, agent: BaseAgent):
        """Register a new AI agent in the coordinator registry."""
        self._agents[name] = agent

    def run_agent(self, agent_name: str, input_data: dict) -> dict:
        """Execute the specified agent on the input data with fallback logic."""
        if agent_name not in self._agents:
            raise ValueError(f"Agent '{agent_name}' is not registered in the coordinator.")
        
        try:
            return self._agents[agent_name].run(input_data)
        except Exception as err:
            # Fall back to single-agent validator if primary (CrewAI) fails
            if agent_name == "startup":
                print(f"Primary CrewAI validation failed: {str(err)}. Falling back to single-agent validator...")
                fallback_agent = self._agents.get("startup_fallback")
                if fallback_agent:
                    return fallback_agent.run(input_data)
            raise err
