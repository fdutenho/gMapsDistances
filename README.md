# gMapsDistance

Uses Google Maps API to calculate the travel time by car, bike and transit from many origins (see input.csv)
to one destination, creates a JSON or a CSV file.

# Usage

## configure
1. You need to add a `gooleAPI.key` file containing your goole API key.
2. modify the `input.csv` file and add your origns here (use `;` to separate the entries)
3. change the `const destination = {"lat": 50.580276, "lng": 8.664836};` to your destination

## run
1. start the node server
2. open http://localhost:3000/csv or http://localhost:3000/json in your browser.

---

## develop
if you like to improve the code, I suggest to run node.js in hot reload mode

```
node .\node_modules\nodemon\bin\nodemon.js .\index.js
```
