var NUMBER_OF_COUNTRIES = 180;
var TYPE_OF_ATTACK = "None", GLOBAL_YEAR, GLOBAL_DATA, GLOBAL_MAP, GLOBAL_COUNTRY;

var barW = 800,
    barH = 500,
    barMargin = {top: 20, bottom: 120, left: 100, right: 20},
    barX = d3.scaleBand().padding(0.1),
    barY = d3.scaleLinear(),
    barXLine = d3.scaleBand().padding(50),
    barYLine = d3.scaleLinear(),
    barXAxis = null;

function generateYears(year){
	var years = [];
	var start = 2000;
	while(start <= year){
		years.push(start);
		start++;
	}
	return years;
}

function getUniqTypeOfAttack(data){
	var types = _.uniq( data.map(function(d){ return d.type }) )
	return types;
}

function getHistotyBySpecificType(data, years){
	var history = [];
	var dat = Object.keys(data).map(function(key) {
	  	return [data[key]];
	})
	// console.log(dat);
	_.each(years, function(d){
		var totals = {};
		var total = _.map(dat, function(s){
			return [s[0][d], s[0].type];
		}) 	
		// console.log(total);
		totals["year"] = d;
		var max = 0;
		_.each(total, function(c){
			if( max <= c[0]) max = c[0];
			totals[c[1]] = c[0];
		})
		totals["max"] = max;
		history.push(totals);
		
	})
	// console.log(history);
	return history;
}

function getHistory(data){
	var history = []
	var historyByYear = _.filter(data, function(d){
		return d.iyear <= GLOBAL_YEAR && d.iyear >= 2000;
	})
	var years = _.uniq(historyByYear.map(function(d) { return d.iyear }));
	var types = _.uniq(_.map(data, function(d) { return d.attacktype1_txt }));
	
	_.each(types, function(d) {
			history.push({"type": d});
	});

	_.each(years, function(d){
		var specificYear = historyByYear.filter(function(s){
			return d == s.iyear;
		})

		_.each(history, function(d){
			var totalOfSpecificYear = _.countBy(specificYear, "attacktype1_txt");
			if(totalOfSpecificYear[d.type] !== undefined)
				d[specificYear[0].iyear] = totalOfSpecificYear[d.type];
			else d[specificYear[0].iyear] = 0;
		})
	})
	return history;
}

function filderByYear(data, year){
	var dataByYear = data.filter(function(d){
		return d.iyear == year;
	})

	return dataByYear;
}

function filterByType(data, type){
	if(type !== "None"){
		var filteredData = _.filter(data, function(d){
			return d.attacktype1_txt == type;
		})
		return filteredData;
	}
	else return data;
}

function filterByCountry(data, country){
	var filtered = _.filter(data, function(d){
		return d.country_txt == country;
	})
	return filtered;
}

function getSuccessRate(data, country){
	var filterByCountry = _.filter(data, function(d){
		return d.country_txt == country;
	})
	var noOfSuccess = _.countBy(filterByCountry, "success");
	var noOfIncidient = _.countBy(filterByCountry, country);
	if(noOfSuccess[1] == undefined)
		return 0;
	else return noOfSuccess[1] / (noOfIncidient.undefined);
}

function setRanking(data, noOfIncidient){
	
	var rank = [0];
	var array = Object.keys(noOfIncidient).map(function(key) {
		var successRate = getSuccessRate(data, key.toString());
	  	return [key, noOfIncidient[key], successRate];
	})

	_.each(array, function(d){
		rank.push(d[1]);
	})
	var sorted = _.sortBy(array, ["1", "2"])

	rank.sort(function(a, b){return a - b});

	_.each(array, function(d){
		ranking = _.indexOf(sorted, d) + 1;
		d.push(ranking);
	})

	// console.log(array);

	var obj = {};
	array.forEach(function(d){
		obj[d[0]] = d[3];
	})
	// console.log(obj);
	return obj;
}

