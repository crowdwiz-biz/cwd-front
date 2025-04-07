import React from "react";
import Translate from "react-translate-component";
import {Link} from "react-router-dom";
import {Apis} from "bitsharesjs-ws";
import utils from "common/utils";
import NewIcon from "../../../NewIcon/NewIcon";
import arrow from "assets/svg-images/svg-common/main-page/header/arrow2.svg";

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
        // let containerWidth = window.innerWidth;

        return (
            <div className={isChanged != 0 ? itemClass : this.props.itemClass}>
                <Link
                    to={"market/" + asset_data.link}
                    className="trade-stats__link"
                >
                    <div className="trade-stats__inner">
                        <div className="col">
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
                    <div className="trade-stats__percent-wrap">
                        <span
                            className={
                                isChanged != 0
                                    ? percentClass
                                    : "trade-stats__percent"
                            }
                        >
                            <span>{this.state.tickerData.percent_change}%</span>
                            {!!isChanged && (
                                <svg width="17" height="9" viewBox="0 0 17 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 8L8.49868 1L16 8" fill="currentColor"/>
                                    <path d="M1 8L8.49868 1L16 8H1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>

                            )}
                        </span>
                    </div>
                </Link>
            </div>
        );
    }
}

export default TradeBaseItem;
