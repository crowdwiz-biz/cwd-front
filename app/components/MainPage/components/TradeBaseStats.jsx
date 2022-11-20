import React from "react";
import Translate from "react-translate-component";
import TradeBaseItem from "./utility/TradeBaseItem";

// IMAGES
import mgcwdIcon from "assets/svg-images/svg-common/main-page/trade-img/mgcwd_icon.svg";
import gcwdIcon from "assets/svg-images/svg-common/main-page/trade-img/gcwd_icon.svg";
import mcentIcon from "assets/svg-images/svg-common/main-page/trade-img/mcent_icon.svg";


class TradeBaseStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exchangeData: [
                {
                    base: "1.3.0",
                    quote: "1.3.1",
                    icon: gcwdIcon,
                    link: "GCWD_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.5",
                    icon: mgcwdIcon,
                    link: "MGCWD_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.32",
                    icon: mcentIcon,
                    link: "MCENT_CWD"
                }
            ]
        };
    }
    render() {
        let exchangeData = this.state.exchangeData;

        return (
            <section className="mp-center-wrap">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <h2 className="mp-common__title">DEX</h2>

                        <Translate
                            className="mp-common__description"
                            content="main_page.trade_stats.description"
                        />
                    </div>

                    <ul className="mp-common__right-column trade-stats__right-column">
                        {exchangeData.map((assetObj, index) => (
                            <TradeBaseItem
                                key={index}
                                itemClass="trade-stats__data-container"
                                asset_data={assetObj}
                                isOption={false}
                            />
                        ))}
                    </ul>
                </div>
            </section>
        );
    }
}

export default TradeBaseStats;
