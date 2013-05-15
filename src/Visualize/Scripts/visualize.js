Visualizer = function (options) {
    var settings = {
        getAllMethod: '',
        getDetailsMethod: '',
        width: 500,
        height: 500,
        target: '',
        detailsCallback: function () { }
    };

    var self = this;
    $.extend(self, settings, options);
};

Visualizer.prototype = {
    getProducts: function () {
        var self = this;
        var data;
        $.ajax({
            type: 'GET',
            url: self.getAllMethod,
            dataType: 'json',
            success: function (d) { data = d; },
            data: {},
            async: false
        });
        return data;
    },
    getDetails: function (id) {
        var self = this;
        var data;
        $.ajax({
            type: 'GET',
            url: self.getDetailsMethod + id,
            dataType: 'json',
            success: function (d) { data = d; },
            data: {},
            async: false
        });

        return data;
    },
    Clear: function () {
        $(this.target).empty();
    },
    VisualizeProducts: function (type) {
        var self = this;
        if (type === 'circle') {
            self.VisualizePackCircle();
        }
        else {
            self.VisualizeTreeMap();
        }
    },
    VisualizePackCircle: function () {
        var self = this;
        var jsondata = self.getProducts();
        var w = self.width;
        var h = self.height;
        var placement = self.target;

        var r = 700,
            x = d3.scale.linear().range([0, r]),
            y = d3.scale.linear().range([0, r]),
            node,
            root;

        var pack = d3.layout.pack()
                .size([r, r])
                .padding(5)
                .value(function (d) { return d.size; });

        var svg = d3.select(placement).insert("svg:svg", "h2")
                .attr("xlink", "http://www.w3.org/1999/xlink")
                .attr("width", w)
                .attr("height", h)
              .append("svg:g")
                .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

        node = root = jsondata;
        var nodes = pack.nodes(root);

        svg.selectAll("circle")
              .data(nodes)
            .enter()
            .append("svg:circle")
              .attr("class", function (d) { return d.children ? "parent" : "child"; })
              .attr("cx", function (d) { return d.x; })
              .attr("cy", function (d) { return d.y; })
              .attr("r", function (d) { return d.r; })
              .attr("id", function (d) { return "circle-" + d.ID; });

        svg.selectAll("circle.child")
			    .on("click", function (d) {

			        if ($.isFunction(self.detailsCallback)) {
			            self.detailsCallback(d.ID);
			        }
			    })
                .on("mouseover", function (d) { return showText(d, 1); })
                .on("mouseout", function (d) { return showText(d, 0); });

        svg.selectAll("circle.parent")
		    .on("click", function (d) { return zoom(node == d ? root : d); });

        svg.selectAll("text")
              .data(nodes)
            .enter()
            .append("svg:text")
              .attr("class", function (d) { return d.children ? "parent" : "child"; })
              .attr("x", function (d) { return d.x; })
              .attr("y", function (d) { return d.children ? (d.y - 10) : d.y + 10; })
              .attr("dy", ".35em")
              .attr("id", function (d) { return "text-" + d.ID; })
              .attr("text-anchor", "middle")
              .style("opacity", function (d) { return d.children ? 1 : 0; })
              .text(function (d) { return d.children ? (d.ID > 0 ? d.ID + " - " + d.name : d.name) : (d.ID > 0 ? d.ID : d.name); });

        function showText(d, opacity) {
            if (opacity == 1) {
                svg.select("#text-" + d.ID)
				    .text(function (d) { return (d.ID > 0 ? d.ID + " - " + d.name : d.name); })
				    .classed("hovered", true)
				    .style("opacity", opacity);
            } else {
                svg.select("#text-" + d.ID)
				    .text(function (d) { return (d.ID > 0 ? d.ID : d.name); })
				    .classed("hovered", false)
				    .style("opacity", k > 1 ? 1 : 0);
            }
        }

        var k = 1;
        function zoom(d, i) {
            k = r / d.r / 2;
            x.domain([d.x - d.r, d.x + d.r]);
            y.domain([d.y - d.r, d.y + d.r]);

            var t = svg.transition()
			      .duration(d3.event.altKey ? 7500 : 750);

            t.selectAll("circle")
			      .attr("cx", function (d) { return x(d.x); })
			      .attr("cy", function (d) { return y(d.y); })
			      .attr("r", function (d) { return k * d.r; });

            t.selectAll("text")
			      .attr("x", function (d) { return x(d.x); })
			      .attr("y", function (d) { return y(d.children ? (d.y - 30) : d.y); });

            if (k == 1) {
                t.selectAll("text.child")
				    .style("opacity", 0);
            }
            else {
                t.selectAll("text.child")
				    .style("opacity", 1);
            }

            node = d;
            d3.event.stopPropagation();
        }
    },
    VisualizeTreeMap: function () {
        var self = this;
        var jsondata = self.getProducts();
        var w = self.width;
        var h = self.height;
        var placement = self.target;

        var x = d3.scale.linear().range([0, w]),
		    y = d3.scale.linear().range([0, h]),
		    color = d3.scale.category20c(),
		    root,
		    node;

        var treemap = d3.layout.treemap()
		    .round(true)
		    .size([w, h])
		    .sticky(true)
		    .padding([20, 0, 0, 0])
		    .value(function (d) { return d.size; });

        var svg = d3.select(placement).append("div")
		    .attr("class", "chart")
		    .style("width", w + "px")
		    .style("height", h + "px")
	      .append("svg:svg")
		    .attr("width", w)
		    .attr("height", h)
	      .append("svg:g")
		    .attr("transform", "translate(.5,.5)");

        node = root = jsondata;

        var nodes = treemap.nodes(root)
		    .filter(function (d) { return !d.children; });

        var parents = treemap.nodes(root)
		    .filter(function (d) { return d.children; });

        var cell = svg.selectAll("g")
		      .data(nodes)
		    .enter().append("svg:g")
		      .attr("class", "cell")
		      .attr("id", function (d) { return "cell-" + d.ID; })
		      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
		      .on("click", function (d) {
		          if ($.isFunction(self.detailsCallback)) {
		              self.detailsCallback(d.ID);
		          }
		      })
			    .on("mouseover", function (d) { return showText(d, true); })
			    .on("mouseout", function (d) { return showText(d, false); });

        cell.append("svg:rect")
		      .attr("width", function (d) { return d.dx - 1; })
		      .attr("height", function (d) { return d.dy - 1; })
		      .style("fill", function (d) { return color(d.parent.name); });

        svg.selectAll("text")
		      .data(nodes)
		    .enter()
		    .append("svg:text")
		      .attr("x", function (d) { return d.x + 10; })
		      .attr("y", function (d) { return d.y + 20; })
		      .attr("dy", ".35em")
		      .attr("text-anchor", "left")
		      .attr("id", function (d) { return "text-" + d.ID; })
		      .text(function (d) { return d.ID > 0 ? d.ID : d.name; });

        var parentCell = svg.selectAll("g.parentCell")
		    .data(parents)
		    .enter()
		    .append("svg:g")
		    .attr("class", "parentCell")
		    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });


        parentCell.append("svg:rect")
		    .attr("width", function (d) { return d.dx - 1; })
		    .attr("height", function (d) { return 20; })
		    .style("fill", "#1F77B4")
		    .style("fill-opacity", 0.1);

        parentCell.append("text")
		    .attr("x", function (d) { return 20; })
		    .attr("y", function (d) { return 15; })
		    .attr("fill", "steelblue")
	      .text(function (d) { return d.ID > 0 ? d.ID + " - " + d.name : d.name; });

        function showText(d, show) {
            if (show)
                svg.select("#text-" + d.ID)
				    .text(function (d) { return d.ID > 0 ? d.ID + " - " + d.name : d.name; })
				    .classed("hovered", show)
				    .attr("y", function (d) { return d.y + 40; });
            else
                svg.select("#text-" + d.ID)
				    .text(function (d) { return d.ID > 0 ? d.ID : d.name; })
				    .classed("hovered", show)
				    .attr("y", function (d) { return d.y + 20; });
        }
    },
    VisualizeForceGraph: function (staticLayout, id) {
        var self = this;
        var jsondata = self.getDetails(id);
        var w = self.width;
        var h = self.height;
        var placement = self.target;

        var force = d3.layout.force()
		    .nodes(jsondata.TreePages)
		    .links(jsondata.TreeNavigations)
		    .size([w, h])
		    .linkDistance(staticLayout == 'true' ? 100 : 150)
		    .charge(-300)
		    .on("tick", tick);


        var svg = d3.select(placement).append("svg:svg")
		    .attr("width", w)
		    .attr("height", h)
		    .append("svg:g");


        // Per-type markers, as they don't inherit styles.
        svg.append("svg:defs").selectAll("marker")
		    .data(["suit", "resolved"])
	      .enter().append("svg:marker")
		    .attr("id", String)
		    .attr("viewBox", "0 -5 10 10")
		    .attr("refX", 19)
		    .attr("refY", 0)
		    .attr("markerWidth", 6)
		    .attr("markerHeight", 6)
		    .attr("orient", "auto")
	      .append("svg:path")
		    .attr("d", "M0,-5L10,0L0,5");

        var path = svg.selectAll("path")
		    .data(force.links())
	      .enter().append("svg:path")
		    .attr("class", function (d) { return "looppath link " + d.type + " " + d.style + " source-" + d.source + " target-" + d.target; })
		    .attr("source", function (d) { return d.source; })
		    .attr("target", function (d) { return d.target; })
		    .attr("marker-end", function (d) { return "url(#" + d.type + ")"; })
		    .on("mouseover", linkMouseover)
		    .on("mouseout", linkMouseout);

        var circle = svg.selectAll("circle")
		    .data(force.nodes())
	      .enter().append("svg:circle")
		    .attr("class", "loopcircle")
		    .attr("r", 12)
		    .attr("id", function (d) { return "node-" + force.nodes().indexOf(d); })
		    .on("mouseover", mouseover)
		    .on("mouseout", mouseout)
		    .call(force.drag);

        var text = svg.selectAll("g")
		    .data(force.nodes())
	      .enter().append("svg:g");

        // A copy of the text with a thick white stroke for legibility.
        text.append("svg:text")
		    .attr("x", 15)
		    .attr("y", ".31em")
		    .attr("class", "shadow")
		    .attr("textid", function (d) { return force.nodes().indexOf(d); })
		    .text(function (d) { return d.PageName; });

        text.append("svg:text")
		    .attr("x", 15)
		    .attr("y", ".31em")
		    .attr("textid", function (d) { return force.nodes().indexOf(d); })
		    .text(function (d) { return d.PageName; });

        svg.select("circle").attr("class", "loopcircle first");

        // Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
            circle
		    .attr("transform", function (d) {
		        return "translate(" + d.x + "," + d.y + ")";
		    });

            text
		    .attr("transform", function (d) {
		        return "translate(" + d.x + "," + d.y + ")";
		    });

            path.attr("d", function (d) {
                var tx = d.target.x,
				    sx = d.source.x,
				    ty = d.target.y,
				    sy = d.source.y,
				    dx = tx - sx,
				    dy = ty - sy,
				    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
            });

        }

        var tooltip = d3.select("body")
		    .append("div")
		    .attr("class", "tooltip")
		    .style("opacity", 0);


        force.start();

        if (staticLayout == 'true') {
            var n = force.nodes().length;
            for (var i = n * 2000; i > 0; --i) force.tick();

            force.stop();

            force.nodes().forEach(function (d) {
                d.fixed = true;
            });

            force.nodes()[0].x = 300;
            force.nodes()[0].y = 300;
            force.nodes()[0].px = 300;
            force.nodes()[0].py = 300;

            tick();
        }


        function linkMouseover(d) {
            updateClassesLink(d, true);
        }

        function linkMouseout(d) {
            updateClassesLink(d, false);
        }

        function mouseover(d) {
            updateClasses(d, true);
        }

        function mouseout(d) {
            updateClasses(d, false);
        }

        function updateClassesLink(d, value) {
            if (d.DisplayCondition && value) {
                tooltip.transition()
				    .duration(200)
				    .style("opacity", .9);

                var negate = d.DisplayCondition.NegateDisplayCondition ? "<span style='color: red; font-weight: bold'>!</span> " : "";
                tooltip.html(negate + d.DisplayCondition.DisplayConditionID + " - " + d.DisplayCondition.DisplayConditionName)
				    .style("left", (d3.event.pageX) + "px")
				    .style("top", (d3.event.pageY - 28) + "px");
            }
            else {
                tooltip.transition()
				    .duration(500)
				    .style("opacity", 0);
            }
        }

        var sourceIDs = [];
        var targetIDs = [];
        function getSourceId(node) {
            if (node.length > 0)
                sourceIDs.push(node[0].getAttribute("source"));
        };

        function getTargetId(node) {
            if (node.length > 0)
                targetIDs.push(node[0].getAttribute("target"));
        };

        function setOpacity(node) {
            if (node.length > 0) {
                var found = $.inArray(node[0].__data__.index.toString(), sourceIDs) > -1;
                var found2 = $.inArray(node[0].__data__.index.toString(), targetIDs) > -1;
                if (found || found2)
                    node[0].style["opacity"] = 1;
                else
                    node[0].style["opacity"] = 0.2;

            }
        };

        function setTextOpacity(node) {
            if (node.length > 0) {
                var found = $.inArray(node[0].getAttribute("textid"), sourceIDs) > -1;
                var found2 = $.inArray(node[0].getAttribute("textid"), targetIDs) > -1;
                if (found || found2)
                    node[0].style["opacity"] = 1;
                else
                    node[0].style["opacity"] = 0;

            }
        };

        function updateClasses(d, value) {
            //handle classes 
            var id = force.nodes().indexOf(d);

            svg.selectAll("path.link.source-" + id)
			      .classed("source", value);

            svg.selectAll("path.link.target-" + id)
			      .classed("target", value);

            if (svg.selectAll("path.link.source-" + id) == 0 && svg.selectAll("path.link.target-" + id) == 0)
                d3.select("#node-" + id).classed("alone", value);
            else
                d3.select("#node-" + id).classed("hovered", value);

            //handle hidding and unhiding
            if (value) {
                sourceIDs = [];
                targetIDs = [];

                $("path.link.target-" + id).each(function () { return getSourceId($(this)); });
                $("path.link.source-" + id).each(function () { return getTargetId($(this)); });

                sourceIDs.push(id.toString());

                $("circle.loopcircle").each(function () { return setOpacity($(this)); });

                $("path.looppath").each(function () { return $(this)[0].style["opacity"] = 0.05; });
                $("path.source").each(function () { return $(this)[0].style["opacity"] = 1; });
                $("path.target").each(function () { return $(this)[0].style["opacity"] = 1; });

                $("text").each(function () { return setTextOpacity($(this)); });

            } else {
                $("circle.loopcircle").each(function () { return $(this)[0].style["opacity"] = 1; });
                $("path").each(function () { return $(this)[0].style["opacity"] = 1; });
                $("text").each(function () { return $(this)[0].style["opacity"] = 1; });
            }
        }
    }
};

