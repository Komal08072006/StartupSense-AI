import os
from crewai import LLM
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from agents.startup_agent import StartupPlan

@CrewBase
class StartupIdeaValidatorCrew:
    """StartupIdeaValidator crew"""

    @property
    def llm(self) -> LLM:
        model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-specdec")
        if not model_name.startswith("groq/"):
            model_name = f"groq/{model_name}"
        return LLM(
            model=model_name,
            api_key=os.getenv("GROQ_API_KEY")
        )

    @agent
    def market_research_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["market_research_analyst"],
            tools=[],
            reasoning=False,
            max_reasoning_attempts=None,
            inject_date=True,
            allow_delegation=False,
            max_iter=25,
            max_rpm=None,
            max_execution_time=None,
            llm=self.llm,
        )

    @agent
    def business_strategist_planner(self) -> Agent:
        return Agent(
            config=self.agents_config["business_strategist_planner"],
            tools=[],
            reasoning=False,
            max_reasoning_attempts=None,
            inject_date=True,
            allow_delegation=False,
            max_iter=25,
            max_rpm=None,
            max_execution_time=None,
            llm=self.llm,
        )

    @agent
    def product_manager_technologist(self) -> Agent:
        return Agent(
            config=self.agents_config["product_manager_technologist"],
            tools=[],
            reasoning=False,
            max_reasoning_attempts=None,
            inject_date=True,
            allow_delegation=False,
            max_iter=25,
            max_rpm=None,
            max_execution_time=None,
            llm=self.llm,
        )

    @agent
    def swot_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["swot_analyst"],
            tools=[],
            reasoning=False,
            max_reasoning_attempts=None,
            inject_date=True,
            allow_delegation=False,
            max_iter=25,
            max_rpm=None,
            max_execution_time=None,
            llm=self.llm,
        )

    @agent
    def startup_chief_editor(self) -> Agent:
        return Agent(
            config=self.agents_config["startup_chief_editor"],
            tools=[],
            reasoning=False,
            max_reasoning_attempts=None,
            inject_date=True,
            allow_delegation=False,
            max_iter=25,
            max_rpm=None,
            max_execution_time=None,
            llm=self.llm,
        )

    @task
    def market_research_report(self) -> Task:
        return Task(
            config=self.tasks_config["market_research_report"],
            markdown=False,
        )

    @task
    def business_strategy_report(self) -> Task:
        return Task(
            config=self.tasks_config["business_strategy_report"],
            markdown=False,
            async_execution=True,
        )

    @task
    def product_tech_report(self) -> Task:
        return Task(
            config=self.tasks_config["product_tech_report"],
            markdown=False,
            async_execution=True,
        )

    @task
    def swot_analysis(self) -> Task:
        return Task(
            config=self.tasks_config["swot_analysis"],
            markdown=False,
            async_execution=True,
        )

    @task
    def final_business_plan(self) -> Task:
        return Task(
            config=self.tasks_config["final_business_plan"],
            markdown=False,
            output_pydantic=StartupPlan,
        )

    @crew
    def crew(self) -> Crew:
        """Creates the StartupIdeaValidator crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
