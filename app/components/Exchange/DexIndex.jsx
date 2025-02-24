import React from "react";
import Translate from "react-translate-component";
import DexIndexItem from "./DexIndexItem";
import TradingSelector from "./TradingSelector";
import { Tabs, Tab } from "../Utility/Tabs";


//STYLES
import "./scss/dex-index.scss";

class DexIndex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exchangeData: [
                {
                    base: "1.3.0",
                    quote: "1.3.1",
                    name: "GCWD - CWD",
                    icon: "dex_gcwd_cwd",
                    link: "GCWD_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.5",
                    name: "mGCWD - CWD",
                    icon: "dex_mgcwd_cwd",
                    link: "MGCWD_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.228",
                    name: "SCR - CWD",
                    icon: "dex_index_cwd",
                    link: "SCR_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.208",
                    name: "USDT - CWD",
                    icon: "dex_index_cwd",
                    link: "USDT_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.168",
                    name: "CROWDEX - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "CROWDEX_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.227",
                    name: "AXIOME - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "AXIOME_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.155",
                    name: "ORDER - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "ORDER_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.223",
                    name: "ZHIROTOP - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "ZHIROTOP_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.17",
                    name: "CWDPOLIS - CWD",
                    icon: "dex_cwdpolis_cwd",
                    link: "CWDPOLIS_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.224",
                    name: "FIRSTETF - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "FIRSTETF_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.122",
                    name: "GREEN - CWD",
                    icon: "dex_gcwd_mgcwd",
                    link: "GREEN_CWD"
                },
                {
                    base: "1.3.5",
                    quote: "1.3.1",
                    name: "mGCWD - GCWD",
                    icon: "dex_mgcwd_gcwd",
                    link: "GCWD_MGCWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.32",
                    name: "mCENT - CWD",
                    icon: "dex_mcent_cwd",
                    link: "MCENT_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.132",
                    name: "BANKCWD - CWD",
                    icon: "dex_bankcwd_cwd",
                    link: "BANKCWD_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.231",
                    name: "mBCWD - CWD",
                    icon: "dex_mbcwd_cwd",
                    link: "MBCWD_CWD"
                },
                {
                    base: "1.3.231",
                    quote: "1.3.132",
                    name: "mBCWD - BANKCWD",
                    icon: "dex_mbcwd_bankcwd",
                    link: "MBCWD_BANKCWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.235",
                    name: "GoldBANK - CWD",
                    icon: "dex_goldbank_cwd",
                    link: "GOLDBANK_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.236",
                    name: "CashBANK - CWD",
                    icon: "dex_cashbank_cwd",
                    link: "CASHBANK_CWD"
                }
            ]
        };
    }
    render() {
        let width = window.innerWidth;
        let headerImg;

        if (width > 576) {
            headerImg = require("assets/png-images/dex-dashboard/dex_header_bg_720.png");
        } else if (width > 768) {
            headerImg = require("assets/png-images/dex-dashboard/dex_header_bg.png");
        } else {
            headerImg = require("assets/png-images/dex-dashboard/dex_header_bg_375.png");
        }

        let { exchangeData, optionData, derivativeData } = this.state;

        return (
            <section className="cwd-common__wrap">
                <div className="dex-index__wrap">
                    <div className="dex-index__header">
                        <img src={headerImg} alt="DEX" />
                    </div>

                    <div className="dex-index__container">
                        <Tabs
                            className="cwd-tabs"
                            tabsClass="cwd-tabs__list"
                            contentClass="cwd-tabs__content"
                            segmented={false}
                            actionButtons={false}
                        >
                            <Tab title="dex_index.tab_01">
                                <ul className="dex-index__list">
                                    {exchangeData.map((assetObj, index) => (
                                        <DexIndexItem
                                            key={index}
                                            itemClass="dex-item"
                                            asset_data={assetObj}
                                            isOption={false}
                                            isCFD={false}
                                            isUserTradePair={false}
                                        />
                                    ))}
                                </ul>
                            </Tab>
                            <Tab title="dex_index.tab_02">
                                <TradingSelector />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </section>
        );
    }
}

export default DexIndex;
