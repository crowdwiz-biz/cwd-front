import React from "react";
import {connect} from "alt-react";
import {Tabs, Tab} from "../Utility/Tabs";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs";
import StakingTransfer from "./components/StakingTransfer";
import {Apis} from "bitsharesjs-ws";

//STYLES
let headerImg = require("assets/png-images/staking/mp_poc_staking_bg.png");
let headerImgMobile = require("assets/png-images/staking/staking_bg_mobile.png");

class Investment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.account,
            dgpo: {
                poc3_percent: 0,
                poc6_percent: 0,
                poc12_percent: 0
            },
            gpo: {
                staking_parameters: {
                    poc3_min_amount: -1,
                    poc6_min_amount: -1,
                    poc12_min_amount: -1
                }
            }
        };
    }

    componentDidMount() {
        Apis.instance()
            .db_api()
            .exec("get_dynamic_global_properties", [])
            .then(dgpo => {
                this.setState({
                    dgpo: dgpo
                });
            });

        Apis.instance()
            .db_api()
            .exec("get_global_properties", [])
            .then(gpo => {
                this.setState({
                    gpo: gpo
                });
            });
    }

    render() {
        let currentAccount = this.state.currentAccount;
        let pocAccount = ChainStore.fetchFullAccount(
            this.props.match.params.account_name
        );
        if (!pocAccount) {
            return null;
        }
        let width = window.innerWidth;
        let monthPercent = this.state.dgpo;
        let minAmount = this.state.gpo;

        return (
            <section className="staking__wrap">
                <img
                    className="staking__header-img"
                    src={width > 576 ? headerImg : headerImgMobile}
                    alt="staking"
                />

                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab title="staking.tab_01">
                        {minAmount.staking_parameters.poc3_min_amount >= 0 ? (
                            <StakingTransfer
                                key="staking3"
                                currentAccount={currentAccount}
                                pocAccount={pocAccount}
                                percent={monthPercent.poc3_percent / 100}
                                minDeposit={
                                    minAmount.staking_parameters
                                        .poc3_min_amount / 100000
                                }
                                transferAsset="1.3.0"
                                description={"deposit_text_01"}
                                term="3"
                            />
                        ) : null}
                    </Tab>
                    <Tab title="staking.tab_02">
                        <StakingTransfer
                            key="staking6"
                            currentAccount={currentAccount}
                            pocAccount={pocAccount}
                            percent={monthPercent.poc6_percent / 100}
                            minDeposit={
                                minAmount.staking_parameters.poc6_min_amount /
                                100000
                            }
                            transferAsset="1.3.0"
                            description={"deposit_text_02"}
                            term="6"
                        />
                    </Tab>
                    <Tab title="staking.tab_03">
                        <StakingTransfer
                            key="staking12"
                            currentAccount={currentAccount}
                            pocAccount={pocAccount}
                            percent={monthPercent.poc12_percent / 100}
                            minDeposit={
                                minAmount.staking_parameters.poc12_min_amount /
                                100000
                            }
                            transferAsset="1.3.0"
                            description={"deposit_text_03"}
                            term="12"
                        />
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

export default Investment = connect(Investment, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
