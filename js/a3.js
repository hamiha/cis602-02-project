var drawMap = function(mapData, data, key, htmlID) {

	var width = 1000,
	    height = 500,
	    scale = 175;

	/* draw svg and g elements */
	var svg = d3.select(htmlID)
			    .append("svg")
			    .attr("width", width)
			    .attr("height", height);

	var color = d3.scaleSequential(d3.interpolateReds);

	/* map projection */
	var projection = d3.geoNaturalEarth()
					.scale(scale);

	var path = d3.geoPath()
	    		.projection(projection);

	var playersCount = _.countBy(data, key);
	// var country = _.countBy(mapData.properties, "name");
	console.log(playersCount);
	var countries = mapData.features.map(function(d) {
		return d.properties.name;
	});

	var sam = _.map(countries, function(value, key) { return { key: key, value: value }; })
	console.log(sam);

	var maxCount = Math.max.apply(null, Object.keys(playersCount).map(function(key) { return playersCount[key]; }));

	svg.append("defs").append("path")
				    .datum({type: "Sphere"})
				    .attr("id", "sphere")
				    .attr("d", path);

	svg.append("use")
	    .attr("class", "bound")
	    .attr("xlink:href", "#sphere");

	/* append to svg */
	svg.append("g")
	    .selectAll("path")
	    .data(mapData.features)
	    .enter().append("path")
		    .attr("fill", function(d) {
		    	console.log(d.properties.name);
		    	//var getCountry = _.filter(countries, d.properties.name);
		    	//var incl = _.includes(countries, d.properties.name);
		    	// console.log(getCountry);
		        return (_.isNil(playersCount[d.properties.name])) ? "#fff" : color(playersCount[d.properties.name] / maxCount); })
		    .attr("d", path)
		    .attr("stroke", "#000")
			.attr("stroke-width", 0.5)
		    .attr("class", function(d) { return d.id })
		    .append("title")
		    	.text(function(d) {
		        	return (_.isNil(playersCount[d.properties.name])) ? "" : d.properties.name + ": " + playersCount[d.properties.name];
		    	});
}


function createVis(errors, mapData, womensData, mensData, teammateData) {

    if (errors) throw errors;

    /* Part 1 */
    drawMap(mapData, teammateData, "country_txt", "#map-women");

    /* Part 2 */
    // drawMap(mapData, mensData, "Nationality", "#map-men");

    /* Part 3 */
    // forceSimulation(teammateData, mensData, "#teammates");

    /* Extra credit */
    // barChart(mensData);

}

d3.queue().defer(d3.json, "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/fifa-17-women.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/guardian-16-men.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/Data/1993.csv")
    .await(createVis);

