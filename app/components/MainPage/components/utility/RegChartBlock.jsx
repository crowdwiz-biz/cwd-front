import React from "react";
import Translate from "react-translate-component";
import ReactHighchart from "react-highcharts";
import counterpart from "counterpart";
// import {FormattedDate} from "react-intl";
import {FormattedNumber} from "react-intl";
import line from "assets/svg-images/svg-common/main-page/header/line.svg";

class RegChartBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {accountTotal, accountgraphData} = this.props;
        let data = accountgraphData;

        let colors = data.map(entry => {
            if (entry[1] <= 5) {
                return "#e1c697";
            } else if (entry[1] <= 10) {
                return "#A0D3E8";
            } else {
                return "#626262";
            }
        });

        let tooltipLabel = counterpart.translate(
            "main_page.header.new_accs_chart"
        );
        let config = {
            chart: {
                type: "column",
                backgroundColor: "transparent",
                spacing: [2, 0, 5, 0],
                height: 88
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
                    name: "New accs",
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
                gridLineWidth: 0,
                currentPriceIndicator: {
                    enabled: false
                }
            },
            plotOptions: {
                column: {
                    animation: false,
                    minPointLength: 5,
                    colorByPoint: true,
                    colors: colors,
                    pointPadding: 0.35,
                    borderWidth: 0
                }
            }
        };

        // let historyDate = data[0];
        // let todayAccData = data.slice(-1)[0];

        return (
            <div className="mp-reg-stat">
                <div className="mp-reg-stat__data-wrap">
                    <div className="mp-reg-stat__inner">
                        <Translate
                            className="header-daily-stat__title"
                            content="main_page.header.total_accounts"
                        />

                        <span className="header-daily-stat__data total-accounts wow animate__animated animate__fadeIn" data-wow-duration="2s"  data-wow-delay="0.4s">
                            <FormattedNumber
                                unitDisplay="long"
                                value={accountTotal}
                            />
                        </span>
                    </div>

                    {/*<div className="mp-reg-stat__inner">*/}
                    {/*    <Translate*/}
                    {/*        className="header-daily-stat__title"*/}
                    {/*        content="main_page.header.per_day"*/}
                    {/*    />*/}

                    {/*    <span className="header-daily-stat__highlighted">*/}
                    {/*        <FormattedNumber*/}
                    {/*            unitDisplay="long"*/}
                    {/*            value={todayAccData[1]}*/}
                    {/*        />*/}
                    {/*    </span>*/}
                    {/*</div>*/}
                </div>

                <div className="chart-wrapper">
                    <ReactHighchart ref="chart" config={config} />
                    <div className="line">
                        <img src={line} alt="line" />
                    </div>

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
        );
    }
}

export default RegChartBlock;
