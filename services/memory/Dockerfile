FROM python:3.12-slim
WORKDIR /app

# Memory engine uses Python stdlib only
COPY . .

EXPOSE 8300
CMD ["python", "-m", "engine.server"]
