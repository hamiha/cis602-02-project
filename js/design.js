var NUMBER_OF_COUNTRIES = 180;
var TYPE_OF_ATTACK = "None", GLOBAL_YEAR, GLOBAL_DATA, GLOBAL_MAP;

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
	
	rank = [0];
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

var drawMap = function(mapData, data, key, htmlID) {

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
		console.log("clicked")
		var currentState = d3.select(this);
		console.log(currentState.datum().properties.name);
		// d3.selectAll("path").classed("highlight", false);
	}

}

function filter(){
	TYPE_OF_ATTACK = document.getElementById("typeOfAttack").value;
	console.log(TYPE_OF_ATTACK);
	data = filderByYear(GLOBAL_DATA, GLOBAL_YEAR);
	data1 = filterByType(data, TYPE_OF_ATTACK);
	// console.log(data1)
	drawMap(GLOBAL_MAP, data1, "country_txt", "#world");
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
		var dataByYear = filderByYear(GLOBAL_DATA, GLOBAL_YEAR );
		var dataByType = filterByType(dataByYear, TYPE_OF_ATTACK);
		drawMap(mapData, dataByType, "country_txt", "#world");
	});
    /* Part 1 */
    // drawMap(mapData, womensData, "country_txt", "#world");

}

d3.queue().defer(d3.json, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/countries.geo.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/data-society-global-terrorism-data/gtd_12to15_52134.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/data-society-global-terrorism-data/gtd_92to11_no%2093_55072.csv")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/1993.csv")
    .await(createVis);

