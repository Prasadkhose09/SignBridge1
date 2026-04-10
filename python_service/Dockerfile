FROM python:3.11.5-slim

# Install core system dependencies required by MediaPipe and OpenCV-Headless
# Since Render doesn't provide these natively, we must install them globally
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgles2-mesa \
    libegl1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements and install them securely
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the python service architecture files into the container
COPY . .

# Start the Flask app using Gunicorn directly attached to the deployment port
# $PORT is automatically injected by Render on startup 
CMD gunicorn flask_server:app --bind 0.0.0.0:${PORT:-5000} --workers 1 --threads 4 --timeout 120
