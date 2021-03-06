import * as d3 from 'd3'
import React from 'react'
class TradeFederationDonutChart extends React.Component {

    componentDidMount(props) {

        const width = this.props.width

        const theme = this.props.theme;

        const isDark = () => {
            if (this.props.theme === 'dark') {
                return true
            } else {
                return false
            }
        }

        var Donut3D={};
        
        function pieTop(d, rx, ry, ir ){
            if(d.endAngle - d.startAngle == 0 ) return "M 0 0";
            var sx = rx*Math.cos(d.startAngle),
                sy = ry*Math.sin(d.startAngle),
                ex = rx*Math.cos(d.endAngle),
                ey = ry*Math.sin(d.endAngle);
                
            var ret =[];
            ret.push("M",sx,sy,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",ex,ey,"L",ir*ex,ir*ey);
            ret.push("A",ir*rx,ir*ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0), "0",ir*sx,ir*sy,"z");
            return ret.join(" ");
        }

        function pieOuter(d, rx, ry, h ){
            var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
            var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);
            
            var sx = rx*Math.cos(startAngle),
                sy = ry*Math.sin(startAngle),
                ex = rx*Math.cos(endAngle),
                ey = ry*Math.sin(endAngle);
                
                var ret =[];
                ret.push("M",sx,h+sy,"A",rx,ry,"0 0 1",ex,h+ey,"L",ex,ey,"A",rx,ry,"0 0 0",sx,sy,"z");
                return ret.join(" ");
        }

        function pieInner(d, rx, ry, h, ir ){
            var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
            var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
            
            var sx = ir*rx*Math.cos(startAngle),
                sy = ir*ry*Math.sin(startAngle),
                ex = ir*rx*Math.cos(endAngle),
                ey = ir*ry*Math.sin(endAngle);

                var ret =[];
                ret.push("M",sx, sy,"A",ir*rx,ir*ry,"0 0 1",ex,ey, "L",ex,h+ey,"A",ir*rx, ir*ry,"0 0 0",sx,h+sy,"z");
                return ret.join(" ");
        }

        function numberWithCommas(x) {
            if (x) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return 0;
        }

        function getOmData(d){
            console.log(d)
            return (d.endAngle-d.startAngle > 0.2 ? 
                    numberWithCommas(d.value) + ' ' + d.data.label : '');
        }	
        
        Donut3D.transition = function(id, data, rx, ry, h, ir){
            function arcTweenInner(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return pieInner(i(t), rx+0.5, ry+0.5, h, ir);  };
            }
            function arcTweenTop(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return pieTop(i(t), rx, ry, ir);  };
            }
            function arcTweenOuter(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return pieOuter(i(t), rx-.5, ry-.5, h);  };
            }
            function textTweenX(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return 0.6*rx*Math.cos(0.5*(i(t).startAngle+i(t).endAngle));  };
            }
            function textTweenY(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return 0.6*rx*Math.sin(0.5*(i(t).startAngle+i(t).endAngle));  };
            }
            
            var _data = d3.pie().sort(null).value(function(d) {return d.value;})(data);
            
            d3.select("#"+id).selectAll(".innerSlice").data(_data)
                .transition().duration(750).attrTween("d", arcTweenInner); 
                
            d3.select("#"+id).selectAll(".topSlice").data(_data)
                .transition().duration(750).attrTween("d", arcTweenTop); 
                
            d3.select("#"+id).selectAll(".outerSlice").data(_data)
                .transition().duration(750).attrTween("d", arcTweenOuter); 	
                
            d3.select("#"+id).selectAll(".percent").data(_data).transition().duration(750)
                .attrTween("x",textTweenX).attrTween("y",textTweenY);

            d3.select("#"+id).selectAll(".percentLine").data(_data).transition().duration(750)
                .attrTween("x",textTweenX).attrTween("y",textTweenY);
        }
        
        Donut3D.draw=function(id, data, x /*center x*/, y/*center y*/, 
                rx/*radius x*/, ry/*radius y*/, h/*height*/, ir/*inner radius*/){
        
            var _data = d3.pie().sort(null).value(function(d) {return d.value;})(data);
            
            var slices = d3.select(id).append("g").attr("transform", "translate(" + x + "," + y + ")")
                .attr("class", "slices");
                
            slices.selectAll(".innerSlice").data(_data).enter().append("path").attr("class", "innerSlice")
                .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
                .attr("d",function(d){ return pieInner(d, rx+0.5,ry+0.5, h-10, ir);})
                .each(function(d){this._current=d;});
            
            slices.selectAll(".topSlice").data(_data).enter().append("path").attr("class", "topSlice")
                .style("fill", function(d) { return d.data.color; })
                .style("stroke", function(d) { return d.data.color; })
                .attr("d",function(d){ return pieTop(d, rx*0.993, ry*0.993, ir);})
                .each(function(d){this._current=d;})
            
            slices.selectAll(".outerSlice").data(_data).enter().append("path").attr("class", "outerSlice")
                .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
                .attr("d",function(d){ return pieOuter(d, rx-.5,ry-2, h-10);})
                .append("filter")
                .each(function(d){this._current=d;});

            slices.selectAll(".percent").data(_data).enter().append("text").attr("class", "percent")
                .attr("x",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle)) - width/6;})
                .attr("y",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle))) - width/3.5;})
                .text(getOmData).each(function(d){this._current=d;})
                .style("fill", isDark(theme) ? 'white' : 'black')
                .style("font-size", width/22);
                
            slices.selectAll(".percentLine").data(_data).enter().append('line')
                .attr("x1",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                .attr("y1",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle)));})
                .attr("x2",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                .attr("y2",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle))) - width / 4;})
                .style("stroke-width", 1)
                .style("stroke", isDark(theme) ? 'white' : 'black')
                .style("fill", "none")
                .each(function(d){this._current=d;})

            slices.selectAll(".percentLine").data(_data).enter().append("circle")
                .attr("cx",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                .attr("cy",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle))) - width / 4;})
                .attr('r', 6)
                .style("fill", function(d) { return d3.hsl(d.data.color).darker(0.2); })
                .each(function(d){this._current=d;})

            slices.selectAll(".percentLine").data(_data).enter().append("circle")
                .attr("cx",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                .attr("cy",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle)));})
                .attr('r', 7)
                .attr('fill', isDark(theme) ? 'white' : 'black')
                .each(function(d){this._current=d;})

            slices.selectAll(".percentLine").data(_data).enter().append("circle")
                .attr("cx",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                .attr("cy",function(d){ return (0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle)));})
                .attr('r', 10)
                .attr('fill', 'transparent')
                .attr('stroke', isDark(theme) ? 'white' : 'black')
                .each(function(d){this._current=d;})
                
        }	
        
        const id = 'donut-chart-' + this.props.id
        d3.select(`${"#" + id}`).remove();
        var svg = d3.select("#" + this.props.id).append("svg").style("min-width", width/1.22).attr("height", width/1.3).attr("id", id);
        var g = svg.append("g").attr("id",id);
        let y = document.querySelector('#' + id).getBoundingClientRect().top;
        let x = document.querySelector('#' + id).getBoundingClientRect().left;
        Donut3D.draw('#' + id, this.props.data, width/2.6, width/2.2, width/3, width/6, width/14, 0.4);
    }

    render() {
        return <div style={{width:`${this.props.width/2}px`,height:`${this.props.width/1.3}px`}} id={this.props.id} class="donuts"></div>;
    }
}
export default TradeFederationDonutChart;