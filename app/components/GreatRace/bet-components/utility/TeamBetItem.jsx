import React from "react";
import Translate from "react-translate-component";
import FormattedAsset from "../../../Utility/FormattedAsset";
import TeamBetModal from "./TeamBetModal";

import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

class TeamBetItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true
        };
    }

    showBetModal() {
        this.setState({
            isModalVisible: true
        });
    }

    closeBetModal() {
        this.setState({
            isModalVisible: false
        });
    }

    render() {
        let deviceWidth = window.innerWidth;

        let {
            teamBetId1,
            teamName1,
            teamLogo1,
            totalTeam1Bets,
            teamBetId2,
            teamName2,
            teamLogo2,
            totalTeam2Bets,
            isDisabled
        } = this.props;

        let { isModalVisible } = this.state;

        return (

            <div className="bet-table__item bet-table__item--team-row">
                <div className="bet-table__name-wrap">
                    <span
                        className="bet-table__logo"
                        style={{
                            backgroundImage: `url(${teamLogo1.replace(
                                /http+[a-zA-Z0-9.:/]+ipfs/g,
                                apiUrl + "/ipfs"
                            )})`
                        }}
                    ></span>

                    <span className="bet-table__data bet-table__data--name">{teamName1}</span>
                </div>

                <div className="bet-table__name-wrap">
                    <span
                        className="bet-table__logo"
                        style={{
                            backgroundImage: `url(${teamLogo2.replace(
                                /http+[a-zA-Z0-9.:/]+ipfs/g,
                                apiUrl + "/ipfs"
                            )})`
                        }}
                    ></span>

                    <span className="bet-table__data bet-table__data--name">{teamName2}</span>
                </div>

                <div className="bet-table__result-wrap">
                    <Translate
                        className="bet-table__data bet-table__data--true"
                        content="great_race.gr_bets.place_bets.bet_yes" />

                    <FormattedAsset
                        amount={totalTeam1Bets}
                        asset={"1.3.0"}
                        decimalOffset={5}
                        hide_asset={deviceWidth > 576 ? false : true}
                    />

                    <Translate
                        className="bet-table__data bet-table__data--false"
                        content="great_race.gr_bets.place_bets.bet_no" />

                    <FormattedAsset
                        amount={totalTeam2Bets}
                        asset={"1.3.0"}
                        decimalOffset={5}
                        hide_asset={deviceWidth > 576 ? false : true}
                    />
                </div>

                <button
                    type="button"
                    className="cwd-btn__action-btn"
                    onClick={this.showBetModal.bind(this)}
                    disabled={isDisabled}
                >
                    <Translate content="great_race.gr_bets.match_the_bet" />
                </button>

                {isModalVisible ?
                    <TeamBetModal
                        teamBetId1={teamBetId1}
                        teamBetId2={teamBetId2}
                        selectedTeamName1={teamName1}
                        selectedTeamName2={teamName2}
                        totalTeam1Bets={totalTeam1Bets}
                        totalTeam2Bets={totalTeam2Bets}
                        isModalVisible={isModalVisible}
                        closeBetModal={this.closeBetModal.bind(this)}
                        currentAccount={this.props.currentAccount}
                    />
                    : null}
            </div>
        );
    }
}

class TeamBetItemMobile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true
        };
    }

    showBetModal() {
        this.setState({
            isModalVisible: true
        });
    }

    closeBetModal() {
        this.setState({
            isModalVisible: false
        });
    }

    render() {
        let deviceWidth = window.innerWidth;

        let {
            teamBetId1,
            teamName1,
            teamLogo1,
            totalTeam1Bets,
            teamBetId2,
            teamName2,
            teamLogo2,
            totalTeam2Bets
        } = this.props;

        let { isModalVisible } = this.state;

        return (
            <div className="bet-table__mobile-item">
                <div className="bet-table__mobile-row">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.place_bets.team_win" />

                    <div className="bet-table__name-wrap">
                        <span
                            className="bet-table__logo"
                            style={{
                                backgroundImage: `url(${teamLogo1.replace(
                                    /http+[a-zA-Z0-9.:/]+ipfs/g,
                                    apiUrl + "/ipfs"
                                )})`
                            }}
                        ></span>

                        <span className="bet-table__data bet-table__data--name">{teamName1}</span>
                    </div>


                </div>

                <div className="bet-table__mobile-row">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.place_bets.team_lose" />

                    <div className="bet-table__name-wrap">
                        <span
                            className="bet-table__logo"
                            style={{
                                backgroundImage: `url(${teamLogo2.replace(
                                    /http+[a-zA-Z0-9.:/]+ipfs/g,
                                    apiUrl + "/ipfs"
                                )})`
                            }}
                        ></span>

                        <span className="bet-table__data bet-table__data--name">{teamName2}</span>
                    </div>
                </div>

                <div className="bet-table__mobile-row">
                    <Translate
                        className="bet-table__mobile-label"
                        content="great_race.gr_bets.bet_result" />

                    <div className="bet-table__result-wrap">
                        <Translate
                            className="bet-table__data bet-table__data--true"
                            content="great_race.gr_bets.place_bets.bet_yes" />

                        <FormattedAsset
                            amount={totalTeam1Bets}
                            asset={"1.3.0"}
                            decimalOffset={5}
                            hide_asset={deviceWidth > 576 ? false : true}
                        />

                        <Translate
                            className="bet-table__data bet-table__data--false"
                            content="great_race.gr_bets.place_bets.bet_no" />

                        <FormattedAsset
                            amount={totalTeam2Bets}
                            asset={"1.3.0"}
                            decimalOffset={5}
                            hide_asset={deviceWidth > 576 ? false : true}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="cwd-btn__action-btn"
                    onClick={this.showBetModal.bind(this)}
                >
                    <Translate content="great_race.gr_bets.match_the_bet" />
                </button>

                {isModalVisible ?
                    <TeamBetModal
                    teamBetId1={teamBetId1}
                    teamBetId2={teamBetId2}
                    selectedTeamName1={teamName1}
                    selectedTeamName2={teamName2}
                    totalTeam1Bets={totalTeam1Bets}
                    totalTeam2Bets={totalTeam2Bets}
                    isModalVisible={isModalVisible}
                    closeBetModal={this.closeBetModal.bind(this)}
                    currentAccount={this.props.currentAccount}
                    />
                    : null}
            </div>
        );
    }
}

export { TeamBetItem, TeamBetItemMobile };