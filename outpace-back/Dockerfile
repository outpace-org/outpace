FROM python:3.9

WORKDIR /code

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

RUN apt-get update && apt-get install -y dos2unix

COPY ./wait-for-postgres.sh /code/wait-for-postgres.sh

RUN dos2unix /code/wait-for-postgres.sh

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./sql_app /code/app

CMD ["bash", "wait-for-postgres.sh", "db", "5432", "uvicorn", "app.api:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8000"]