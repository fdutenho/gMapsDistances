# gMapsDistance

Uses Google Maps API to calculate the travel time by car, bike and transit from many origins (see input.csv)
to one destination, creates a JSON or a CSV file.

# Usage

## configure
You need to add a `gooleAPI.key` file containing your goole API key.

## run
1. start the node server
2. open http://localhost:3000/csv or http://localhost:3000/json in your browser.

---

## develop
if you like to improve the code, I suggest to run node.js in hot reload mode

```
node .\node_modules\nodemon\bin\nodemon.js .\index.js
```
