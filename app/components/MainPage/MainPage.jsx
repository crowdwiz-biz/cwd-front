import React from "react";
import { connect } from "alt-react";
import { ChainStore } from "bitsharesjs";
import AltContainer from "alt-container";
import AccountStore from "stores/AccountStore";
import BlockchainStore from "stores/BlockchainStore";
import MainHeader from "./components/MainHeader";
import BlockchainRecentOps from "./components/BlockchainRecentOps";
import GCWDstats from "./components/GCWDstats";
import CWDexStats from "./components/CWDexStats";
import GamezoneStats from "./components/GamezoneStats";

import PocStakingBlock from "./components/PocStakingBlock";
import CodeExamples from "./components/CodeExamples";
// import CrowdProjects from "./components/CrowdProjects";
import MainFooter from "./components/MainFooter";

//STYLES
import "./scss/_all.scss";
import PlanetScene from "./components/PlanetScene";
import CommunityPrinciples from "./components/CommunityPrinciples";
import SecurityAndControl from "./components/SecurityAndControl";
import Development from "./components/Development";
import Access from "./components/Access";
import Slider from "./components/Slider";
import TabSwitcher from "./components/Tabs";
class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiData: {}
        };
    }

    componentDidMount() {
        this.getTotalData();
    }

    getTotalData() {
        let host = window.location.hostname;
        if (["127.0.0", "192.168"].includes(host.substring(0, 7))) {
            host = "backup.cwd.global";
        }

        let url =  "http://153.92.222.33:8800/static/front_stats.json"; //"https://" + host + "/static/front-stats.json";

        fetch(url)
            .then(response => response && response.json())
            .then(data => {
                this.setState({
                    apiData: data
                });
            });
    }

    render() {
        let apiData = this.state.apiData;

        if (Object.keys(apiData).length === 0) {
            return null;
        } else {
            return (
                <div className="mp-common">
                    <div className="main-planet-background">
                        <PlanetScene />
                    </div>
                    <AltContainer
                        stores={[BlockchainStore]}
                        inject={{
                            latestBlocks: () => {
                                return BlockchainStore.getState().latestBlocks;
                            },
                            latestTransactions: () => {
                                return BlockchainStore.getState()
                                    .latestTransactions;
                            }
                        }}
                    >
                        {/* HEADER BLOCK */}
                        <MainHeader
                            account={this.props.account}
                            history={this.props.history}
                            marketCapUsd={apiData.marketCapUsd}
                            accountTotal={apiData.account["total"]}
                            accountgraphData={apiData.account["graphData"]}
                        />
                    </AltContainer>
                    <CommunityPrinciples />
                    <SecurityAndControl />
                    <Access />
                    <Development />
                    <Slider />
                    <TabSwitcher apiData={apiData} />


                    {/* Build on Crowdwiz blockchain */}
                    {/* <CrowdProjects /> */}

                    <AltContainer
                        stores={[BlockchainStore]}
                        inject={{
                            latestBlocks: () => {
                                return BlockchainStore.getState().latestBlocks;
                            },
                            latestTransactions: () => {
                                return BlockchainStore.getState()
                                    .latestTransactions;
                            }
                        }}
                    >
                        {/* RECENT OPERATIONS */}
                        <BlockchainRecentOps />
                    </AltContainer>

                    {/* Open source and API */}
                    <CodeExamples />

                    {/* FOOTER BLOCK */}
                    <MainFooter />
                </div>
            );
        }
    }
}

export default MainPage = connect(MainPage, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
