import React from "react";
import VestingGroup from "./VestingGroup";
import {Tabs, Tab} from "../../../Utility/Tabs";
import TranslateWithLinks from "../../../Utility/TranslateWithLinks";

class VestingTypes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groupBalancesCrowd: []
        };
    }

    render() {
        let vestingObj = this.props.vestingObj;
        let account = this.props.account;
        let groupBalancesCrowd = [];
        let groupHeaderCrowd = [];
        let groupBalancesPartner = [];
        let groupHeaderPartner = [];
        let crowdAssets = ["1.3.0", "1.3.1", "1.3.4"];
        let counterCrowd = 0;
        let counterPartner = 0;
        vestingObj.forEach(element => {
            if (crowdAssets.indexOf(element.balance.asset_id) !== -1) {
                if (element.balance.amount > 0) {
                    counterCrowd = counterCrowd + 1;
                    if (
                        groupHeaderCrowd.indexOf(element.balance.asset_id) == -1
                    ) {
                        groupHeaderCrowd.push(element.balance.asset_id);
                    }

                    if (
                        groupBalancesCrowd.hasOwnProperty(
                            element.balance.asset_id
                        )
                    ) {
                        groupBalancesCrowd[element.balance.asset_id].push(
                            element
                        );
                    } else {
                        groupBalancesCrowd[element.balance.asset_id] = [];
                        groupBalancesCrowd[element.balance.asset_id].push(
                            element
                        );
                    }
                }
            } else {
                if (element.balance.amount > 0) {
                    counterPartner = counterPartner + 1;
                    if (
                        groupHeaderPartner.indexOf(element.balance.asset_id) ==
                        -1
                    ) {
                        groupHeaderPartner.push(element.balance.asset_id);
                    }

                    if (
                        groupBalancesPartner.hasOwnProperty(
                            element.balance.asset_id
                        )
                    ) {
                        groupBalancesPartner[element.balance.asset_id].push(
                            element
                        );
                    } else {
                        groupBalancesPartner[element.balance.asset_id] = [];
                        groupBalancesPartner[element.balance.asset_id].push(
                            element
                        );
                    }
                }
            }
        });

        return (
            <section>
                <Tabs
                    className="tab-switch"
                    tabsClass="tab-switch__list"
                    contentClass="tab-switch__content"
                    segmented={false}
                    actionButtons={false}
                >
                    <Tab
                        title="account.vesting.crowd_vesting_header"
                        counter={counterCrowd}
                    >
                        {groupHeaderCrowd.length > 0 ? (
                            groupHeaderCrowd.map(el => (
                                <VestingGroup
                                    key={"vg_" + el}
                                    vbs={groupBalancesCrowd[el]}
                                    account={account}
                                    asset_id={el.replace(/\./g, "_")}
                                    handleChanged={
                                        this.props.retrieveVestingBalances
                                    }
                                />
                            ))
                        ) : (
                            <p className="contract__info-text">
                                <TranslateWithLinks
                                    string="account.vesting.no_balances"
                                    keys={[
                                        {
                                            type: "account",
                                            value: account.get("name"),
                                            arg: "account"
                                        }
                                    ]}
                                />
                            </p>
                        )}
                    </Tab>

                    <Tab
                        title="account.vesting.pertner_vesting_header"
                        counter={counterPartner}
                    >
                        {groupHeaderPartner.length > 0 ? (
                            groupHeaderPartner.map(el => (
                                <VestingGroup
                                    key={"vg_" + el}
                                    vbs={groupBalancesPartner[el]}
                                    account={account}
                                    asset_id={el.replace(/\./g, "_")}
                                    handleChanged={
                                        this.props.retrieveVestingBalances
                                    }
                                />
                            ))
                        ) : (
                            <p className="contract__info-text">
                                <TranslateWithLinks
                                    string="account.vesting.no_balances"
                                    keys={[
                                        {
                                            type: "account",
                                            value: account.get("name"),
                                            arg: "account"
                                        }
                                    ]}
                                />
                            </p>
                        )}
                    </Tab>
                </Tabs>
            </section>
        );
    }
}

export default VestingTypes;
