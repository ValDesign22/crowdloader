# Crowdloader
Crowloader is a tool to download translations files from crowdin.com.

## Installation
```bash
npm i -g crowdloader
```

## Usage
```bash
crowdloader --help

# Example
# Init a project
crowdloader init --projectid <projectid> --apikey <apikey> --project <folder>

# Get project configuration
crowdloader config --project <folder>

# Download translations
crowdloader download --project <folder>
```