function drawMap(mapData, data, key, htmlID) {

	var width = 1000;
	var height = 500,
	    scale0 = width/5;
	d3.select(htmlID).selectAll("svg").remove();
	/* draw svg and g elements */
	var svg = d3.select(htmlID)
			    .append("svg")
			    .attr("width", "100%")
			    .attr("height", height)
			    .style("stroke", 0.5)
			    
	
	var color = d3.scaleSequential(d3.interpolatePuBu);

	/* map projection */
	var projection = d3.geoMercator()
					.scale(scale0);

	var path = d3.geoPath()
	    		.projection(projection);

	var terrCount1 = _.countBy(data, key);

	terrCount = setRanking(data, terrCount1);

	var maxCount = Math.max.apply(null, Object.keys(terrCount).map(function(key) { return terrCount[key]; }));
	
	/* append to svg */
	svg.append("g")
	    .selectAll("path")
	    .data(mapData.features)
	    .enter().append("path")
		    .attr("fill", function(d) {
		        return (_.isNil(terrCount[d.properties.name])) ? "#fff" : color(terrCount[d.properties.name] / maxCount); })
		    .attr("d", path)
		    .attr("stroke", "#000")
			.attr("stroke-width", 0.5)
		    .attr("class", function(d) { return d.id })
		    .attr("transform", "translate(150,100)")
		    .on("mouseover", mouseOnState)
		    .on("mouseout", mouseOutState)
		    .on("click", clickOnState)
		    .append("title")
		    	.text(function(d) {
		        	return (_.isNil(terrCount[d.properties.name])) ? "" : d.properties.name + ": " + terrCount[d.properties.name];
		    	})
		    	
	var zoom = d3.zoom().scaleExtent([1,3])
    .on("zoom",function() {
        svg.selectAll("g").attr("transform","translate("+ d3.event.transform.x + ',' + d3.event.transform.y +")scale("+d3.event.transform.k+")");
        svg.selectAll("g").selectAll("path")  
            .attr("d", path.projection(projection)); 

  	})


	svg.call(zoom);

	function mouseOnState(){
		// console.log("clicked");
		d3.selectAll("path").classed("highlight", false);
		var currentState = d3.select(this);
		currentState.classed("highlight", true);
	}
	function mouseOutState(){
		// console.log("clicked");
		d3.selectAll("path").classed("highlight", false);
	}
	function clickOnState(){
		// console.log("clicked")
		var currentState = d3.select(this);
		GLOBAL_COUNTRY = currentState.datum().properties.name;
		console.log(GLOBAL_COUNTRY);
		drawLine("#line", "#legend");
	}
}

