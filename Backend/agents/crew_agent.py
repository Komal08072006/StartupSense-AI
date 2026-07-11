import os
import json
from .base import BaseAgent
from .startup_idea_validator.crew import StartupIdeaValidatorCrew

class CrewAgent(BaseAgent):
    def run(self, input_data: dict) -> dict:
        startup_idea = input_data.get("startupIdea")
        if not startup_idea:
            raise ValueError("No 'startupIdea' provided in request input data.")

        print(f"Running CrewAI Multi-Agent Validation for: {startup_idea}...")
        crew_instance = StartupIdeaValidatorCrew().crew()
        result = crew_instance.kickoff(inputs={"startup_idea": startup_idea})
        
        print("CrewAI Run finished! Processing output...")
        
        # CrewOutput structure has pydantic, json_dict, and raw properties.
        if hasattr(result, 'pydantic') and result.pydantic is not None:
            return result.pydantic.model_dump()
        elif hasattr(result, 'json_dict') and result.json_dict is not None:
            return result.json_dict
        else:
            try:
                # Try parsing raw output as JSON
                return json.loads(result.raw)
            except Exception as parse_err:
                raise RuntimeError(
                    f"Crew completed but failed to parse output. Raw output: {result.raw}. Error: {str(parse_err)}"
                )
