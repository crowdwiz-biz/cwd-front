import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import { TeamBetItem, TeamBetItemMobile } from "./TeamBetItem";
import TeamBetModal from "./TeamBetModal";
import { Apis } from "bitsharesjs-ws";


class TeamBetMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            isDisabled: true,
            betTableData: [],
            teamList: [],

        };

        this.myRef = React.createRef();
    }

    UNSAFE_componentWillMount() {
        this.getTeamTable();

        this.setState({
            intervalID: setInterval(this.getTeamTable.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getTeamTable() {
        Apis.instance()
            .db_api()
            .exec("gr_get_team_bets", [])
            .then(teamTable => {
                this.setState({
                    betTableData: teamTable
                });
            });

        Apis.instance()
            .db_api()
            .exec("gr_get_rating", ["race"])
            .then(teamData => {
                this.setState({
                    teamList: teamData
                });
            });
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

    executeScroll = () => this.myRef.current.scrollIntoView()

    render() {
        let { betTableData, isModalVisible, teamList } = this.state;
        let { currentAccount, isDisabled } = this.props;
        let deviceWidth = window.innerWidth;

        return (
            <section className="bet-table">
                {/* HEADER */}
                <div className="bet-table__title-wrap">
                    <Translate
                        className="cwd-common__subtitle"
                        content="great_race.gr_bets.current_bets_title"
                    />

                    <button
                        className="cwd-btn__square-btn"
                        onClick={this.showBetModal.bind(this)}
                        disabled={isDisabled}
                    >
                        <Translate content="great_race.gr_bets.make_new_bet_btn" />

                        <NewIcon
                            iconClass={"my-team-wrap__btn-plus"}
                            iconWidth={13}
                            iconHeight={13}
                            iconName={"icon_plus"}
                        />
                    </button>
                </div>

                {/* BETS TABLE */}

                {betTableData.length > 0 ?
                    <div className="bet-table__wrap">
                        <div className="bet-table">
                            {deviceWidth > 768 ?
                                <div className="bet-table__header bet-table__header--team-row">
                                    <Translate content="great_race.gr_bets.place_bets.team_win" />
                                    <Translate content="great_race.gr_bets.place_bets.team_lose" />
                                    <Translate content="great_race.gr_bets.bet_result" />
                                </div>
                                : null}


                            {betTableData.map(item => (

                                deviceWidth > 768 ?
                                    <TeamBetItem
                                        currentAccount={currentAccount}
                                        key={item["team1"]["id"] + item["team2"]["id"]}
                                        teamBetId1={item["team1"]["id"]}
                                        teamName1={item["team1"]["name"]}
                                        teamLogo1={item["team1"]["logo"]}
                                        totalTeam1Bets={item["total_team1_bets"]}
                                        teamBetId2={item["team2"]["id"]}
                                        teamName2={item["team2"]["name"]}
                                        teamLogo2={item["team2"]["logo"]}
                                        totalTeam2Bets={item["total_team2_bets"]}
                                        showBetModal={this.showBetModal.bind(this)}
                                        isDisabled={isDisabled}
                                    />
                                    :
                                    <TeamBetItemMobile
                                        currentAccount={currentAccount}
                                        key={item["team1"]["id"] + item["team2"]["id"]}
                                        teamBetId1={item["team1"]["id"]}
                                        teamName1={item["team1"]["name"]}
                                        teamLogo1={item["team1"]["logo"]}
                                        totalTeam1Bets={item["total_team1_bets"]}
                                        teamBetId2={item["team2"]["id"]}
                                        teamName2={item["team2"]["name"]}
                                        teamLogo2={item["team2"]["logo"]}
                                        totalTeam2Bets={item["total_team2_bets"]}
                                        showBetModal={this.showBetModal.bind(this)}
                                        isDisabled={isDisabled}
                                    />
                            ))}
                        </div>
                    </div>
                    :

                    isDisabled ?
                        <Translate
                            className="gr-content__description-text bet-table__no-bets-text"
                            content="great_race.gr_bets.no_bet_interval" />
                        :
                        <Translate
                            className="gr-content__description-text bet-table__no-bets-text"
                            content="great_race.gr_bets.no_bet_text" />
                }

                {isModalVisible ?
                    <TeamBetModal
                        isModalVisible={isModalVisible}
                        teamList={teamList}
                        closeBetModal={this.closeBetModal.bind(this)}
                        currentAccount={currentAccount}
                    />
                    : null}
            </section>
        );
    }
}

export default TeamBetMap;