function createLineChart(data, linechartID, legendID){

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var years = generateYears(GLOBAL_YEAR);
	var types = getUniqTypeOfAttack(data);
	var historyOfType = getHistotyBySpecificType(data, years);

	var maxIncident = _.maxBy(historyOfType, function(d) { return d.max }).max;

	barXLine.range([0,barW])
	.domain(historyOfType.map(function(d){return d.year}))
    .paddingOuter([0.1]);

    barYLine.range([barH,0])
	.domain([0, maxIncident * 1.2]);

	barXAxis = d3.axisBottom(barXLine);
    barYAxis = d3.axisLeft(barYLine);

	// console.log(d3.select(divID).selectAll("svg").empty())

	if(d3.select(linechartID).selectAll("svg").empty()){
		var svg = d3.select(linechartID).append("svg")
			.attr("width", barW+barMargin.left+barMargin.right)
			.attr("height", barH+barMargin.top+barMargin.bottom)
			.append("g")
			.attr("class", "main")
			.attr("transform",
			      "translate(" + barMargin.left + "," + barMargin.top + ")")
	    svg.append("g")
			.attr("transform", "translate(0," + barH +")")
			.attr("class", "x axis")
			.call(barXAxis)
	    svg.append("g")
			.attr("class", "y axis")
			.call(barYAxis)
		svg.append("g")
			.attr("transform", "translate(-50," + (barH/2) + ") rotate(-90)")
			.append("text")
			.style("text-anchor", "middle")
			.text("Number of incidient")

	    svg.append("text")
			.attr("x", barW/2)
			.attr("y", barH + 60)
			.text("Year")
		svg.append("text")
			.attr("id", "nameofcountry")
			.attr("x", barW/2)
			.attr("y", barH + 60)
	}
	else{
		var svg = d3.select(linechartID).select("g")
	}
	svg.selectAll("path").remove().transition()
			  .duration(750);
	if(d3.selectAll(legendID).selectAll("svg").empty()){
		var legendsvg = d3.selectAll(legendID).append("svg")
			.attr("width", 200)
			.attr("height", 200);		
	}
	else var legendsvg = d3.selectAll(legendID).selectAll("svg")
	if (!legendsvg.selectAll("g").empty()) {	
		legendsvg.selectAll("g").remove(); 
	}
		var leg =legendsvg.append("g")
		                    .attr("class", "legend")
		                    .selectAll("g")
		                    .data(types)
		                    .enter().append("g")
		                        .attr("class", function(d) {return d; })
		                        .attr("transform", function(d, i) {return "translate(0," + (i * 10 * 2) + ")"; });

			leg.append("text")
		        .attr("font-size", 12)
		        .attr("x", 20)
		        .attr("y", 15)
		        .text(function(d) { return d; });
		    leg.append("circle")
		        .attr("cx", 10)
		        .attr("cy", 10)
		        .attr("r", 10)
		        .attr("fill", color);

	col = 0;
	_.each(types, function(s, i){
		var type = s;
		var line = d3.line()
        	.x(function(d) { return barXLine(d.year); })
        	.y(function(d) { 
        		if(d[type] !== undefined) return barYLine(d[type]); 
        		else return barYLine(0);
        	});
        svg.append("path")
			.datum(historyOfType)
			  .attr("fill", "transparent")
			  .attr("stroke", color(type))
			  .attr("d", line)

	})
		svg.select(".x.axis")
			.transition()
			.duration(750)
			.call(barXAxis)
		svg.select(".y.axis")
			.transition()
			.duration(750)
			.call(barYAxis)

}

function drawLine(chartID, legendID){
	var filterCountry = filterByCountry(GLOBAL_DATA, GLOBAL_COUNTRY);
	var filterType = filterByType(filterCountry, TYPE_OF_ATTACK);
	var history = getHistory(filterType);
	createLineChart(history, chartID, legendID);
}

//call from selection in html
function filterBy(){
	TYPE_OF_ATTACK = document.getElementById("typeOfAttack").value;
	console.log(TYPE_OF_ATTACK);
	var data = filderByYear(GLOBAL_DATA, GLOBAL_YEAR);
	var data1 = filterByType(data, TYPE_OF_ATTACK);
	drawMap(GLOBAL_MAP, data1, "country_txt", "#world");
	drawLine("#line", "#legend");
}

function createVis(errors, mapData, from2012to2015, from92to11, only93) {
	GLOBAL_MAP = mapData;
	GLOBAL_DATA = _.union(from92to11, from2012to2015, only93);

    if (errors) throw errors;
    //create slide bar
	var slider = document.getElementById('slider');
	noUiSlider.create(slider, {
		start: 2000,
		connect: [true, false],
		step: 1,
		range: {
			'min': 2000,
			'max': 2015
		}
	});
	var stepSliderValueElement = document.getElementById('year');

	slider.noUiSlider.on('update', function( values, handle ) {
		stepSliderValueElement.innerHTML = Number(values[handle]);
		GLOBAL_YEAR = Number(values[handle]).toString()
		var history = getHistory(GLOBAL_DATA);
		var dataByYear = filderByYear(GLOBAL_DATA, GLOBAL_YEAR );
		var dataByType = filterByType(dataByYear, TYPE_OF_ATTACK);
		drawMap(mapData, dataByType, "country_txt", "#world");
		drawLine("#line", "#legend");

	});

}

d3.queue().defer(d3.json, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/countries.geo.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/data-society-global-terrorism-data/gtd_12to15_52134.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/data-society-global-terrorism-data/gtd_92to11_no%2093_55072.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/1993.csv")
    .await(createVis);

