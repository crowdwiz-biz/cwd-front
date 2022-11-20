import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";


class RatingBetModal extends React.Component {
    constructor(props) {
        super(props);
        let statebetTableData = [];
        for (var item in this.props.teamList) {
            let td = this.props.teamList[item];
            td['isHidden'] = '';
            statebetTableData.push(td);
        }

        this.state = {
            selectedTeamName: this.props.selectedTeamName,
            lowerRank: this.props.lowerRank,
            upperRank: this.props.upperRank,
            teamName: this.props.teamName,
            lowerRank: this.props.lowerRank,
            upperRank: this.props.upperRank,
            totalTrueBets: this.props.totalTrueBets,
            totalFalseBets: this.props.totalFalseBets,
            teamBet: "",
            teamBetId: this.props.teamBetId,
            isDisabled: true,
            isListVisible: false,
            betTableData: statebetTableData,
            placeInputError: false,
            showError: false,
            minBet: 10
        };
    }


    validatePlaceInput() {
        let placeMin = parseInt(document.getElementById("placeMin").value);
        let placeMax = parseInt(document.getElementById("placeMax").value);

        if (placeMin > placeMax) {
            this.setState({
                placeInputError: true
            })
        }
        else {
            this.setState({
                placeInputError: false
            })
        }

        this.formValidate();
    }

