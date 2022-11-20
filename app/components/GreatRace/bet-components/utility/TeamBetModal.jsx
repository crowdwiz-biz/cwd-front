import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";


class TeamBetModal extends React.Component {
    constructor(props) {
        super(props);
        let statebetTableData = [];
        for (var item in this.props.teamList) {
            let td = this.props.teamList[item];
            td['isHidden'] = '';
            statebetTableData.push(td);
        }

        this.state = {
            selectedTeamName1: this.props.selectedTeamName1,
            selectedTeamName2: this.props.selectedTeamName2,
            totalTeam1Bets: this.props.totalTeam1Bets,
            totalTeam2Bets: this.props.totalTeam2Bets,
            teamName1: this.props.teamName1,
            teamName2: this.props.teamName2,
            teamBet: { betTeamName1: "", betTeamName2: "" },
            teamBetId: { betTeamName1: this.props.teamBetId1, betTeamName2: this.props.teamBetId2 },
            isDisabled: true,
            isListVisible: { betTeamName1: false, betTeamName2: false },
            betTableData: statebetTableData,
            showError: false,
            minBet: 10
        };
    }




    formValidate() {
        this.setState({
            showError: false
        })

        let { teamBetId } = this.state;
        let userBetAmount = parseInt(document.getElementById("userBetAmount").value);

        if (
            teamBetId.betTeamName1 != "" &&
            teamBetId.betTeamName2 != "" &&
            (teamBetId.betTeamName1 != teamBetId.betTeamName2) &&
            userBetAmount > 0) {
            this.setState({
                isDisabled: false
            });
        } else {
            this.setState({
                isDisabled: true
            });
        }
    }

    showTeamsList(betTeamName) {
        let statebetTableData = this.state.betTableData;

        for (var item in statebetTableData) {
            statebetTableData[item]['isHidden'] = "";
        }
        let visibility = { betTeamName1: false, betTeamName2: false };
        visibility[betTeamName] = true;
        let { teamBet, teamBetId } = this.state;
        teamBet[betTeamName] = "";
        teamBetId[betTeamName] = "";
        this.setState({
            teamBet: teamBet,
            teamBetId: teamBetId,
            isListVisible: visibility,
            betTableData: statebetTableData
        });
        document.getElementById(betTeamName).value = "";
        document.getElementById(betTeamName).readOnly = false;
    }

    selectTeam(e) {
        let { teamBet, teamBetId } = this.state;
        teamBet[e.target.dataset.betteam] = e.target.innerHTML;

        teamBetId[e.target.dataset.betteam] = e.target.dataset.teamid;


        this.setState({
            teamBet: teamBet,
            teamBetId: teamBetId,
            isListVisible: { betTeamName1: false, betTeamName2: false }
        })
        this.formValidate();
    }



    filterShownAcoounts(betTeamName) {
        let value = document.getElementById(betTeamName).value;
        let statebetTableData = this.state.betTableData;
        let isListVisible = { betTeamName1: false, betTeamName2: false };
        let counter = 0;
        let lastValue = "";
        let lastId = "";
        if (value !== "") {
            for (var item in statebetTableData) {
                if (!statebetTableData[item]['name'].toLowerCase().includes(value.toLowerCase())) {
                    statebetTableData[item]['isHidden'] = "rating-bet-modal__item--hide";
                }
                else {
                    isListVisible[betTeamName] = true;
                    statebetTableData[item]['isHidden'] = "";
                    counter = counter + 1;
                    lastValue = statebetTableData[item]['name'];
                    lastId = statebetTableData[item]['id'];

                }
            }
        }
        else {
            for (var item in statebetTableData) {
                isListVisible[betTeamName] = true;
                statebetTableData[item]['isHidden'] = "";
            }
        }
        let { teamBet, teamBetId } = this.state;

        if (counter == 1) {
            value = lastValue;
            document.getElementById(betTeamName).value = lastValue;
            document.getElementById(betTeamName).readOnly = true;
            isListVisible[betTeamName] = false;
            teamBetId[betTeamName] = lastId
        }
        teamBet[betTeamName] = value;
        this.setState({
            teamBet: teamBet,
            betTableData: statebetTableData,
            isListVisible: isListVisible,
            teamBetId: teamBetId
        });


        this.formValidate();
    }

