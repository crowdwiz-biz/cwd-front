import React from "react";
import { Apis } from "bitsharesjs-ws";
import Translate from "react-translate-component";
import { FormattedDate } from "react-intl";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import WalletDb from "stores/WalletDb";
import { connect } from "alt-react";

//STYLES
import "./scss/game-scoop-current.scss";

class GameScoopItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentLot: null,
            showClipboardAlert: false
        };

        this.copyToBuffer = this.copyToBuffer.bind(this);
    }
    componentDidMount() {
        let url = window.location.pathname;
        let itemId = url.split("-")[1].toString();

        Apis.instance()
            .db_api()
            .exec("get_objects", [["1.17." + itemId]])
            .then(data => {
                if (data[0]) {
                    this.setState({
                        currentLot: data
                    });
                }
            });
    }

    lotteryBuyTicket(amount, lot_obj_id, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => { });

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

    copyToBuffer() {
        this.setState({
            showClipboardAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showClipboardAlert: false });
        }, 2000);

        var copyText = window.location.href;

        navigator.clipboard.writeText(copyText);
    }

    render() {
        let url = window.location.pathname;
        let itemId = url.split("-")[1].toString();

        return (
            <section className="cwd-common__wrap">
                {this.state.currentLot != null ? (
                    <div className="game-scoop-current__item">
                        <div className="game-scoop-current__wrap">
                            <div
                                className="game-scoop-current__img"
                                style={{
                                    backgroundImage: `url(${this.state.currentLot[0]["img_url"]})`
                                }}
                            >
                                <span className="game-scoop-current__subtitle">
                                    {this.state.currentLot[0]["id"]}
                                </span>
                            </div>
                            <div className="game-scoop-current__inner">
                                <p className="game-scoop-current__description">
                                    {this.state.currentLot[0]["description"]}
                                </p>
                                <div className="game-scoop-current__text-wrap">
                                    <Translate
                                        className="game-scoop-current__text"
                                        content="gamezone.tickets-total"
                                    />

                                    <span className="game-scoop-current__text">
                                        {
                                            this.state.currentLot[0][
                                            "total_participants"
                                            ]
                                        }
                                    </span>
                                </div>
                                <div className="game-scoop-current__text-wrap">
                                    <Translate
                                        className="game-scoop-current__text"
                                        content="gamezone.tickets-price"
                                    />
                                    <span className="game-scoop-current__text">
                                        {Math.round(
                                            this.state.currentLot[0][
                                            "ticket_price"
                                            ]["amount"] * 1.1
                                        ) / 100000}{" "}
                                        CWD
                                    </span>
                                </div>
                                <div className="game-scoop-current__text-wrap">
                                    <Translate
                                        className="game-scoop-current__text"
                                        content="gamezone.tickets-avaliable"
                                    />
                                    <span className="game-scoop-current__text">
                                        {this.state.currentLot[0][
                                            "total_participants"
                                        ] -
                                            this.state.currentLot[0][
                                                "participants"
                                            ].length}
                                    </span>
                                </div>

                                {this.state.currentLot[0]["status"] == 0 ? (
                                    <div className="game-scoop-current__text-wrap">
                                        <Translate
                                            className="game-scoop-current__text"
                                            content="gamezone.lot_expiration"
                                        />
                                        <span className="game-scoop-current__text">
                                            <FormattedDate
                                                value={
                                                    this.state.currentLot[0][
                                                    "expiration"
                                                    ]
                                                }
                                                format="full"
                                            />{" "}
                                            {" (GMT)"}
                                        </span>
                                    </div>
                                ) : null}

                                <div className="game-scoop-current__text-wrap">
                                    <Translate
                                        className="game-scoop-current__text"
                                        content="gamezone.owner"
                                    />
                                    <span className="game-scoop-current__text game-scoop-current__text--user">
                                        <LinkToAccountById
                                            account={
                                                this.state.currentLot[0][
                                                "owner"
                                                ]
                                            }
                                        />
                                    </span>
                                </div>

                                {this.state.currentLot[0]["status"] != 0 ? (
                                    <div className="game-scoop-current__text-wrap">
                                        <Translate
                                            className="game-scoop-current__text"
                                            content="gamezone.winner"
                                        />
                                        <span className="game-scoop-current__text game-scoop-current__text--user">
                                            <LinkToAccountById
                                                account={
                                                    this.state.currentLot[0][
                                                    "winner"
                                                    ]
                                                }
                                            />
                                        </span>
                                    </div>
                                ) : null}

                                {this.state.currentLot[0]["status"] == 0 ? (
                                    <div className="game-scoop-current__btn-wrap">
                                        <span
                                            className="game-scoop-current__copy-btn"
                                            onClick={this.copyToBuffer.bind()}
                                        >
                                            {this.state.showClipboardAlert ? (
                                                <Translate
                                                    content="actions.alerts.copy_text" />
                                            ) :
                                                <Translate content="gamezone.copy_btn" />
                                            }
                                        </span>

                                        <span
                                            className="game-scoop-current__buy-btn"
                                            onClick={this.lotteryBuyTicket.bind(
                                                this,
                                                this.state.currentLot[0][
                                                "ticket_price"
                                                ]["amount"],
                                                this.state.currentLot[0]["id"]
                                            )}
                                        >
                                            <Translate content="gamezone.buy-ticket" />
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Translate
                        className="game-scoop-current__not-found-text"
                        content="gamezone.lot_not_found"
                        id={"1.17." + itemId}
                    />
                )}
            </section>
        );
    }
}

export default GameScoopItem = connect(GameScoopItem, {
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
