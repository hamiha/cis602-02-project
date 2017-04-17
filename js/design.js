var drawMap = function(mapData, data, key, htmlID) {

	var width = 1000,
	    height = 500,
	    scale0 = (width - 1) / 2 / Math.PI;

	// zoom
	
	/* draw svg and g elements */
	var svg = d3.select(htmlID)
			    .append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .append("g");

	var g = svg.append("g");
	
	var color = d3.scaleSequential(d3.interpolatePuBu);

	/* map projection */
	var projection = d3.geoMercator()
					.scale(scale0);

	var path = d3.geoPath()
	    		.projection(projection);

	var playersCount = _.countBy(data, key);
	// var country = _.countBy(mapData.properties, "name");
	console.log(playersCount);
	var countries = mapData.features.map(function(d) {
		return d.properties.name;
	});

	// var sam = _.map(countries, function(value, key) { return { key: key, value: value }; })
	// console.log(sam);

	var maxCount = Math.max.apply(null, Object.keys(playersCount).map(function(key) { return playersCount[key]; }));

	svg.append("defs").append("path")
				    .datum({type: "Sphere"})
				    .attr("id", "sphere")
				    .attr("d", path);

	svg.append("use")
	    .attr("class", "bound")
	    .attr("xlink:href", "#sphere");

	/* append to svg */
	g
	    .selectAll("path")
	    .data(mapData.features)
	    .enter().append("path")
		    .attr("fill", function(d) {
		        return (_.isNil(playersCount[d.properties.name])) ? "#fff" : color(playersCount[d.properties.name] / maxCount); })
		    .attr("d", path)
		    .attr("stroke", "#000")
			.attr("stroke-width", 0.5)
		    .attr("class", function(d) { return d.id })
		    .append("title")
		    	.text(function(d) {
		        	return (_.isNil(playersCount[d.properties.name])) ? "" : d.properties.name + ": " + playersCount[d.properties.name];
		    	})
		    .on('mouseover', function(d, i) {
		    	console.log("hover");
                var currentState = this;
                d3.select(this).style('fill-opacity', 1);

                })

	var zoom = d3.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ d3.event.transform.x + ',' + d3.event.transform.y +")scale("+d3.event.transform.k+")");
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 

  	});

	svg.call(zoom);
}



function createVis(errors, mapData, womensData, mensData, teammateData) {

    if (errors) throw errors;

    /* Part 1 */
    drawMap(mapData, teammateData, "country_txt", "#world");

    /* Part 2 */
    // drawMap(mapData, mensData, "Nationality", "#map-men");

    /* Part 3 */
    // forceSimulation(teammateData, mensData, "#teammates");

    /* Extra credit */
    // barChart(mensData);

}

d3.queue().defer(d3.json, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/countries.geo.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/fifa-17-women.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/guardian-16-men.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/1993.csv")
    .await(createVis);

