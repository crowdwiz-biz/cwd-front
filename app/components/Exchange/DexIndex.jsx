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
                    base: "1.3.32",
                    quote: "1.3.1",
                    name: "mCENT - GCWD",
                    icon: "dex_mcent_gcwd",
                    link: "GCWD_MCENT"
                },
                {
                    base: "1.3.32",
                    quote: "1.3.5",
                    name: "mCENT - mGCWD",
                    icon: "dex_mcent_mgcwd",
                    link: "MGCWD_MCENT"
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
                    quote: "1.3.10",
                    name: "DIAMOND - CWD",
                    icon: "dex_diamond_cwd",
                    link: "DIAMOND_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.23",
                    name: "INDEX.SHARE - CWD",
                    icon: "dex_index_cwd",
                    link: "INDEX.SHARE_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.31",
                    name: "INDEX.mSHARE - CWD",
                    icon: "dex_mshare_cwd",
                    link: "INDEX.MSHARE_CWD"
                },
                {
                    base: "1.3.31",
                    quote: "1.3.23",
                    name: "mSHARE - SHARE",
                    icon: "dex_mshare_index",
                    link: "INDEX.SHARE_INDEX.MSHARE"
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
                    quote: "1.3.35",
                    name: "PRIDE - CWD",
                    icon: "dex_pride_cwd",
                    link: "PRIDE_CWD"
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
                    quote: "1.3.38",
                    name: "GLOBAL - CWD",
                    icon: "dex_global_cwd",
                    link: "GLOBAL_CWD"
                },
                {
                    base: "1.3.0",
                    quote: "1.3.97",
                    name: "MYCAPITAL - CWD",
                    icon: "dex_mycapital_cwd",
                    link: "MYCAPITAL_CWD"
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
