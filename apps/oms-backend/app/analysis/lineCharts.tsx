"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartProps {
  xaxis: string[];
  activateList: number[];
  usageList: number[];
}

const LineChart: React.FC<LineChartProps> = ({
  xaxis,
  activateList,
  usageList,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      title: {
        text: "激活和使用权益数",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["激活权益数", "使用权益数"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xaxis,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "激活权益数",
          type: "line",
          data: activateList,
          smooth: true,
          stack: "Total",
        },
        {
          name: "使用权益数",
          type: "line",
          data: usageList,
          smooth: true,
          stack: "Total",
        },
      ],
    };

    chartInstanceRef.current.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chartInstanceRef.current?.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, [xaxis, activateList, usageList]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default LineChart;
