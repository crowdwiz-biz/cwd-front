import React from "react";
import Translate from "react-translate-component";
import AccountActions from "actions/AccountActions";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import NewIcon from "../../../NewIcon/NewIcon";
import LinkToAccountById from "../../../Utility/LinkToAccountById";
import { Tab, Tabs } from "../../../Utility/Tabs";
import TeamMembers from "./TeamMembers";
import TeamStageVolume from "./TeamStageVolume";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");


class GRTeamOverview extends React.Component {
    constructor(props) {
        super(props);
    }

    isWalletLocked() {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.deleteTeam()
                })
                .catch(() => { });
        } else {
            this.deleteTeam()
        }
    }


    deleteTeam() {
        let captain = this.props.currentAccount.get("id");
        let team = this.props.teamData["id"];

        AccountActions.deleteTeam(captain, team);
    }

    render() {
        let {
            teamData,
            membersList,
            capData,
            currentAccount,
            currentStage
        } = this.props;

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
        let rankingImgClass = "gr-team-overview__rank-img--" + teamData["last_gr_rank"];

        let stageList = [];

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

        let deviceWidth = window.innerWidth;
        let isDisabled = ![1, 3, 5, 7, 8, 10, 12, 14].includes(currentStage);


        if (Object.keys(teamData).length === 0 || Object.keys(capData).length === 0) {
            return null
        }
        else {
            let isCaptain = false;

            if (currentAccount.get("id") == teamData["captain"]) {
                isCaptain = true
            }

            return (
                <div className="gr-team-overview">
                    <div className="gr-index__center-layout">
                        {/* HEADER */}
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

                            {deviceWidth > 768 && isCaptain ? (
                                <div className="gr-team-overview__header-column gr-team-overview__header-column--btn-block">
                                    <button
                                        className="cwd-btn__action-btn cwd-btn__action-btn--delete-btn"
                                        onClick={this.isWalletLocked.bind(this)}
                                        disabled={isDisabled}
                                    >
                                        <NewIcon
                                            iconWidth={10}
                                            iconHeight={11}
                                            iconName={"icon_delete-btn"}
                                        />

                                        <Translate content="great_race.my_team.delete_team_btn" />
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="gr-team-overview__description-wrap">
                            <p className="gr-content__description-text">
                                {teamData["description"]}
                            </p>
                        </div>

                        {deviceWidth <= 768 && isCaptain ? (
                            <button
                                className="cwd-btn__action-btn cwd-btn__action-btn--delete-btn"
                                onClick={this.isWalletLocked.bind(this)}
                                disabled={isDisabled}
                            >
                                <NewIcon
                                    iconWidth={10}
                                    iconHeight={11}
                                    iconName={"icon_delete-btn"}
                                />

                                <Translate content="great_race.my_team.delete_team_btn" />
                            </button>
                        ) : null}
                    </div>

                    <div className="gr-content__full-width-wrap">
                        <Tabs
                            className="cwd-tabs"
                            tabsClass="cwd-tabs__list"
                            contentClass="cwd-tabs__content"
                            segmented={false}
                            actionButtons={false}
                        >
                            <Tab title="great_race.my_team.members_list">
                                <TeamMembers
                                    currentAccount={
                                        this.props.currentAccount
                                    }
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
                </div>
            );
        }
    }
}


export default GRTeamOverview;
