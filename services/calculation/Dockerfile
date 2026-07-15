FROM python:3.12-slim
WORKDIR /app

# No external dependencies for the core engine
COPY . .

EXPOSE 8080
CMD ["python", "server.py"]
