import os
import logging
from app import create_app

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)