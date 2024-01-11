FROM python:3.9

WORKDIR /code

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

COPY ./wait-for-postgres.sh /code/wait-for-postgres.sh

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./.env /code/.env

COPY ./sql_app /code/app

CMD ["./wait-for-postgres.sh", "db", "5432", "python", "./app/main.py"]
