import React from "react";
import Translate from "react-translate-component";
import {Link} from "react-router-dom";
import {Apis} from "bitsharesjs-ws";
import utils from "common/utils";
import NewIcon from "../../../NewIcon/NewIcon";

class TradeBaseItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tickerData: {
                base: "",
                base_volume: "0",
                highest_bid: "0",
                latest: "0",
                lowest_ask: "0",
                percent_change: "0",
                quote: "",
                quote_volume: "0",
                time: ""
            },
            intervalID: 0
        };

        this.getMarketsArray = this.getMarketsArray.bind(this);
    }

    componentDidMount() {
        this.getMarketsArray();

        this.setState({
            intervalID: setInterval(this.getMarketsArray.bind(this), 15000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getMarketsArray() {
        let base = this.props.asset_data.base;
        let quote = this.props.asset_data.quote;

        Apis.instance()
            .db_api()
            .exec("get_ticker", [base, quote])
            .then(tickerData => {
                this.setState({
                    tickerData: tickerData
                });
            });
    }

    render() {
        let asset_data = this.props.asset_data;
        let isChanged = this.state.tickerData.percent_change;
        let price =
            Math.round(parseFloat(this.state.tickerData.latest) * 100) / 100;

        let base_volume = utils.format_volume(
            parseInt(this.state.tickerData.base_volume)
        );

        let isBigNumber = price.toString().length;

        let quote = this.state.tickerData.quote;
        let itemClass;
        let percentClass;
        let iconClass;

        if (isChanged > 0) {
            itemClass =
                "trade-stats__data-container trade-stats__data-container--up";
            percentClass = "trade-stats__percent trade-stats__percent--up";
            iconClass = "trade-stats__trade-arrow";
        } else {
            itemClass =
                "trade-stats__data-container trade-stats__data-container--down";
            percentClass = "trade-stats__percent trade-stats__percent--down";
            iconClass =
                "trade-stats__trade-arrow trade-stats__trade-arrow--down";
        }
        let containerWidth = window.innerWidth;

        return (
            <li className={isChanged != 0 ? itemClass : this.props.itemClass}>
                <Link
                    to={"market/" + asset_data.link}
                    className="trade-stats__link"
                >
                    <header className="trade-stats__header">
                        <img
                            className="trade-stats__asset"
                            src={asset_data.icon}
                            alt={quote}
                        />

                        {containerWidth > 1280 ? (
                            <div className="trade-stats__percent-wrap">
                                {isChanged != 0 ? (
                                    <NewIcon
                                        iconClass={iconClass}
                                        iconWidth={8}
                                        iconHeight={8}
                                        iconName={"up_down_arrow"}
                                    />
                                ) : null}

                                <span
                                    className={
                                        isChanged != 0
                                            ? percentClass
                                            : "trade-stats__percent"
                                    }
                                >
                                    {this.state.tickerData.percent_change}%
                                </span>
                            </div>
                        ) : null}
                    </header>

                    <div className="trade-stats__inner">
                        <div>
                            <span className="trade-stats__legend">
                                1&nbsp;{quote}
                            </span>
                            <span
                                className={
                                    isBigNumber > 6
                                        ? "trade-stats__amount  trade-stats__amount--big-number"
                                        : "trade-stats__amount"
                                }
                            >
                                {price}
                            </span>
                        </div>

                        {containerWidth < 1280 ? (
                            <div className="trade-stats__percent-wrap">
                                {isChanged != 0 ? (
                                    <NewIcon
                                        iconClass={iconClass}
                                        iconWidth={8}
                                        iconHeight={8}
                                        iconName={"up_down_arrow"}
                                    />
                                ) : null}

                                <span
                                    className={
                                        isChanged != 0
                                            ? percentClass
                                            : "trade-stats__percent"
                                    }
                                >
                                    {this.state.tickerData.percent_change}%
                                </span>
                            </div>
                        ) : null}

                        <div>
                            <Translate
                                className="trade-stats__legend"
                                content="main_page.trade_stats.24hr_label"
                            />
                            <span
                                className={
                                    isBigNumber > 6
                                        ? "trade-stats__amount trade-stats__amount--big-number"
                                        : "trade-stats__amount"
                                }
                            >
                                {base_volume}&nbsp;
                            </span>
                        </div>
                    </div>
                </Link>
            </li>
        );
    }
}

export default TradeBaseItem;
