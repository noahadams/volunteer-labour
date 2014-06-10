# jsGrid
Sketching out a distributed batch queue for javascript (on the browser)

## Install
- For now, checkout the repo

## Running it
- if you don't have it already, `npm install -g serve`
- `$ serve`
- Visit [http://localhost:3000/](http://localhost:3000/)

## Tests
Once I've got some more structure....

## Data formats
### Submission Job format:

    {
        "input": <JSON object>
        "jobBody": <sstring containing javascript method body implementing contract>
    }

### Job submission receipt

    {
        "jobId": <unique job identifier string>
    }

### Worker Job format

    {
        "input": <JSON object>
      "jobBody": <string containing javascript method body implementing contract>
    }
