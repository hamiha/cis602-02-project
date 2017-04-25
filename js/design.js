var drawMap = function(mapData, data, key, htmlID) {

	var width = 1000;
	var height = 500,
	    scale0 = width/5;

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

	var terrCount = _.countBy(data, key);
	
	// console.log(terrCount);
	// var countries = mapData.features.map(function(d) {
	// 	return d.properties.name;
	// });

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
		var currentState = d3.select(this);
		console.log(currentState.datum().properties.name);
		// d3.selectAll("path").classed("highlight", false);
	}
}



function createVis(errors, mapData, womensData, mensData, teammateData) {

    if (errors) throw errors;

    /* Part 1 */
    drawMap(mapData, teammateData, "country_txt", "#world");

}

d3.queue().defer(d3.json, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/countries.geo.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/fifa-17-women.json")
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e4fa063e3f3415f3d3c79456bc4b6dc5/raw/a9e01691802c8e70d94ce33a59e98529cc4324af/guardian-16-men.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/hamiha/cis602-02-project/master/data/1993.csv")
    .await(createVis);

