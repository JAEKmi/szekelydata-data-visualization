$(document).ready(function () {
    var filesList = ["files/city.json", "files/birth.json", "files/migrations.json"];
    var results = [];
    var list = [];
    var descriptions = [{ birth: "This plot shows us where most of the Székelys were born. In Transylvania, obviously." },
                        { current: "This plot is about the current locations of the Székelys, according to the given data set." },
                        { migration: "This plot makes a connection between the birthplaces and the current locations of the Székelys." }];
    var mappedDesc = [];
    descriptions.map(function (desc) { mappedDesc[Object.keys(desc)[0]] = desc; });

    filesList.forEach(function(url, i) { 
        list.push( 
          fetch(url).then(function (res) {
              res.json().then(function (data) {
                  results[i] = data;
              });
          })
        );
    });

    Promise.all(list).then(function () {
        $(results).load("files/migrations.json", function () {
            //construct the globe here with the newly fetched data
            var descriptionField = document.getElementsByClassName("description")[0];
            var container = document.getElementsByClassName('container')[0];
            var globe = new DAT.Globe(container);

            //starting plot type
            currentPlot(globe, mapRawData("LivesHere", results[0], "numOfInhabitants", 0.009), "dot");
            descriptionField.textContent = mappedDesc.current.current;

            //add eventListeners here
            var buttons = document.getElementsByClassName("button");
            for (var i = 0; i < buttons.length; ++i)
                addClickHandler(buttons[i]);
        
        
            $(".option").click(function () {
                var buttonName = $(this)[0].textContent;
                descriptionField.textContent = mappedDesc[buttonName][buttonName];
                if (buttonName == "birth") 
                    currentPlot(globe, mapRawData("BornHere", results[1], "numOfBirths", 0.00025), "dot"); 
                if (buttonName == "current") 
                    currentPlot(globe, mapRawData("LivesHere", results[0], "numOfInhabitants", 0.009), "dot");
                if (buttonName == "migration")
                    currentPlot(globe, createMigrationPath(results[0], results[2]), "line");
            });

            //handle the chart construction here
            createChart("Cities with highest population(top 25)", "", mapRawDataForCharts(results[0], "numOfInhabitants", 25), "chartContainer");
            createChart("Cities with the highest birth rate", "", mapRawDataForCharts(results[1], "numOfBirths"), "chartContainer1");
        });
    });

    function addClickHandler(elem) {
        //eventlistener for the autoscroll buttons
        var scale = 1;
        if ($(elem).hasClass("button2"))
            scale = 2;
        elem.addEventListener('click', function (e) {
            $('html, body').stop().animate({
                scrollTop: document.documentElement.clientHeight * scale
            }, {
                easing: 'linear'
            }, 3000);
        });
    }

    function currentPlot(globe, data, type) {
        globe.removeAllPoints();
        globe.removeAllLines();
        if(type == "line"){
            globe.addMigrationPaths(data, { format: 'magnitude', name: "Migrations" });
            globe.createPoints();
            globe.animate();
        }
        else if(type == "dot"){
            globe.addData(data[1], { format: 'magnitude', name: data[0] });
            globe.createPoints();
            globe.animate();
        }
    }

    function createMigrationPath(cities, relationships) {
        //[startLat, startLong, endLat, endLong] < an element should look like this
        //map the cities by their names first for easier reference
        var mapped = [];
        cities.map(function (city) {
            mapped[city.name] = city;
        });
        
        var results = [];
        //loop through the relations and construct the migrational array
        relationships.forEach(function (relation) {
            if (mapped[relation.bornwhere] && mapped[relation.liveswhere]) {
                results.push(mapped[relation.bornwhere].latitude);
                results.push(mapped[relation.bornwhere].longitude);
                results.push(mapped[relation.liveswhere].latitude);
                results.push(mapped[relation.liveswhere].longitude);
                results.push(1.5);
            }

        });
        return results;
    }

    function mapRawData(header, data, property, scale) {
        var result = [], innerArray = [];
        data.forEach(function (element) {
            innerArray.push(element.latitude);
            innerArray.push(element.longitude);
            innerArray.push(element[property] * scale);
        });
        result.push(header);
        result.push(innerArray);
        return result;
    }

    function mapRawDataForCharts(data, property, num){
        var array = [];
        data.forEach(function (city) {
            if (city.name != "vlahica" && property == "numOfInhabitants" || property == "numOfBirths") {
                var obj = {};
                obj["y"] = city[property];
                obj["label"] = city.name;
                array.push(obj);
            }

        });
        array.sort(function (elem1, elem2) {
            if (elem1.y >= elem2.y)
                return 1;
            else
                return -1;
        });
        if(arguments.length > 2)
            return array.slice(array.length - num, array.length);
        return array;
    }

    function createChart(title, yTitle, data, container) {
        var options = chartOptions;
        options.title.text = title;
        options.axisY2.title = yTitle;
        options.data[0].dataPoints = data;
        //console.log(options);
        var chart = new CanvasJS.Chart(container, options);
        chart.render();
    }

    var chartOptions = {
        animationEnabled: true,
        theme: "dark2",
        backgroundColor: "#000000",
        toolTip: {
            fontColor: "white",
        },
        title: {
            text: "",
            fontSize: 30
        },
        axisX: {
            interval: 1,
            labelFontSize: 15
        },
        axisY2: {
            interlacedColor: "#0f0f0f",
            gridColor: "rgba(1,77,101,.1)",
            title: "",
            titleFontSize: 25,
            labelFontSize: 20
        },
        data: [{
            type: "bar",
            name: "companies",
            axisYType: "secondary",
            color: "#303030",
            dataPoints: []
        }]
    }
});
