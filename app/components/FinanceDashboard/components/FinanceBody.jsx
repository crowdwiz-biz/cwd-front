import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import {Apis} from "bitsharesjs-ws";
import FormattedAsset from "../../Utility/FormattedAsset";

//STYLES
import "../scss/finance-body.scss";
import "../scss/invest-item.scss";

let dexImg = require("assets/png-images/finance-dashboard/finance_dex_bg.png");
let stakingImg = require("assets/png-images/staking/mp_poc_staking_bg.png");
let pledgeImg = require("assets/png-images/finance-dashboard/finance_pledge_bg.png");
let gcwdImg = require("assets/png-images/finance-dashboard/finance_gcwd_bg.png");

class FinanceBody extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dgpo: {
                poc3_percent: 0,
                poc6_percent: 0,
                poc12_percent: 0,
                gcwd_price: 0
            }
        };
    }

    followFinanceLink(path) {
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.props.history.push(path);
                    })
                    .catch(() => {});
            } else {
                this.props.history.push(path);
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    componentDidMount() {
        this.getDGPO();
    }

    getDGPO() {
        Apis.instance()
            .db_api()
            .exec("get_dynamic_global_properties", [])
            .then(dgpo => {
                this.setState({
                    dgpo: dgpo
                });
            });
    }

    isWalletLocked() {
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.buyGCWD();
                    })
                    .catch(() => {});
            } else {
                this.buyGCWD();
            }
        } else {
            console.log("Body is locked redirect");
            this.props.history.push("/create-account/password");
        }
    }

    buyGCWD() {
        let account = this.props.account.get("id");
        let gcwdPrice = this.state.dgpo.gcwd_price;

        AccountActions.buyGcwd(account, gcwdPrice).then(() => {
            this.getDGPO();
        });
    }

    render() {
        let accountName;
        let path;
        if (this.props.account) {
            accountName = this.props.account.get("name");
            path = `/${accountName}/poc_staking`;
        }

        let monthPercent = this.state.dgpo;
        let gcwdPrice = this.state.dgpo.gcwd_price;
        let width = window.innerWidth;

        return (
            <ul className="finance-body">
                {/* DEX CARD */}
                <li className="finance-body__item finance-body__item--dex">
                    <img
                        className="finance-body__item-img finance-body__item-img--dex"
                        src={dexImg}
                        alt="Crypto DEX"
                    />

                    <div className="finance-body__btn-wrap">
                        <button
                            type="button"
                            className="finance-dashboard__btn finance-dashboard__btn--dex"
                            onClick={this.followFinanceLink.bind(
                                this,
                                "/gateway/dex"
                            )}
                        >
                            <NewIcon
                                iconWidth={width > 576 ? 36 : 27}
                                iconHeight={width > 576 ? 50 : 36}
                                iconName={"finance-dashboard_btn_icon_dex"}
                            />
                            <Translate content="finance_dashboard.cwd_exchange_btn" />
                        </button>
                    </div>
                </li>

                {/* POC STAKING */}
                <li className="finance-body__item">
                    <img
                        className="finance-body__item-img finance-body__item-img--staking"
                        src={stakingImg}
                        alt="Silver token"
                    />

                    <ul className="invest-item__month-list">
                        <li className="invest-item__item">
                            <NewIcon
                                iconWidth={width > 576 ? 25 : 20}
                                iconHeight={width > 576 ? 34 : 27}
                                iconName={"finance-dashboard_staking_3"}
                            />

                            <div className="invest-item__month-inner">
                                <Translate
                                    className="invest-item__text"
                                    content="finance_dashboard.invest_month"
                                />

                                <div className="invest-item__month-data">
                                    <NewIcon
                                        iconWidth={10}
                                        iconHeight={11}
                                        iconName={
                                            "finance-dashboard_staking_arrow"
                                        }
                                    />
                                    <span className="invest-item__percent">
                                        {monthPercent.poc3_percent / 100}%
                                    </span>
                                </div>
                            </div>
                        </li>

                        <li className="invest-item__item">
                            <NewIcon
                                iconWidth={width > 576 ? 25 : 20}
                                iconHeight={width > 576 ? 34 : 31}
                                iconName={"finance-dashboard_staking_6"}
                            />

                            <div className="invest-item__month-inner">
                                <Translate
                                    className="invest-item__text"
                                    content="finance_dashboard.invest_months"
                                />

                                <div className="invest-item__month-data">
                                    <NewIcon
                                        iconWidth={10}
                                        iconHeight={11}
                                        iconName={
                                            "finance-dashboard_staking_arrow"
                                        }
                                    />
                                    <span className="invest-item__percent">
                                        {monthPercent.poc6_percent / 100}%
                                    </span>
                                </div>
                            </div>
                        </li>

                        <li className="invest-item__item invest-item__item--12">
                            <NewIcon
                                iconWidth={width > 576 ? 42 : 36}
                                iconHeight={width > 576 ? 31 : 29}
                                iconName={"finance-dashboard_staking_12"}
                            />

                            <div className="invest-item__month-inner">
                                <Translate
                                    className="invest-item__text"
                                    content="finance_dashboard.invest_months"
                                />

                                <div className="invest-item__month-data">
                                    <NewIcon
                                        iconWidth={10}
                                        iconHeight={11}
                                        iconName={
                                            "finance-dashboard_staking_arrow"
                                        }
                                    />
                                    <span className="invest-item__percent">
                                        {monthPercent.poc12_percent / 100}%
                                    </span>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <button
                        type="button"
                        className="finance-dashboard__btn finance-dashboard__btn--staking"
                        onClick={this.followFinanceLink.bind(this, path)}
                    >
                        <Translate content="finance_dashboard.staking_btn" />
                        <NewIcon
                            iconWidth={width > 576 ? 16 : 9}
                            iconHeight={width > 576 ? 13 : 7}
                            iconName={"link_btn_arrow"}
                        />
                    </button>
                </li>

                {/* PLEDGE CARD */}
                <li className="finance-body__item">
                    <img
                        className="finance-body__item-img finance-body__item-img--pledge"
                        src={pledgeImg}
                        alt="Crowd Pledge"
                    />

                    <Translate
                        className="finance-body__title"
                        content="finance_dashboard.title_pledge"
                    />

                    <button
                        type="button"
                        className="finance-dashboard__btn finance-dashboard__btn--pledge"
                        onClick={this.followFinanceLink.bind(
                            this,
                            "/pledge-offer"
                        )}
                    >
                        <Translate content="finance_dashboard.pledge_btn" />
                        <NewIcon
                            iconWidth={width > 576 ? 16 : 9}
                            iconHeight={width > 576 ? 13 : 7}
                            iconName={"link_btn_arrow"}
                        />
                    </button>
                </li>

                {/*  BUY GCWD */}
                <li className="finance-body__item">
                    <img
                        className="finance-body__item-img finance-body__item-img--gcwd"
                        src={gcwdImg}
                        alt="GOLD CROWD"
                    />

                    <span className="finance-body__ex-rate">
                        <Translate
                            className="finance-body__ex-rate-text"
                            content="finance_dashboard.ex_rate"
                        />
                        &nbsp;
                        <span className="finance-body__ex-rate-price">
                            <FormattedAsset
                                amount={gcwdPrice}
                                asset={"1.3.0"}
                                decimalOffset={3}
                            />
                        </span>
                    </span>

                    <button
                        type="button"
                        className="finance-dashboard__btn finance-dashboard__btn--pledge"
                        onClick={this.isWalletLocked.bind(this)}
                    >
                        <Translate content="finance_dashboard.gcwd_btn" />
                    </button>
                </li>
            </ul>
        );
    }
}

export default FinanceBody;
