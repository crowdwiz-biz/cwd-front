import React from "react";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import AccountStore from "stores/AccountStore";
import Translate from "react-translate-component";
import { Tabs, Tab } from "../Utility/Tabs";
import ContractTable from "./components/ContractTable";
import { totalContactData } from "./components/utility/TotalContactData";
import { refContractData } from "./components/utility/RefContractData";
import { leaderBonusData } from "./components/utility/LeaderBonusData";
import { featuresData } from "./components/utility/FeaturesData";


//STYLES
import "./scss/_all-profile.scss";

class ContractOverview extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let tabData1 = totalContactData;
        let tabData2 = refContractData;
        let tabData3 = leaderBonusData;
        let tabData4 = featuresData;

        let currentAccount = this.props.account;
        let currentContract = this.props.account.get("referral_status_type");
        let contractExpirationDate = this.props.account.get("referral_status_expiration_date");

        if (this.props.account) {
            return (
                <section className="contract-overview__wrap">
                    <div className="cwd-common__wrap-920">
                        <Translate
                            className="cwd-common__title-upper-case"
                            content="contract_overview.title"
                        />
                        <Translate
                            className="contract-overview__description-text"
                            content="contract_overview.description_text"
                            component="p"
                        />

                        <Tabs
                            className="cwd-tabs"
                            tabsClass="cwd-tabs__list"
                            contentClass="cwd-tabs__content"
                            segmented={false}
                            actionButtons={false}
                        >
                            <Tab title="contract_overview.tabs.tab_ref_total">
                                <div className="contract-overview__tab-content">
                                    <Translate
                                        className="contract-overview__description-text"
                                        content="contract_overview.tabs.tab_01_text"
                                        component="p"
                                    />

                                    <div className="contract-overview__table-scroll">
                                        <ContractTable
                                            title="title_01"
                                            tabData={tabData1}
                                            currentAccount={currentAccount}
                                            currentContract={currentContract}
                                            contractExpirationDate={contractExpirationDate}
                                        />
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="contract_overview.tabs.tab_ref_staking">
                                <div className="contract-overview__tab-content">
                                    <Translate
                                        className="contract-overview__description-text"
                                        content="contract_overview.tabs.tab_01_text"
                                        component="p"
                                    />

                                    <div className="contract-overview__table-scroll">
                                        <ContractTable
                                            title="title_02"
                                            tabData={tabData2}
                                            currentAccount={currentAccount}
                                            currentContract={currentContract}
                                            contractExpirationDate={contractExpirationDate}
                                        />
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="contract_overview.tabs.tab_leder_bonus">
                                <div className="contract-overview__tab-content">
                                    <Translate
                                        className="contract-overview__description-text"
                                        content="contract_overview.tabs.tab_03_text"
                                        component="p"
                                    />

                                    <div className="contract-overview__table-scroll">
                                        <ContractTable
                                            title="title_03"
                                            tabData={tabData3}
                                            currentAccount={currentAccount}
                                            currentContract={currentContract}
                                            contractExpirationDate={contractExpirationDate}
                                        />
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="contract_overview.tabs.tab_other">
                                <div className="contract-overview__tab-content">
                                    <div className="contract-overview__table-scroll">
                                        <ContractTable
                                            title="title_04"
                                            tabData={tabData4}
                                            currentAccount={currentAccount}
                                            currentContract={currentContract}
                                            contractExpirationDate={contractExpirationDate}
                                        />
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </section>
            )
        }
        else {
            return null
        }
    }
}

export default ContractOverview = connect(ContractOverview, {
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