    formValidate() {
        this.setState({
            showError: false
        })

        let { teamBetId, placeInputError } = this.state;
        let userBetAmount = parseInt(document.getElementById("userBetAmount").value);

        if (
            teamBetId != "" &&
            placeInputError == false &&
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

    showTeamsList() {
        let statebetTableData = this.state.betTableData;

        for (var item in statebetTableData) {
            statebetTableData[item]['isHidden'] = "";
        }

        this.setState({
            teamBet: "",
            teamBetId: "",
            isListVisible: true,
            betTableData: statebetTableData
        });
        document.getElementById("betTeamName").value = "";
        document.getElementById("betTeamName").readOnly = false;
    }

    selectTeam(itemId, e) {
        this.setState({
            teamBet: e.target.innerHTML,
            teamBetId: itemId,
            isListVisible: false
        })

        this.formValidate();
    }

    filterShownAcoounts() {
        let value = document.getElementById("betTeamName").value;
        let statebetTableData = this.state.betTableData;
        let isListVisible = false;
        let counter = 0;
        let lastValue = "";
        let lastId = "";
        if (value !== "") {
            for (var item in statebetTableData) {
                if (!statebetTableData[item]['name'].toLowerCase().includes(value.toLowerCase())) {
                    statebetTableData[item]['isHidden'] = "rating-bet-modal__item--hide";
                }
                else {
                    isListVisible = true;
                    statebetTableData[item]['isHidden'] = "";
                    counter = counter + 1;
                    lastValue = statebetTableData[item]['name'];
                    lastId = statebetTableData[item]["team_id"];

                }
            }
        }
        else {
            for (var item in statebetTableData) {
                isListVisible = true;
                statebetTableData[item]['isHidden'] = "";
            }
        }
        let teamBetId = this.state.teamBetId;
        if (counter == 1) {
            value = lastValue;
            document.getElementById("betTeamName").value = lastValue;
            document.getElementById("betTeamName").readOnly = true;
            isListVisible = false;
            teamBetId = lastId
        }
        this.setState({
            teamBet: value,
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

        let totalTrueBets = this.state.totalTrueBets;
        let totalFalseBets = this.state.totalFalseBets;

        let minBet = 1000000;
        if (winner == "team1" && totalTrueBets == 0 && totalFalseBets != 0) {
            minBet = totalFalseBets;
        }
        else if (winner == "team2" && totalFalseBets == 0 && totalTrueBets != 0) {
            minBet = totalTrueBets;
        }

        if (userBetAmount < minBet) {
            this.setState({
                showError: true,
                minBet: minBet / 100000
            })
        }
        else {
            if (this.props.currentAccount) {
                if (WalletDb.isLocked()) {
                    WalletUnlockActions.unlock()
                        .then(() => {
                            AccountActions.tryToSetCurrentAccount();
                            this.submitPlaceBet();
                        })
                        .catch(() => { });
                } else {
                    this.submitPlaceBet();
                }
            }
        }
    }

    submitPlaceBet() {
        let currentAccount = this.props.currentAccount;
        let accountId = currentAccount.get("id");

        let teamBetId = this.state.teamBetId;
        let lowerRank = parseInt(document.getElementById("placeMin").value);
        let upperRank = parseInt(document.getElementById("placeMax").value);
        let result = true;
        let resultChecker = document.querySelector('input[name="betResult"]:checked').value;
        if (resultChecker == "false") { result = false; }
        let userBetAmount = parseInt(document.getElementById("userBetAmount").value) * 100000;

        AccountActions.makeRangeBet(
            teamBetId,
            lowerRank,
            upperRank,
            result,
            accountId,
            userBetAmount
        );

        this.props.closeBetModal();
    }

    render() {
        let { closeBetModal } = this.props;

        let {
            selectedTeamName,
            lowerRank,
            upperRank,
            isListVisible,
            betTableData,
            teamBetId,
            placeInputError,
            isDisabled,
            showError,
            minBet
        } = this.state;



        return (
            <div className="rating-bet-modal">
                <div className="crowd-modal__wrap">

                    {selectedTeamName ?
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
                                content="great_race.gr_bets.bet_modal.label_team"
                            />
                            <input
                                className={teamBetId == "" ?
                                    "cwd-common__input cwd-common__input--with-select cwd-common__input--error"
                                    :
                                    "cwd-common__input cwd-common__input--with-select"
                                }
                                type="text"
                                name="betTeamName"
                                id="betTeamName"
                                ref="teamFilter"
                                placeholder={counterpart.translate(
                                    "great_race.gr_bets.bet_modal.team_placeholder"
                                )}
                                value={!selectedTeamName ? this.state.teamBet : selectedTeamName}
                                maxLength="64"
                                onChange={this.filterShownAcoounts.bind(this)}
                                onClick={this.showTeamsList.bind(this)}
                                disabled={!selectedTeamName ? false : true}
                            />

                            {isListVisible ?
                                <ul className="rating-bet-modal__select-list">
                                    {betTableData.map(item => (
                                        <li
                                            key={item.name}
                                            className={"rating-bet-modal__item " + item.isHidden}
                                            onClick={this.selectTeam.bind(this, item.team_id)}
                                            data-teamid={item.team_id}
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
                                content="great_race.gr_bets.bet_modal.place_range"
                            />

                            <Translate
                                className="crowd-modal__info-text"
                                content="great_race.gr_bets.bet_modal.range_info_text"
                            />

                            <div className="crowd-modal__inner rating-bet-modal__inner">
                                <input
                                    className={!placeInputError ?
                                        "cwd-common__input" :
                                        "cwd-common__input cwd-common__input--error"}
                                    type="number"
                                    name="placeMin"
                                    id="placeMin"
                                    value={lowerRank ? lowerRank : undefined}
                                    placeholder={counterpart.translate(
                                        "great_race.gr_bets.bet_modal.from"
                                    )}
                                    onChange={this.validatePlaceInput.bind(this)}
                                    disabled={!lowerRank ? false : true}
                                />
                                <span>-</span>
                                <input
                                    className={!placeInputError ?
                                        "cwd-common__input" :
                                        "cwd-common__input cwd-common__input--error"}
                                    type="number"
                                    name="placeMax"
                                    id="placeMax"
                                    value={upperRank ? upperRank : undefined}
                                    placeholder={counterpart.translate(
                                        "great_race.gr_bets.bet_modal.to"
                                    )}
                                    onChange={this.validatePlaceInput.bind(this)}
                                    disabled={!upperRank ? false : true}
                                />
                            </div>
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
                                min="10"
                                placeholder={counterpart.translate(
                                    "great_race.gr_bets.bet_modal.amount_placeholder"
                                )}
                                autoComplete="off"
                                onChange={this.formValidate.bind(this)}
                            />

                            {showError ? (
                                <span className="crowd-modal__alert crowd-modal__alert--error">
                                    {counterpart.translate(
                                        "great_race.gr_bets.bet_modal.amount_error",
                                        { amount: minBet }
                                    )}
                                </span>
                            ) : null}
                        </div>

                        <div className="crowd-modal__row-vertical">
                            <Translate
                                className="crowd-modal__label"
                                content="great_race.gr_bets.bet_modal.result_label"
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
                                        content="great_race.gr_bets.bet_modal.result_true"
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
                                        content="great_race.gr_bets.bet_modal.result_false"
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

export default RatingBetModal;