    isWalletLocked(e) {
        e.preventDefault();

        let userBetAmount = parseInt(document.getElementById("userBetAmount").value) * 100000;
        let result = true;
        let resultChecker = document.querySelector('input[name="betResult"]:checked').value;
        if (resultChecker == "false") { result = false; }
        let winner = result ? "team1" : "team2";

        let totalTeam1Bets = this.state.totalTeam1Bets;
        let totalTeam2Bets = this.state.totalTeam2Bets;

        let minBet = 1000000;
        if (winner == "team1" && totalTeam1Bets == 0 && totalTeam2Bets != 0) {
            minBet = totalTeam2Bets;
        }
        else if (winner == "team2" && totalTeam2Bets == 0 && totalTeam1Bets != 0) {
            minBet = totalTeam1Bets;
        }

        if (userBetAmount < minBet) {
            this.setState({
                showError: true,
                minBet: minBet/100000
            })
        }
        else {
            if (this.props.currentAccount) {
                if (WalletDb.isLocked()) {
                    WalletUnlockActions.unlock()
                        .then(() => {
                            AccountActions.tryToSetCurrentAccount();
                            this.submitTeamBet();
                        })
                        .catch(() => { });
                } else {
                    this.submitTeamBet();
                }
            }
        }
    }

    submitTeamBet() {
        let currentAccount = this.props.currentAccount;
        let accountId = currentAccount.get("id");

        let teamBetId = this.state.teamBetId;
        let team1 = teamBetId.betTeamName1;
        let team2 = teamBetId.betTeamName2;

        let userBetAmount = parseInt(document.getElementById("userBetAmount").value) * 100000;

        let result = true;
        let resultChecker = document.querySelector('input[name="betResult"]:checked').value;
        if (resultChecker == "false") { result = false; }
        let winner = result ? team1 : team2;


        AccountActions.makeTeamBet(
            team1,
            team2,
            winner,
            accountId,
            userBetAmount
        );

        this.props.closeBetModal();
    }

