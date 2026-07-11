import os
import sys
from dotenv import load_dotenv

# Add Backend folder to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

# Load environmental variables
load_dotenv(os.path.join(backend_dir, '.env'))

from agents.startup_idea_validator.crew import StartupIdeaValidatorCrew

def main():
    print("Testing StartupIdeaValidatorCrew...")
    idea = "A yoga class assistant app that uses AI to analyze poses via camera and suggest real-time corrections."
    try:
        crew_instance = StartupIdeaValidatorCrew().crew()
        print("Crew instantiated successfully!")
        print("Running crew kickoff...")
        result = crew_instance.kickoff(inputs={"startup_idea": idea})
        print("Crew run complete!")
        print("Result type:", type(result))
        print("Pydantic output:", result.pydantic)
    except Exception as e:
        print("Error during crew execution:", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
