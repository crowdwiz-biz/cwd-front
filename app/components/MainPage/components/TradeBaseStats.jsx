import React from "react";
import Translate from "react-translate-component";
import TradeBaseItem from "./utility/TradeBaseItem";

// IMAGES
import mgcwdIcon from "assets/svg-images/svg-common/main-page/trade-img/mgcwd_icon.svg";
import gcwdIcon from "assets/svg-images/svg-common/main-page/trade-img/gcwd_icon.svg";
import mcentIcon from "assets/svg-images/svg-common/main-page/trade-img/mcent_icon.svg";
import ellipse1 from "assets/svg-images/svg-common/main-page/slider/ellipse1.svg";
import ellipse2 from "assets/svg-images/svg-common/main-page/slider/ellipce2.svg";

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
            <section className="trade-base">
                <h2 className="title wow animate__animated animate__fadeIn"  data-wow-duration="2s" data-wow-delay="0.2s">DEX</h2>

                <Translate
                    className="description wow animate__animated animate__fadeIn"
                    content="main_page.trade_stats.description"
                    data-wow-duration="2s"
                    data-wow-delay="0.4s"
                />

                <div className="list">
                    {exchangeData.map((assetObj, index) => (
                        <div className="item" key={index}>
                            <img className="ellipse-border ellipse" src={ellipse1} alt="ellipse1" />
                            <img className="ellipse" src={ellipse2} alt="ellipse2" />
                            <TradeBaseItem
                                key={index}
                                itemClass="trade-stats__data-container"
                                asset_data={assetObj}
                                isOption={false}
                            />
                        </div>
                    ))}
                </div>
            </section>
        );
    }
}

export default TradeBaseStats;