    render() {
        let { closeBetModal } = this.props;

        let {
            selectedTeamName1,
            selectedTeamName2,
            isListVisible,
            betTableData,
            teamBetId,
            isDisabled,
            showError,
            minBet
        } = this.state;
        
        
        return (
            <div className="rating-bet-modal">
                <div className="crowd-modal__wrap">

                    {selectedTeamName1 ?
                        <Translate
                            className="crowd-modal__modal-title"
                            content="great_race.gr_bets.bet_modal.title_match_bet"
                        />
                        :
                        <Translate
                            className="crowd-modal__modal-title"
                            content="great_race.gr_bets.bet_modal.title_new_bet"
                        />}

                    <NewIcon
                        iconClass={"crowd-modal__close-modal-btn"}
                        iconWidth={40}
                        iconHeight={40}
                        iconName={"close_modal"}
                        onClick={closeBetModal}
                    />

                    <form className="crowd-modal__body">

                        <div className="crowd-modal__row-vertical">
                            <Translate
                                className="crowd-modal__label"
                                content="great_race.gr_bets.bet_modal.label_team_01"
                            />
                            <input
                                className={teamBetId["betTeamName1"] == "" || (teamBetId.betTeamName1 == teamBetId.betTeamName2) ?
                                    "cwd-common__input cwd-common__input--with-select cwd-common__input--error"
                                    :
                                    "cwd-common__input cwd-common__input--with-select"
                                }
                                type="text"
                                name="betTeamName1"
                                id="betTeamName1"
                                ref="teamFilter"
                                placeholder={counterpart.translate(
                                    "great_race.gr_bets.bet_modal.team_placeholder"
                                )}
                                value={!selectedTeamName1 ? this.state.teamBet["betTeamName1"] : selectedTeamName1}
                                maxLength="64"
                                onChange={this.filterShownAcoounts.bind(this, "betTeamName1")}
                                onClick={this.showTeamsList.bind(this, "betTeamName1")}
                                disabled={!selectedTeamName1 ? false : true}
                                autoComplete="off"
                            />

                            {isListVisible.betTeamName1 ?
                                <ul className="rating-bet-modal__select-list">
                                    {betTableData.map(item => (
                                        <li
                                            key={item.name}
                                            className={"rating-bet-modal__item " + item.isHidden}
                                            onClick={this.selectTeam.bind(this)}
                                            data-teamid={item.team_id}
                                            data-betteam="betTeamName1"

                                        >
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                                : null}
                        </div>

                        <div className="crowd-modal__row-vertical">
                            <Translate
                                className="crowd-modal__label"
                                content="great_race.gr_bets.bet_modal.label_team_02"
                            />
                            <input
                                className={teamBetId["betTeamName2"] == "" || (teamBetId.betTeamName1 == teamBetId.betTeamName2) ?
                                    "cwd-common__input cwd-common__input--with-select cwd-common__input--error"
                                    :
                                    "cwd-common__input cwd-common__input--with-select"
                                }
                                type="text"
                                name="betTeamName2"
                                id="betTeamName2"
                                ref="teamFilter"
                                placeholder={counterpart.translate(
                                    "great_race.gr_bets.bet_modal.team_placeholder"
                                )}
                                value={!selectedTeamName2 ? this.state.teamBet["betTeamName2"] : selectedTeamName2}
                                maxLength="64"
                                onChange={this.filterShownAcoounts.bind(this, "betTeamName2")}
                                onClick={this.showTeamsList.bind(this, "betTeamName2")}
                                disabled={!selectedTeamName2 ? false : true}
                                autoComplete="off"
                            />

                            {isListVisible.betTeamName2 ?
                                <ul className="rating-bet-modal__select-list">
                                    {betTableData.map(item => (
                                        <li
                                            key={item.name}
                                            className={"rating-bet-modal__item " + item.isHidden}
                                            onClick={this.selectTeam.bind(this)}
                                            data-teamid={item.team_id}
                                            data-betteam="betTeamName2"
                                        >
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                                : null}
                        </div>

                        <div className="crowd-modal__row-vertical">
                            <Translate
                                className="crowd-modal__label"
                                content="great_race.gr_bets.bet_modal.bet_amount"
                            />

                            <input
                                className={showError ?
                                    "cwd-common__input cwd-common__input--error"
                                    : "cwd-common__input"
                                }
                                type="number"
                                name="userBetAmount"
                                id="userBetAmount"
                                min="5"
                                placeholder={counterpart.translate(
                                    "great_race.gr_bets.bet_modal.amount_placeholder"
                                )}
                                onChange={this.formValidate.bind(this)}
                            />

                            {showError ? (
                                <span className="crowd-modal__alert crowd-modal__alert--error">
                                    {counterpart.translate(
                                        "great_race.gr_bets.bet_modal.amount_error",
                                        {amount: minBet}
                                    )}
                                </span>
                            ) : null}
                        </div>

                        <div className="crowd-modal__row-vertical">
                            <Translate
                                className="crowd-modal__label"
                                content="great_race.gr_bets.bet_modal.team_will_win"
                            />

                            <div className="crowd-modal__inner crowd-modal__inner--radio">
                                <label
                                    htmlFor="resultTrue"
                                    className="crowd-modal__radio-label">
                                    <input
                                        className="crowd-modal__radio-btn"
                                        type="radio"
                                        id="resultTrue"
                                        name="betResult"
                                        value="true"
                                        defaultChecked
                                    />
                                    <Translate
                                        className="crowd-modal__radio-text"
                                        content="great_race.gr_bets.bet_modal.label_team_01"
                                    />
                                </label>

                                <label
                                    htmlFor="resultFalse"
                                    className="crowd-modal__radio-label">

                                    <input
                                        className="crowd-modal__radio-btn"
                                        type="radio"
                                        id="resultFalse"
                                        name="betResult"
                                        value="false"

                                    />

                                    <Translate
                                        className="crowd-modal__radio-text"
                                        content="great_race.gr_bets.bet_modal.label_team_02"
                                    />
                                </label>
                            </div>
                        </div>
                    </form>

                    <div className="crowd-modal__footer">
                        <button
                            className="cwd-btn__square-btn"
                            type="button"
                            disabled={isDisabled}
                            onClick={this.isWalletLocked.bind(this)}
                        >
                            <Translate
                                content="great_race.gr_bets.bet_modal.submit_btn"
                            />
                        </button>
                    </div>
                </div>

                <div
                    className="crowd-modal__overlay"
                    id="grOverlay"
                ></div>
            </div>
        );
    }
}

export default TeamBetModal;
