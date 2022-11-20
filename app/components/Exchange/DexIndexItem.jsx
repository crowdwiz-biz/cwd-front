import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../NewIcon/NewIcon";
import { Link } from "react-router-dom";
import { Apis } from "bitsharesjs-ws";
import utils from "common/utils";
import counterpart from "counterpart";

//STYLES
import "./scss/dex-index.scss";

class DexIndexItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tickerData: {},
            intervalID: 0,
            allUserPairs: []
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

    handleUserTradePair() {
        let allUserPairs = [];
        let existingUserTradePairs = JSON.parse(localStorage.getItem("user_trade_pairs"));
        let assetDataObj = this.props.asset_data;
        let assetDataStr = JSON.stringify(assetDataObj);

        if (localStorage.getItem("user_trade_pairs") && localStorage.getItem("user_trade_pairs").includes(assetDataStr)) {
            existingUserTradePairs.forEach(pair => {
                if (pair['link'] != assetDataObj['link']) {
                    allUserPairs.push(pair);
                }
            });
        }
        else {
            if (existingUserTradePairs != null) {
                existingUserTradePairs.push(assetDataObj);
                allUserPairs = existingUserTradePairs;
            }
            else {
                allUserPairs.push(assetDataObj);
            }
        }

        localStorage.setItem("user_trade_pairs", JSON.stringify(allUserPairs));
        this.props.updateTradePairsList();
    }

    render() {
        let {
            asset_data,
            isOption,
            isUserTradePair,
            itemClass,
            isCFD
        } = this.props;

        let isChanged = this.state.tickerData.percent_change;

        let price = 0;
        if (this.state.tickerData.latest) {
            price =
                Math.round(parseFloat(this.state.tickerData.latest) * 100000) /
                100000;
        }
        let base_volume = utils.format_volume(
            parseInt(this.state.tickerData.base_volume)
        );
        let quote = this.state.tickerData.quote;
        let base = this.state.tickerData.base;
        let arrowIcon;
        let percentClass;

        if (isChanged > 0) {
            arrowIcon = "dex_arrow_up";
            itemClass = "dex-item dex-item--up";
            percentClass = "dex-data__percent dex-data__percent--up";
        } else {
            arrowIcon = "dex_arrow_down";
            itemClass = "dex-item dex-item--down";
            percentClass = "dex-data__percent dex-data__percent--down";
        }

        return (
            <li className={isChanged != 0 ? itemClass : itemClass}>
                <Link
                    to={"market/" + asset_data.link}
                    className="dex-item__link"
                >
                    <div className="dex-item__header">
                        {isUserTradePair || isCFD ? null :
                            <NewIcon
                                iconClass="dex-item__icon"
                                iconWidth={74}
                                iconHeight={24}
                                iconName={asset_data.icon}
                            />}

                        <span className="dex-item__name">
                            {asset_data.name}
                        </span>
                    </div>

                    {isOption ? (
                        <span className="dex-item__text">
                            {counterpart.translate(
                                "dex_index.option_description",
                                {
                                    optionType: this.props.asset_data.translate
                                        .optionType,
                                    strikePrice: this.props.asset_data.translate
                                        .strikePrice,
                                    expiration: this.props.asset_data.translate
                                        .expiration,
                                    optionBase: this.props.asset_data.translate
                                        .optionBase,
                                    optionQuote: this.props.asset_data.translate
                                        .optionQuote
                                }
                            )}
                        </span>
                    ) : null}

                    <div className="dex-data__wrap">
                        <div className="dex-data__column">
                            <span className="dex-data__title">
                                1&nbsp;{quote}
                            </span>
                            <div className="dex-data__inner">
                                <span className="dex-data__text">{price}</span>
                                &nbsp;
                                <span className="dex-data__text dex-data__text--asset">
                                    {base}
                                </span>
                            </div>
                        </div>
                        <div className="dex-data__column dex-data__column--percent-wrap">
                            <Translate
                                className="dex-data__title"
                                content="dex_index.percent_change"
                            />

                            <div className="dex-data__inner">
                                <span
                                    className={
                                        isChanged != 0
                                            ? percentClass
                                            : "dex-data__percent"
                                    }
                                >
                                    {this.state.tickerData.percent_change}%
                                </span>
                                &nbsp;
                                {isChanged != 0 ? (
                                    <NewIcon
                                        iconClass="dex-data__icon"
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={arrowIcon}
                                    />
                                ) : null}
                            </div>
                        </div>
                        <div className="dex-data__column dex-data__column--volume-wrap">
                            <Translate
                                className="dex-data__title"
                                content="dex_index.day_value"
                            />

                            <div className="dex-data__inner">
                                <span className="dex-data__text">
                                    {base_volume}
                                </span>
                                &nbsp;
                                <span className="dex-data__text dex-data__text--asset">
                                    {base}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {isUserTradePair ?
                    <NewIcon
                        iconClass="trading-pair-selection__favourite-btn"
                        iconWidth={20}
                        iconHeight={20}
                        iconName={"favourite"}
                        onClick={this.handleUserTradePair.bind(this)}
                    />
                    : null}
            </li>
        );
    }
}

export default DexIndexItem;
