import React from "react";
import Translate from "react-translate-component";
import ReactHighchart from "react-highcharts";
import counterpart from "counterpart";
// import {FormattedDate} from "react-intl";
// import NewIcon from "../../NewIcon/NewIcon";
import {FormattedNumber} from "react-intl";
import tr from "assets/svg-images/svg-common/main-page/slider/tr.svg";

class GCWDstats extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {currentSupply, totalIncome, income24h, graphData} = this.props;

        // let containerWidth = window.innerWidth;

        let data = graphData;

        let colors = ["#DEC27F"];

        let tooltipLabel = counterpart.translate(
            "main_page.gcwd_stats.24h_chart_legend"
        );
        let chartHeight = 160;

        let config = {
            chart: {
                type: "areaspline",
                backgroundColor: "transparent",
                spacing: [2, 0, 5, 0],
                height: chartHeight
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
                    return tooltipLabel + ": " + this.y;
                }
            },
            series: [
                {
                    name: "Date:",
                    data: data,
                    color: "#DEC27F"
                }
            ],
            xAxis: {
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                gridLineWidth: 1,
                gridLineColor: "#2E2E2E",
                gridZIndex: 1,
                tickPositioner: function() {
                    var positions = [],
                        tick = Math.floor(this.dataMin),
                        increment = Math.ceil(
                            (this.dataMax - this.dataMin) / 10
                        );

                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (
                            tick;
                            tick - increment <= this.dataMax;
                            tick += increment
                        ) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                currentPriceIndicator: {
                    enabled: false
                },
                gridLineWidth: 0
            },
            plotOptions: {
                areaspline: {
                    animation: false,
                    minPointLength: 5,
                    colorByPoint: false,
                    colors: colors,
                    borderWidth: 0,
                    marker: {
                        enabled: false
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, "#DEC27F"],
                            [1, "transparent"]
                        ]
                    },
                    alignTicks: true
                }
            }
        };

        // let historyDate = data[0];
        // let todayValue = data.slice(-1)[0];
        // let dailyPercent = (income24h / totalIncome) * 100;
        return (
            <section className="gcwd-stats__width-layout">
                <div className="gcwd-stats-wrapper">
                    <Translate
                        className="title wow animate__animated animate__fadeIn"
                        content="main_page.gcwd_stats.title"
                        component="h2"
                        data-wow-duration="2s"
                        data-wow-delay="0.2s"
                    />

                    <Translate
                        className="description wow animate__animated animate__fadeIn"
                        content="main_page.gcwd_stats.description"
                        data-wow-duration="2s"
                        data-wow-delay="0.4s"
                    />

                    <div className="gcwd-stats__content">
                        <div className="gcwd-data-inner">
                            {/*<div className="gcwd-stats__increase-data">*/}
                            {/*    <NewIcon*/}
                            {/*        iconClass={*/}
                            {/*            "gcwd-stats__trade-arrow"*/}
                            {/*        }*/}
                            {/*        iconWidth={8}*/}
                            {/*        iconHeight={8}*/}
                            {/*        iconName={"up_down_arrow"}*/}
                            {/*    />*/}

                            {/*    <span>*/}
                            {/*        <FormattedNumber*/}
                            {/*            unitDisplay="long"*/}
                            {/*            value={dailyPercent}*/}
                            {/*        />*/}
                            {/*        %*/}
                            {/*    </span>*/}
                            {/*</div>*/}

                            <div className="item wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.2s">
                                <Translate
                                    className="gcwd-stats__legend"
                                    content="main_page.gcwd_stats.current_supply"
                                />
                                <span className="gcwd-stats__amount">
                                    <FormattedNumber
                                        unitDisplay="long"
                                        value={currentSupply}
                                    />
                                    <span className="gcwd-stats__asset">GCWD</span>
                                    <img src={tr} alt="tr" />
                                </span>
                            </div>

                            <div className="item wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.4s">
                                <Translate
                                    className="gcwd-stats__legend"
                                    content="main_page.gcwd_stats.total_income"
                                />
                                <span className="gcwd-stats__amount">
                                    <FormattedNumber
                                        unitDisplay="long"
                                        value={totalIncome}
                                    />
                                    <span className="gcwd-stats__asset">
                                                CWD
                                    </span>
                                    <img src={tr} alt="tr" />
                                </span>
                            </div>
                            <div className="item wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="0.6s">
                                <Translate
                                    className="gcwd-stats__legend"
                                    content="main_page.gcwd_stats.24h_income"
                                />
                                <span className="gcwd-stats__amount">
                                    <FormattedNumber
                                        unitDisplay="long"
                                        value={income24h}
                                    />
                                    <span className="gcwd-stats__asset">
                                        CWD
                                    </span>
                                    <img src={tr} alt="tr" />
                                </span>
                            </div>
                        </div>

                        <div className="gcwd-stats__chart-wrap">
                            <ReactHighchart ref="chart" config={config} />
                            {/*<div className="mp-reg-stat__label-wrap">*/}
                            {/*    <span className="mp-reg-stat__subtitle">*/}
                            {/*        <FormattedDate*/}
                            {/*            value={historyDate[0]}*/}
                            {/*            month="long"*/}
                            {/*            day="numeric"*/}
                            {/*        />*/}
                            {/*    </span>*/}

                            {/*    <Translate*/}
                            {/*        className="mp-reg-stat__subtitle"*/}
                            {/*        content="main_page.header.acc_chart_today"*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default GCWDstats;
