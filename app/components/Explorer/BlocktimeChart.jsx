import React from "react";
import ReactHighchart from "react-highcharts";
import {takeRight} from "lodash-es";
import counterpart from "counterpart";

class BlocktimeChart extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.blockTimes.length < 19) {
            return false;
        } else if (this.props.blockTimes.length === 0) {
            return true;
        }

        let chart = this.refs.chart ? this.refs.chart.chart : null;
        if (chart) {
            let {blockTimes, colors} = this._getData(nextProps);
            let series = chart.series[0];
            let finalValue = series.xData[series.xData.length - 1];

            if (series.xData.length) {
                blockTimes.forEach(point => {
                    if (point[0] > finalValue) {
                        series.addPoint(
                            point,
                            false,
                            series.xData.length >= 30
                        );
                    }
                });

                chart.options.plotOptions.column.colors = colors;

                chart.redraw();
                return false;
            }
        }

        return (
            nextProps.blockTimes[nextProps.blockTimes.length - 1][0] !==
                this.props.blockTimes[this.props.blockTimes.length - 1][0] ||
            nextProps.blockTimes.length !== this.props.blockTimes.length
        );
    }

    _getData() {
        let {blockTimes, head_block} = this.props;

        blockTimes.filter(a => {
            return a[0] >= head_block - 30;
        });

        if (blockTimes && blockTimes.length) {
            blockTimes = takeRight(blockTimes, 30);
        }

        let colors = blockTimes.map(entry => {
            if (entry[1] <= 5) {
                return "#DEC27F";
            } else if (entry[1] <= 10) {
                return "#03d99d";
            } else if (entry[1] <= 20) {
                return "#FF9D33";
            } else {
                return "#deb869";
            }
        });

        return {
            blockTimes,
            colors
        };
    }

    render() {
        let {blockTimes, colors} = this._getData(this.props);

        let tooltipLabel = counterpart.translate("explorer.blocks.block_time");

        let config = {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                spacing: [0, 0, 5, 0],
                height: 70
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            tooltip: {
                shared: false,
                formatter: function() {
                    return tooltipLabel + ": " + this.y + "s";
                }
            },
            series: [
                {
                    name: "Block time",
                    data: blockTimes,
                    color: "#f2cb96"
                }
            ],
            xAxis: {
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                lineColor: "#474747"
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                gridLineWidth: 0,
                currentPriceIndicator: {
                    enabled: false
                }
            },
            plotOptions: {
                column: {
                    animation: true,
                    minPointLength: 3,
                    colorByPoint: true,
                    colors: colors,
                    borderWidth: 0,
                    borderRadius: 4
                }
            }
        };

        return blockTimes.length ? (
            <ReactHighchart ref="chart" config={config} />
        ) : null;
    }
}

export default BlocktimeChart;
