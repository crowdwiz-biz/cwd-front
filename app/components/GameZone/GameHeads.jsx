import React from "react";
import Translate from "react-translate-component";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletDb from "stores/WalletDb";
import { ChainStore } from "bitsharesjs";
import { Apis } from "bitsharesjs-ws";
import LinkToAccountById from "../Utility/LinkToAccountById";
import { RecentTransactions } from "../Account/RecentTransactions";
import { connect } from "alt-react";
import NewIcon from "../NewIcon/NewIcon";
import counterpart from "counterpart";
import TransactionConfirmStore from "stores/TransactionConfirmStore";
import SettingsStore from "stores/SettingsStore";
import { FormattedDate } from "react-intl";


//STYLES
import "./scss/game-heads-all.scss";

let headerImg = require("assets/headers/heads-and-tails_header.png");
let bet_1 = require("assets/png-images/gamezone/bet_1.png");
let bet_3 = require("assets/png-images/gamezone/bet_3.png");
let bet_5 = require("assets/png-images/gamezone/bet_5.png");
let bet_10 = require("assets/png-images/gamezone/bet_10.png");
let betCustom = require("assets/png-images/gamezone/bet_custom.png");


class GameHeads extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            flipcoin: [],
            betAmount: 0,
            showModal: false,
            locales: SettingsStore.getState().defaults.locale,
            width: window.innerWidth,
            intervalID: 0,
            isBetValid: true
        };

        this.getBetsArray = this.getBetsArray.bind(this);
        this.makeBet = this.makeBet.bind(this);
        this.callBet = this.callBet.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.getBetsArray();
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);

        this.setState({
            intervalID: setInterval(this.getBetsArray.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
        clearInterval(this.state.intervalID);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    getBetsArray() {
        Apis.instance()
            .db_api()
            .exec("get_active_flipcoin", [])
            .then(flipcoin => {
                this.setState({
                    flipcoin: flipcoin
                });
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    handleBetAmount(event) {
        this.setState({ betAmount: event.target.value });
    }

    makeBet(amount, e) {
        e.preventDefault();
        amount = Math.floor(parseFloat(amount));
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => { });

                let bettor = this.props.account.get("id");
                let bet = amount;
                if (bet < 1000) {
                    this.setState({
                        isBetValid: false
                    });
                } else {
                    AccountActions.flipcoinBet(bettor, bet)
                        .then(() => {
                            TransactionConfirmStore.unlisten(
                                this.onTrxIncluded
                            );
                            TransactionConfirmStore.listen(this.onTrxIncluded);
                        })
                        .then(this.setState({ showModal: false }))
                        .catch(err => {
                            console.log("error:", err);
                        });

                    this.setState({
                        isBetValid: true,
                        betAmount: 0
                    });
                }
            } else {
                let bettor = this.props.account.get("id");
                let bet = amount;
                if (bet < 1000) {
                    this.setState({
                        isBetValid: false
                    });
                } else {
                    AccountActions.flipcoinBet(bettor, bet)
                        .then(() => {
                            TransactionConfirmStore.unlisten(
                                this.onTrxIncluded
                            );
                            TransactionConfirmStore.listen(this.onTrxIncluded);
                        })
                        .then(this.setState({ showModal: false }))
                        .catch(err => {
                            console.log("error:", err);
                        });
                    this.setState({
                        isBetValid: true,
                        betAmount: 0
                    });
                }
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    callBet(flipcoin_, amount, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => { });

                let caller = this.props.account.get("id");
                let bet = amount;
                let flipcoin = flipcoin_;
                AccountActions.flipcoinCall(flipcoin, caller, bet)
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            } else {
                let caller = this.props.account.get("id");
                let bet = amount;
                let flipcoin = flipcoin_;
                AccountActions.flipcoinCall(flipcoin, caller, bet)
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    toggleModal(e) {
        this.setState({ showModal: !this.state.showModal });
    }

    hideModal(e) {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            this.setState({ showModal: !this.state.showModal });
        }
    }

    render() {
        let flipCoin = this.state.flipcoin;
        let deviceWidth = window.innerWidth;

        const modal = (
            <div>
                <div className="ant-modal-mask"></div>

                <div
                    className="game-heads__modal"
                    onClick={e => this.hideModal(e)}
                >
                    <div className="game-heads__modal-content">
                        <NewIcon
                            iconClass="game-heads__modal-close"
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"cross"}
                            onClick={() => this.toggleModal()}
                        />

                        <form noValidate>
                            <div
                                className={
                                    this.state.isBetValid
                                        ? "game-heads__modal-input-wrapper"
                                        : "game-heads__modal-input-wrapper game-heads__modal-input-wrapper--error"
                                }
                            >
                                <input
                                    className="game-heads__modal-input"
                                    placeholder={counterpart.translate(
                                        "gamezone.enter-amount"
                                    )}
                                    type="number"
                                    id="userBet"
                                    onChange={event =>
                                        this.handleBetAmount(event)
                                    }
                                />
                                <span className="game-heads__modal-input-currency">
                                    <span>CWD</span>
                                </span>
                            </div>

                            {!this.state.isBetValid ? (
                                <div className="game-heads__invalid-bet">
                                    <Translate content="gamezone.amount_error" />{" "}
                                    <span>0.01 CWD</span>
                                </div>
                            ) : null}

                            <div className="game-heads__modal-btn-wrap">
                                <Translate
                                    className="common-btn"
                                    content="gamezone.bet"
                                    component="button"
                                    onClick={e =>
                                        this.makeBet(
                                            this.state.betAmount * 100000,
                                            e
                                        )
                                    }
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="game-heads__wrap">
                <img
                    className="game-heads__logo"
                    src={headerImg}
                    alt="Heads or Tails"
                />
                <div className="game-heads__content">
                    <div className="game-heads__desc-wrap">
                        <Translate
                            className="game-heads__description"
                            content="gamezone.heads-desc-01"
                            component="p"
                        />
                    </div>

                    <Translate
                        className="game-heads__title"
                        content="gamezone.heads-text"
                        component="p"
                    />
                    <div className="game-heads__bet-btn-wrap">
                        <button
                            className="game-heads__bet-item noselect"
                            onClick={this.makeBet.bind(this, 1 * 100000)}
                        >
                            <span className="game-heads__amount">
                                1 CWD
                            </span>
                            <img src={bet_1} className="game-heads__coin-img" alt="bet 1 cwd" />
                        </button>
                        <button
                            className="game-heads__bet-item noselect"
                            onClick={this.makeBet.bind(this, 3 * 100000)}
                        >
                            <span className="game-heads__amount">
                                3 CWD
                            </span>
                            <img src={bet_3} className="game-heads__coin-img" alt="bet 3 cwd" />
                        </button>
                        <button
                            className="game-heads__bet-item noselect"
                            onClick={this.makeBet.bind(this, 5 * 100000)}
                        >
                            <span className="game-heads__amount">
                                5 CWD
                            </span>
                            <img src={bet_5} className="game-heads__coin-img" alt="bet 5 cwd" />
                        </button>
                        <button
                            className="game-heads__bet-item noselect"
                            onClick={this.makeBet.bind(this, 10 * 100000)}
                        >
                            <span className="game-heads__amount">
                                10 CWD
                            </span>
                            <img src={bet_10} className="game-heads__coin-img" alt="bet 10 cwd" />
                        </button>

                        {this.state.showModal ? modal : null}

                        <div className="game-heads__form">
                            <button
                                className="game-heads__bet-item noselect user-btn"
                                onClick={this.toggleModal.bind(this)}
                            >
                                <Translate
                                    className="game-heads__amount game-heads__amount--custom"
                                    component="span"
                                    content="gamezone.custom-bet"
                                />
                                {this.state.showAmountInput ? (
                                    <input
                                        type="number"
                                        placeholder={counterpart.translate(
                                            "gamezone.enter-amount"
                                        )}
                                    />
                                ) : (
                                    ""
                                )}
                                <img src={betCustom} className="game-heads__coin-img" alt="bet custom" />
                            </button>
                        </div>
                    </div>

                    {flipCoin.length > 0 ? (
                        <div className="game-heads__bet-items">
                            <Translate
                                className="game-heads__title"
                                content="gamezone.active-bets"
                                component="p"
                            />
                            <ul className="heads-bet__list">
                                <li className="heads-bet__head">
                                    <div className="heads-bet__column">
                                        <Translate
                                            className="heads-bet__head-text"
                                            content="gamezone.player"
                                        />
                                    </div>

                                    {deviceWidth > 576 ?
                                        <div className="heads-bet__column heads-bet__column--time">
                                            <Translate
                                                className="heads-bet__head-text"
                                                content="gamezone.date-time"
                                            />
                                            &nbsp;{" (GMT)"}
                                        </div>
                                        : null}

                                    <div className="heads-bet__column heads-bet__column--amount">
                                        <Translate
                                            className="heads-bet__head-text"
                                            content="gamezone.bet-amount"
                                        />
                                    </div>
                                    <div className="heads-bet__column heads-bet__column--btn">
                                        <Translate
                                            className="heads-bet__head-text"
                                            content="gamezone.call-bet-title"
                                        />
                                    </div>
                                </li>
                                {flipCoin.map(bet => (
                                    <li
                                        className="heads-bet__row"
                                        key={bet["id"]}
                                    >
                                        <div className="heads-bet__column">
                                            <LinkToAccountById
                                                account={bet["bettor"]}
                                            />
                                        </div>
                                        {deviceWidth > 576 ?
                                            <span className="heads-bet__date heads-bet__column heads-bet__column--time">
                                                <FormattedDate
                                                    value={bet.expiration}
                                                    format="short"
                                                />{" "}

                                            </span>
                                            : null
                                        }

                                        <div className="heads-bet__column heads-bet__column--amount">
                                            <span className="heads-bet__amount">
                                                {bet["bet"]["amount"] / 100000}
                                                &nbsp;
                                            </span>
                                            <span className="heads-bet__asset">
                                                CWD
                                            </span>
                                        </div>
                                        <div
                                            className="heads-bet__column"
                                            onClick={this.callBet.bind(
                                                this,
                                                bet["id"],
                                                bet["bet"]["amount"]
                                            )}
                                        >
                                            <div className="heads-bet__reply noselect">
                                                <Translate
                                                    className="heads-bet__reply-text"
                                                    component="span"
                                                    content="gamezone.call-bet"
                                                />
                                                <NewIcon
                                                    iconClass="heads-bet__icon"
                                                    iconWidth={16}
                                                    iconHeight={16}
                                                    iconName={"hand_btn"}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    <div className="game-heads__bet-items">
                        {this.props.account ? (
                            <div className="game-heads__trx-wrap">
                                <Translate
                                    className="game-heads__title"
                                    content="gamezone.bet-history"
                                    component="span"
                                />
                                <RecentTransactions
                                    accountsList={[
                                        this.props.account.get("id")
                                    ]}
                                    compactView={false}
                                    showMore={true}
                                    fullHeight={true}
                                    limit={10}
                                    showFilters={false}
                                    dashboard
                                    multiFilter={[50, 51, 52, 53, 54]}
                                    gamezoneView={true}
                                    shortMode={true}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}
export default GameHeads = connect(GameHeads, {
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
