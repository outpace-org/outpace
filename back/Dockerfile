FROM python:3.9

WORKDIR /code

RUN apt-get update && apt-get install -y dos2unix

COPY ./wait-for-postgres.sh /code/wait-for-postgres.sh

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./main.py /code/main.py
COPY ./sql_app /code/sql_app

ENV OUTPACE_DB=$OUTPACE_DB
ENV OUTPACE_HOST=$OUTPACE_HOST
ENV OUTPACE_PASSWORD=$OUTPACE_PASSWORD
ENV OUTPACE_PORT=$OUTPACE_PORT
ENV OUTPACE_USER=$OUTPACE_USER

CMD ["python", "main.py"]
