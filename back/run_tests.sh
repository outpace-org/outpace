#!/bin/bash

# Assign the arguments to variables
PASSWORD=$1
USER=$2
DB_NAME=$3

# Restore the database
PGPASSWORD=$PASSWORD pg_restore --verbose --clean --no-acl --no-owner -U $USER -d $DB_NAME tests/data/outpace_dump_cust.sql

# Run the tests
pytest tests
