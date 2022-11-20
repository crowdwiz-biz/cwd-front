import React from "react";
import Translate from "react-translate-component";
import CrowdMarketItem from "./components/CrowdMarketItem";
import {crowdMarketData} from "./components/CrowdMarketData";

//STYLES
import "./scss/crowdmarket.scss";

let headerImg = require("assets/headers/crowdmarket_header.png");

class CrowdMarket extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let marketArray = crowdMarketData;

        return (
            <div className="crowdmarket">
                <div className="crowdmarket__center-layout">
                    <div className="crowdmarket__header-wrap">
                        <img src={headerImg} alt="CrowdMarket" />
                    </div>

                    <Translate
                        className="crowdmarket__subtitle"
                        content="crowdmarket.subtitle"
                        component="h1"
                    />

                    <ul className="crowdmarket__list">
                        {marketArray.map(item => (
                            <CrowdMarketItem key={item.itemID} item={item} />
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default CrowdMarket;
