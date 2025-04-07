import React from "react";
import GCWDstats from "./GCWDstats";
import CWDexStats from "./CWDexStats";
import TradeBaseStats from "./TradeBaseStats";
import GamezoneStats from "./GamezoneStats";
import PocStakingBlock from "./PocStakingBlock";

class TabSwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "GOLD CROWD",
        };
    }

    handleTabClick = (tab) => {
        this.setState({ activeTab: tab });
    };

    render() {
        const { activeTab } = this.state;
        const { apiData } = this.props;
        const tabs = ["GOLD CROWD", "CROWD DEX", "DEX", "GAMEZONE", "PROOF OF CROWD"];
        const selectTabIndex = tabs.findIndex((el) => el === activeTab)

        return (
            <div className="tab-switcher">
                <div className="tabs">
                    <div className="tabs-head">
                        <div style={{left: `${+selectTabIndex * 168}px`}} className="switch"></div>
                        {(tabs || []).map((tab) => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                                onClick={() => this.handleTabClick(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="tab-content">
                    {activeTab === "GOLD CROWD" && (
                        <div className="content">
                            {/* Gold Crowd */}
                            <GCWDstats
                                currentSupply={apiData.gcwd.currentSupply}
                                totalIncome={apiData.gcwd.totalIncome}
                                income24h={apiData.gcwd.income24h}
                                graphData={apiData.gcwd.graphData}
                            />
                        </div>
                    )}
                    {activeTab === "CROWD DEX" && (
                        <div className="content crowd-dex">
                            {/* Crowd Dex  */}
                            <CWDexStats
                                dealsCount={apiData.cwdex.dealsCount}
                                dealsVolume={apiData.cwdex.dealsVolume}
                                exRate={apiData.cwdex.exchangeRate}
                            />
                        </div>
                    )}
                    {activeTab === "DEX" && (
                        <div className="content dex">
                            {/* Dex */}
                            <TradeBaseStats />
                        </div>
                    )}
                    {activeTab === "GAMEZONE" && (
                        <div className="content gamezone">
                            {/* Gamezone */}
                            <GamezoneStats
                                gamesCount={apiData.gamezone.gamesCount}
                                gamesVolume={apiData.gamezone.gamesVolume}
                            />
                        </div>
                    )}
                    {activeTab === "PROOF OF CROWD" && (
                        <div className="content proof-of-crowd">
                            {/* Proof of crowd */}
                            <PocStakingBlock />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default TabSwitcher;
