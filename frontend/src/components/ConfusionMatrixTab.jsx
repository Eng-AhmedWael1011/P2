import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * ConfusionMatrixTab — D3 heatmap visualization of the confusion matrix.
 */
export default function ConfusionMatrixTab({ metrics }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!metrics?.confusion_matrix || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const cm = metrics.confusion_matrix;
    const labels = ["\u226450K", ">50K"];
    const margin = { top: 50, right: 30, bottom: 70, left: 80 };
    const size = 300;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${size + margin.left + margin.right} ${size + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand().domain(labels).range([0, size]).padding(0.08);
    const y = d3.scaleBand().domain(labels).range([0, size]).padding(0.08);

    const maxVal = Math.max(...cm.flat());
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolateRgbBasis(["#1e1b4b", "#4338ca", "#818cf8", "#06b6d4"]));

    // Cells
    const cellData = [];
    cm.forEach((row, i) => {
      row.forEach((val, j) => {
        cellData.push({ actual: labels[i], predicted: labels[j], value: val });
      });
    });

    svg
      .selectAll("rect")
      .data(cellData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.predicted))
      .attr("y", (d) => y(d.actual))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("rx", 8)
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 1)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .delay((_d, i) => i * 150)
      .style("opacity", 1);

    // Cell values
    svg
      .selectAll("text.cell")
      .data(cellData)
      .enter()
      .append("text")
      .attr("class", "cell")
      .attr("x", (d) => x(d.predicted) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.actual) + y.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .attr("font-size", "22px")
      .attr("font-weight", "700")
      .text((d) => d.value.toLocaleString())
      .style("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .style("opacity", 1);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${size + 5})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "14px")
      .attr("font-weight", "500");

    svg
      .append("text")
      .attr("x", size / 2)
      .attr("y", size + 50)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "13px")
      .text("Predicted");

    // Y axis
    svg
      .append("g")
      .attr("transform", "translate(-5, 0)")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "14px")
      .attr("font-weight", "500");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -size / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "13px")
      .text("Actual");

    svg.selectAll(".domain").remove();

    return () => d3.select(container).selectAll("*").remove();
  }, [metrics]);

  if (!metrics?.confusion_matrix) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="glass-card p-4">
          <h5 className="card-title text-center mb-3">Confusion Matrix</h5>
          <div ref={chartRef} className="d-flex justify-content-center"></div>
        </div>
      </div>
    </div>
  );
}
