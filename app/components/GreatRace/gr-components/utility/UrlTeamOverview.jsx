import React from "react";
import Translate from "react-translate-component";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import NewIcon from "../../../NewIcon/NewIcon";
import LinkToAccountById from "../../../Utility/LinkToAccountById";
import { Tab, Tabs } from "../../../Utility/Tabs";
import TeamMembers from "./TeamMembers";
import TeamStageVolume from "./TeamStageVolume";
import { Apis } from "bitsharesjs-ws";
import { Link } from "react-router-dom";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

import "../../scss/_all-gr.scss";

let headerImg = require("assets/headers/great-race_header.jpg");

class UrlTeamOverview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teamData: {},
            membersList: [],
            capData: {}
        }
    }

    componentWillMount() {
        this.getTeam();
    }

    getTeam() {
        let urlTeam = this.props.match.params.teamId;
        let currentTeam = urlTeam.split("-")[1];

        Apis.instance()
            .db_api()
            .exec("get_objects", [[currentTeam]])
            .then(data => {
                this.setState({
                    teamData: data[0]
                });

                if (data[0]) {
                    this.getAccounts();
                }
            });

    }

    getAccounts() {
        let teamData = this.state.teamData;

        Apis.instance()
            .db_api()
            .exec("get_full_accounts", [teamData["players"], false])
            .then(data => {
                this.setState({
                    membersList: data
                });
                Apis.instance()
                    .db_api()
                    .exec("get_full_accounts", [[teamData["captain"]], false])
                    .then(captain => {
                        this.setState({
                            capData: captain[0]
                        });
                    });
            });
    }

    render() {
        let { teamData, membersList, capData } = this.state;
        let { currentAccount } = this.props;

        let rankingList = [
            "Start",
            "Iron",
            "Bronze",
            "Silver",
            "Gold",
            "Platinum",
            "Diamond",
            "Master",
            "Elite"
        ];

        let currentStage = 1;

        let rankingImgClass;
        let stageList = [];

        if (teamData) {
            rankingImgClass = "gr-team-overview__rank-img--" + teamData["last_gr_rank"];

            if (currentStage == 1 || currentStage == 0) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 2) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'current' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 3) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 4) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'current' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 5) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 6) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'current' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 7 || currentStage == 8) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 9) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'current' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 10) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'future' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }

            if (currentStage == 11) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'current' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }

            if (currentStage == 12) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'future' },
                );
            }
            if (currentStage == 13) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_13_volume, isActive: 'current' },
                );
            }

            if (currentStage == 14) {
                stageList.push(
                    { volume: teamData.gr_interval_2_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_4_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_6_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_9_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_11_volume, isActive: 'past' },
                    { volume: teamData.gr_interval_13_volume, isActive: 4 },
                );
            }
        }

        if (Object.keys(teamData).length === 0 || Object.keys(capData).length === 0) {
            return null
        }
        else {
            let dynGlobalObject = ChainStore.getObject("2.1.0");
    
            if (dynGlobalObject) {
                currentStage = dynGlobalObject.get("current_gr_interval");
            }

            let isCaptain = false;

            if (currentAccount.get("id") == teamData["captain"]) {
                isCaptain = true
            }

            return (
                <div className="gr-team-overview">

                    {/* HEADER */}
                    <img className="gr-index__header" src={headerImg} alt="" />

                    <div className="gr-index__center-layout">
                        <div className="gr-content__header">
                            <Link
                                to="/great-race"
                                className="cwd-btn__action-btn cwd-btn__action-btn--gold-border"
                            >
                                <Translate content="great_race.tab_title_gr" />
                            </Link>
                        </div>
                    </div>

                    {!teamData || Object.keys(capData).length === 0 ?

                        <div className="gr-index__center-layout">
                            <Translate
                                className="gr-content__description-text bet-table__no-bets-text"
                                content="great_race.my_team.team_doesnt_exist" />
                        </div>
                        :
                        <div>
                            <div className="gr-index__center-layout">
                                <div className="gr-team-overview__header">
                                    <div className="gr-team-overview__header-column gr-team-overview__header-column--title-block">
                                        <span
                                            className="gr-team-overview__logo"
                                            style={{
                                                backgroundImage: `url(${teamData["logo"].replace(
                                                    /http+[a-zA-Z0-9.:/]+ipfs/g,
                                                    apiUrl + "/ipfs"
                                                )})`
                                            }}
                                        ></span>

                                        <div className="gr-team-overview__header-info-block">
                                            <span className="gr-team-overview__name">
                                                {teamData["name"]}
                                            </span>

                                            <div className="gr-team-overview__cap-block">
                                                <Translate
                                                    className="gr-team-overview__text"
                                                    content="great_race.my_team.captain"
                                                />
                                        &nbsp;
                                        <span className="gr-team-overview__text gr-team-overview__text--highlight">
                                                    <LinkToAccountById
                                                        account={teamData["captain"]}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gr-team-overview__header-column gr-team-overview__header-column--ranking-block">
                                        <div className="gr-team-overview__img-column">
                                            <span
                                                className={
                                                    "gr-team-overview__rank-img " +
                                                    rankingImgClass
                                                }
                                            ></span>
                                            <span className="gr-team-overview__text">
                                                {rankingList[teamData["last_gr_rank"]]}
                                            </span>
                                        </div>

                                        <div className="gr-team-overview__img-column">
                                            <span className="gr-team-overview__members-icon">
                                                <NewIcon
                                                    iconWidth={34}
                                                    iconHeight={34}
                                                    iconName={"great-race_team_members"}
                                                />
                                            </span>
                                            <span className="gr-team-overview__text">
                                                {teamData["players"].length + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="gr-team-overview__description-wrap">
                                    <p className="gr-content__description-text">
                                        {teamData["description"]}
                                    </p>
                                </div>
                            </div>

                            <div className="gr-content__full-width-wrap gr-index__wrap">
                                <Tabs
                                    className="cwd-tabs"
                                    tabsClass="cwd-tabs__list"
                                    contentClass="cwd-tabs__content"
                                    segmented={false}
                                    actionButtons={false}
                                >
                                    <Tab title="great_race.my_team.members_list">
                                        <TeamMembers
                                            currentAccount={currentAccount}
                                            membersList={membersList}
                                            capData={capData}
                                            isCaptain={isCaptain}
                                            currentStage={currentStage}
                                            teamId={teamData["id"]}
                                        />
                                    </Tab>

                                    <Tab title="great_race.my_team.team_volume">
                                        {stageList.length > 0 ? (
                                            <TeamStageVolume
                                                stageList={stageList}
                                            />) : null}
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>}
                </div >
            )
        }
    }
}

export default UrlTeamOverview = connect(UrlTeamOverview, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            currentAccount: ChainStore.fetchFullAccount(
                AccountStore.getState().currentAccount ||
                AccountStore.getState().passwordAccount
            )
        };
    }
});
