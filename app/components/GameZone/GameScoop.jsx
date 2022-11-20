import React from "react";
import Translate from "react-translate-component";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletDb from "stores/WalletDb";
import {ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";
import {Tabs, Tab} from "../Utility/Tabs";
import {RecentTransactions} from "../Account/RecentTransactions";
import {connect} from "alt-react";
import LinkToAccountById from "../Utility/LinkToAccountById";
import counterpart from "counterpart";
import ScoopForm from "./ScoopForm";
import TransactionConfirmStore from "stores/TransactionConfirmStore";
import SettingsStore from "stores/SettingsStore";
import {FormattedDate} from "react-intl";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

let headerImg = require("assets/headers/scoop_header.png");

//STYLES
import "./scss/game-scoop.scss";

class GameScoop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lots: [],
            memo: "",
            winLots: [],
            lotsHistory2: [],
            lotsHistory3: [],
            lotsHistory: [],
            currentAccount: AccountStore.getState().currentAccount,
            locales: SettingsStore.getState().defaults.locale,
            width: window.innerWidth,
            intervalID_01: 0,
            intervalID_02: 0,
            intervalID_03: 0,
            userSatus: 0
        };

        this.getLotsArray = this.getLotsArray.bind(this);
        this.getWinsArray = this.getWinsArray.bind(this);
        this.getlotsHistoryArray = this.getlotsHistoryArray.bind(this);
        this.showContactsForm = this.showContactsForm.bind(this);
        this.hideContactsForm = this.hideContactsForm.bind(this);
        this.onContactsAdded = this.onContactsAdded.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.getLotsArray();
        this.getWinsArray();
        this.getlotsHistoryArray();
        this.updateWindowDimensions();
        this.getAccountData();
        window.addEventListener("resize", this.updateWindowDimensions);

        this.setState({
            intervalID_01: setInterval(this.getLotsArray.bind(this), 5000),
            intervalID_02: setInterval(this.getWinsArray.bind(this), 5000),
            intervalID_03: setInterval(
                this.getlotsHistoryArray.bind(this),
                5000
            )
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
        clearInterval(this.state.intervalID_01);
        clearInterval(this.state.intervalID_02);
        clearInterval(this.state.intervalID_03);
    }

    updateWindowDimensions() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    getAccountData() {
        if (this.state.currentAccount) {
            let userID = this.props.account.get("id");

            Apis.instance()
                .db_api()
                .exec("get_objects", [[userID]])
                .then(data => {
                    this.setState({
                        userSatus: data[0].referral_status_type
                    });
                });
        }
    }

    getLotsArray() {
        Apis.instance()
            .db_api()
            .exec("lottery_goods_get_active", [])
            .then(lots => {
                this.setState({
                    lots: lots
                });
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    getWinsArray() {
        if (this.props.account) {
            Apis.instance()
                .db_api()
                .exec("lottery_goods_get_by_winner", [
                    this.props.account.get("id"),
                    2
                ])
                .then(winLots => {
                    this.setState({
                        winLots: winLots
                    });
                })
                .catch(err => {
                    console.log("error:", err);
                });
        }
    }

    getlotsHistoryArray() {
        Apis.instance()
            .db_api()
            .exec("lottery_goods_get_by_status_limit", [100, 2])
            .then(lotsHistory2 => {
                this.setState({
                    lotsHistory2: lotsHistory2
                });

                Apis.instance()
                    .db_api()
                    .exec("lottery_goods_get_by_status_limit", [10, 3])
                    .then(lotsHistory3 => {
                        this.setState({
                            lotsHistory3: lotsHistory3
                        });

                        let ar1 = this.state.lotsHistory2;
                        let ar2 = this.state.lotsHistory3;
                        Array.prototype.push.apply(ar1, ar2);
                        this.setState({
                            lotsHistory: ar1
                        });
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    showContactsForm(win_id) {
        document
            .getElementById("win_" + win_id)
            .classList.add("scoop-contacts--active");
    }

    hideContactsForm(win_id) {
        document
            .getElementById("win_" + win_id)
            .classList.remove("scoop-contacts--active");
    }

    onContactsAdded(e) {
        this.setState({memo: e.target.value});
    }

    lotteryBuyTicket(amount, lot_obj_id, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => {});

                let lot_id = lot_obj_id;
                let participant = this.props.account.get("id");
                let ticket_price = amount;
                AccountActions.lotteryBuyTicket(
                    lot_id,
                    participant,
                    ticket_price
                )
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            } else {
                let lot_id = lot_obj_id;
                let participant = this.props.account.get("id");
                let ticket_price = amount;
                AccountActions.lotteryBuyTicket(
                    lot_id,
                    participant,
                    ticket_price
                )
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

    sendContacts(lot_id, owner, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => {});
            } else {
                let memo = this.state.memo;

                if (memo.length > 0) {
                    let winner = this.props.account.get("id");
                    let winner_contacts = new Buffer(this.state.memo, "utf-8");
                    AccountActions.sendContacts(
                        lot_id,
                        winner,
                        owner,
                        winner_contacts
                    )
                        .then(() => {
                            TransactionConfirmStore.unlisten(
                                this.onTrxIncluded
                            );
                            TransactionConfirmStore.listen(this.onTrxIncluded);
                        })
                        .catch(err => {
                            console.log("error:", err);
                        });
                    this.hideContactsForm(lot_id);
                }
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    confirmDelivery(lot_obj_id, owner, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => {});
            } else {
                let lot_id = lot_obj_id;
                let winner = this.props.account.get("id");
                AccountActions.confirmDelivery(lot_id, winner, owner)
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

    onNavigate = (lotData, e) => {
        e.preventDefault();

        let lotId = lotData["lot"]["id"];
        let idSplit = lotId.split(".");
        let urlId = idSplit[2];

        this.props.history.push(`/gamezone/scoop/item-${urlId}`);
    };

    render() {
        let lots = this.state.lots;
        let winLots = this.state.winLots;
        let lotsHistory = this.state.lotsHistory;

        let isInfinity = false;

        if (this.state.userSatus === 4) {
            isInfinity = true;
        }

        let statuses = [
            "",
            "",
            counterpart.translate("gamezone.lot-status-01"),
            counterpart.translate("gamezone.lot-status-02")
        ];

        return (
            <div className="game-scoop__wrap">
                <img
                    className="game-scoop__header-logo"
                    src={headerImg}
                    alt="Big Scoop"
                />
                <div className="game-scoop__content">
                    <Tabs
                        className="cwd-tabs"
                        tabsClass="cwd-tabs__list"
                        contentClass="cwd-tabs__content"
                        segmented={false}
                        actionButtons={false}
                    >
                        {/* ACTIVE LOTS */}
                        <Tab title="gamezone.active-lots">
                            <ul className="scoop-list">
                                {lots.map(lot => (
                                    <li
                                        className="scoop-list__item"
                                        key={lot["lot"]["id"]}
                                    >
                                        <div className="scoop-list__wrap">
                                            <div
                                                className="scoop-list__img"
                                                style={{
                                                    cursor: "pointer",
                                                    backgroundImage: `url(${lot[
                                                        "lot"
                                                    ]["img_url"].replace(
                                                        /http+[a-zA-Z0-9.:/]+ipfs/g,
                                                        apiUrl + "/ipfs"
                                                    )})`
                                                }}
                                                onClick={this.onNavigate.bind(
                                                    this,
                                                    lot
                                                )}
                                            >
                                                <span className="scoop-list__subtitle">
                                                    {lot["lot"]["id"]}
                                                </span>
                                            </div>
                                            <div className="scoop-list__inner">
                                                <p className="scoop-list__description">
                                                    {lot["lot"]["description"]}
                                                </p>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.tickets-total"
                                                    />

                                                    <span className="scoop-list__text">
                                                        {
                                                            lot["lot"][
                                                                "total_participants"
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.tickets-price"
                                                    />
                                                    <span className="scoop-list__text">
                                                        {Math.round(
                                                            lot["lot"][
                                                                "ticket_price"
                                                            ]["amount"] * 1.1
                                                        ) / 100000}{" "}
                                                        CWD
                                                    </span>
                                                </div>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.tickets-avaliable"
                                                    />
                                                    <span className="scoop-list__text">
                                                        {lot["lot"][
                                                            "total_participants"
                                                        ] -
                                                            lot["lot"][
                                                                "participants"
                                                            ].length}
                                                    </span>
                                                </div>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.lot_expiration"
                                                    />
                                                    <span className="scoop-list__text">
                                                        <FormattedDate
                                                            value={
                                                                lot["lot"][
                                                                    "expiration"
                                                                ]
                                                            }
                                                            format="full"
                                                        />{" "}
                                                        {" (GMT)"}
                                                    </span>
                                                </div>

                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.owner"
                                                    />
                                                    <span className="scoop-list__text scoop-list__text--user">
                                                        <LinkToAccountById
                                                            account={
                                                                lot["lot"][
                                                                    "owner"
                                                                ]
                                                            }
                                                        />
                                                    </span>
                                                </div>

                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.rating"
                                                    />
                                                    <span className="scoop-list__text">
                                                        {lot["rating"]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className="scoop-list__buy-btn"
                                            onClick={this.lotteryBuyTicket.bind(
                                                this,
                                                lot["lot"]["ticket_price"][
                                                    "amount"
                                                ],
                                                lot["lot"]["id"]
                                            )}
                                        >
                                            <Translate content="gamezone.buy-ticket" />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Tab>

                        {/*  MY WINS */}
                        {this.props.account ? (
                            <Tab
                                title="gamezone.my-wins"
                                onClick={this.getWinsArray}
                            >
                                <ul className="scoop-list">
                                    {winLots.map(wins => (
                                        <li
                                            className="scoop-list__item scoop-list__item--win"
                                            key={wins["id"]}
                                            id={wins["id"]}
                                        >
                                            <div className="scoop-list__img scoop-list__img--win">
                                                <span className="scoop-list__subtitle">
                                                    {wins["id"]}
                                                </span>
                                                <img
                                                    src={wins["img_url"]}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="scoop-list__btn-wrap">
                                                <button
                                                    className="scoop-list__buy-btn scoop-list__buy-btn--contacts"
                                                    onClick={this.showContactsForm.bind(
                                                        this,
                                                        wins["id"]
                                                    )}
                                                    disabled={
                                                        wins["winner_contacts"]
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    <Translate content="gamezone.contacts" />
                                                </button>
                                                <button
                                                    className="scoop-list__buy-btn scoop-list__buy-btn--confirm"
                                                    onClick={this.confirmDelivery.bind(
                                                        this,
                                                        wins["id"],
                                                        wins["owner"]
                                                    )}
                                                >
                                                    <Translate content="gamezone.confirm" />
                                                </button>
                                            </div>
                                            <div
                                                className="scoop-contacts"
                                                id={"win_" + wins["id"]}
                                                ref={"win_" + wins["id"]}
                                            >
                                                <div className="scoop-contacts__inner">
                                                    <Translate
                                                        className="scoop-contacts__title"
                                                        content="gamezone.contacts-title"
                                                        component="p"
                                                    />
                                                    <Translate
                                                        className="scoop-contacts__text"
                                                        content="gamezone.contacts-text"
                                                        component="p"
                                                    />
                                                    <textarea
                                                        className="scoop-contacts__memo"
                                                        rows="7"
                                                        onChange={this.onContactsAdded.bind(
                                                            this
                                                        )}
                                                    />
                                                    <div className="scoop-list__btn-wrap">
                                                        <span
                                                            className="scoop-list__buy-btn scoop-list__buy-btn--contacts"
                                                            onClick={this.sendContacts.bind(
                                                                this,
                                                                wins["id"],
                                                                wins["owner"]
                                                            )}
                                                        >
                                                            <Translate content="gamezone.contacts-btn" />
                                                        </span>
                                                        <span
                                                            className="scoop-list__buy-btn scoop-list__buy-btn--cancel"
                                                            onClick={this.hideContactsForm.bind(
                                                                this,
                                                                wins["id"]
                                                            )}
                                                        >
                                                            <Translate content="gamezone.cancel-btn" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="game-heads__trn-wrap">
                                    <Translate
                                        className="game-heads__text"
                                        content="gamezone.my-scoop-list"
                                        component="span"
                                    />
                                    <RecentTransactions
                                        accountsList={[
                                            this.props.account.get("id")
                                        ]}
                                        compactView={false}
                                        showMore={true}
                                        fullHeight={true}
                                        limit={100}
                                        showFilters={false}
                                        dashboard
                                        multiFilter={[55, 56, 57, 58, 59, 60]}
                                        gamezoneView={true}
                                        shortMode={true}
                                    />
                                </div>
                            </Tab>
                        ) : null}

                        {/* LOTS HISTORY */}
                        <Tab
                            title="gamezone.lots-history"
                            onClick={this.getlotsHistoryArray}
                        >
                            <ul className="scoop-list">
                                {lotsHistory.map(lot => (
                                    <li
                                        className="scoop-list__item"
                                        key={lot["id"]}
                                    >
                                        <div className="scoop-list__wrap">
                                            <div className="scoop-list__img">
                                                <img
                                                    src={lot["img_url"]}
                                                    alt=""
                                                />
                                                <span className="scoop-list__subtitle">
                                                    {lot["id"]}
                                                </span>
                                            </div>
                                            <div className="scoop-list__inner">
                                                <p className="scoop-list__description">
                                                    {lot["description"]}
                                                </p>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.lot-winner"
                                                    />

                                                    <span className="scoop-list__text scoop-list__text--user">
                                                        <LinkToAccountById
                                                            account={
                                                                lot["winner"]
                                                            }
                                                        />
                                                    </span>
                                                </div>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.lot-status"
                                                    />
                                                    <span className="scoop-list__text scoop-list__text--info">
                                                        {
                                                            statuses[
                                                                lot["status"]
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                                <div className="scoop-list__text-wrap">
                                                    <Translate
                                                        className="scoop-list__text"
                                                        content="gamezone.lot-participants"
                                                    />
                                                    <span className="scoop-list__text scoop-list__text--info">
                                                        {
                                                            lot[
                                                                "total_participants"
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Tab>

                        {/* ADD LOT FORM */}
                        {isInfinity ? (
                            <Tab title="gamezone.add-lot">
                                <ScoopForm apiUrl={apiUrl} />
                            </Tab>
                        ) : null}
                    </Tabs>
                </div>
            </div>
        );
    }
}
export default GameScoop = connect(GameScoop, {
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
