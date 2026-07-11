import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Get the path to Backend/.env file
backend_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_dir, '.env')

# Add Backend directory to sys.path to allow absolute imports of agents package
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Load environmental variables
load_dotenv(dotenv_path, override=True)

from agents.coordinator import AgentCoordinator

app = Flask(__name__)
# Allow CORS requests from standard clients
CORS(app)

# Initialize the modular agent coordinator
coordinator = AgentCoordinator()

@app.route('/generate-startup', methods=['POST'])
def generate_startup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    startup_idea = data.get("startupIdea")
    if not startup_idea or not startup_idea.strip():
        return jsonify({"error": "Field 'startupIdea' is required and cannot be empty."}), 400

    try:
        # Call the StartupAgent via the coordinator registry
        result = coordinator.run_agent("startup", {"startupIdea": startup_idea.strip()})
        return jsonify(result), 200
    except RuntimeError as run_err:
        print(f"Error running agent: {str(run_err)}")
        return jsonify({"error": str(run_err)}), 500
    except Exception as err:
        print(f"Unexpected exception running agent: {str(err)}")
        return jsonify({"error": f"An unexpected internal error occurred: {str(err)}"}), 500

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    print(f"Booting StartupSense AI Flask server on port {port}...")
    app.run(host='127.0.0.1', port=port, debug=True)
