# syntax=docker/dockerfile:1
# check=skip=InvalidDefaultArgInFrom

# Automatically build image using Python version specified in the `Pipfile`.
ARG INDEXER_WORKER_PY_VERSION

##################
# Python builder #
##################

FROM docker.io/python:${INDEXER_WORKER_PY_VERSION} AS builder

# Get the version from the main justfile
ARG OV_PDM_VERSION

# Container optimizations
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_NO_COLOR=1

# - Install system packages needed for building Python dependencies
# - Install PDM to install Python dependencies
RUN apt-get update \
    && apt-get install -yqq --no-install-recommends python3-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install pdm~=$OV_PDM_VERSION

# Copy the Pipenv files into the container
COPY pyproject.toml pdm.lock /

# Pass additional arguments when installing Python packages with PDM
ARG PDM_INSTALL_ARGS="--no-editable"

# Install Python dependencies into a new virtualenv
RUN pdm install --check --frozen-lockfile $PDM_INSTALL_ARGS

####################
# Indexer worker #
####################

FROM docker.io/python:${INDEXER_WORKER_PY_VERSION}-slim AS indexer_worker

LABEL org.opencontainers.image.source="https://github.com/WordPress/openverse"

# Container optimizations
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_NO_COLOR=1

# Activate the virtualenv
ENV PATH="/.venv/bin:$PATH"

ENV PYTHONPATH="/indexer_worker/"
# TLDEXTRACT fails to cache in /home/supervisord, set its cache to /tmp instead
ENV TLDEXTRACT_CACHE="/tmp/python-tldextract"

WORKDIR /indexer_worker

# Copy virtualenv from the builder image
COPY --from=builder /.venv /.venv

# - Install system packages needed for running Python dependencies
#   - libpq-dev: required by `psycopg2`
# - Create directory for holding worker state
RUN apt-get update \
    && apt-get install -yqq --no-install-recommends \
      curl \
      libpq-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir /worker_state

# Create a non-root user
RUN useradd ov_user \
    && chown ov_user /worker_state

USER ov_user

# Copy code into the final image
COPY --chown=ov_user . /indexer_worker/

# Expose Gunicorn server to indexer worker Falcon app
EXPOSE 8003

ARG SEMANTIC_VERSION
ENV SENTRY_RELEASE=$SEMANTIC_VERSION

CMD ["gunicorn", "--bind", "0.0.0.0:8003", "api:api"]
