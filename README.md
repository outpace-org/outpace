#Project description

Webapp for creating a Strava Dashboard with features like multi-days trips and global heatmap. 

# How to run

## Add environment variables 

Create `.env` files at the root of the repo and the one in `outpace-front` with your desired credentials. 

Here is what your `.env` file at the root should look like :

```
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=db_name
POSTGRES_PORT=5432
```

And the one in `outpace-front`:

```
REACT_APP_CLIENT_ID="your_strava_client_id"
REACT_APP_CLIENT_SECRET="your_strava_secret"
REACT_APP_HOST_URL="http://localhost:8000"
REACT_APP_MAPBOX_ACCESS_TOKEN="your_mapbox_token"
```

## Run with docker

With docker running, open a terminal at the root of the project and run :

```console
docker-compose up
```

## Run without docker

This will come later
