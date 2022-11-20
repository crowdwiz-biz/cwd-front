import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import counterpart from "counterpart";
import { Apis } from "bitsharesjs-ws";
import AccountStore from "stores/AccountStore";
import { ChainStore } from "bitsharesjs";
import { connect } from "alt-react";
import { Link } from "react-router-dom";


//STYLES
import "../scss/cwdgateway-active.scss";
import "../scss/cwdgateway-popup.scss";
import "../scss/cwdgateway.scss";

class SingleTradeItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleTrade: {},
            showModal: false,
            isDisabled: true,
            userBalance: 0,
            showClipboardAlert: false,
            intervalID: 0
        };

        this.closeBuyModal = this.closeBuyModal.bind(this);
        this.openTradeModal = this.openTradeModal.bind(this);

        this.isSellLocked = this.isSellLocked.bind(this);
        this.isBuyLocked = this.isBuyLocked.bind(this);

        this.sellAmountValidate = this.sellAmountValidate.bind(this);
        this.buyAmountValidate = this.buyAmountValidate.bind(this);
        this.sellAsset = this.sellAsset.bind(this);

        this.getBalance = this.getBalance.bind(this);
    }

    componentWillMount() {
        let url = window.location.pathname;
        let itemId = url.split("-")[1].toString();

        Apis.instance()
            .db_api()
            .exec("get_objects", [["1.20." + itemId]])
            .then(data => {

                Apis.instance()
                    .db_api()
                    .exec("get_objects", [["2.6." + data[0]['p2p_gateway'].split(".")[2]]])
                    .then(stats => {
                        if (stats[0]) {
                            this.setState({
                                singleTrade: data[0],
                                rating: stats[0]["p2p_first_month_rating"] + stats[0]["p2p_current_month_rating"],
                                volume: stats[0]["p2p_deals_volume"],
                            });

                            if (data[0]["adv_type"]) {
                                this.setState({
                                    intervalID: setInterval(this.getBalance(stats[0]["name"], "CWD"), 5000)
                                });
                            }
                            else {
                                this.setState({
                                    intervalID: setInterval(this.getBalance(this.props.currentAccount.get("id"), "CWD"), 5000)
                                });
                            }
                        }
                    });
            });
        ;
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getBalance(user, asset) {
        let precision;
        let assetID;

        Apis.instance()
            .db_api()
            .exec("get_assets", [[asset]])
            .then(assetObj => {
                precision = assetObj[0]["precision"];
                assetID = assetObj[0]["id"];

                Apis.instance()
                    .db_api()
                    .exec("get_account_balances", [user, [assetID]])
                    .then(accountObj => {
                        this.setState({
                            userBalance:
                                accountObj[0]["amount"] /
                                Math.pow(10, precision)
                        });
                    });
            });
    }

    closeBuyModal() {
        this.setState({
            showModal: false
        });

        this.props.history.push(`/gateway/dex`);
    }

    openTradeModal() {
        let isScam = false;
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        if (this.props.currentAccount && scamAccounts) {
            isScam =
                scamAccounts
                    .get("blacklisted_accounts")
                    .indexOf(this.props.currentAccount.get("id")) >= 0;

            if (!isScam) {
                this.setState(
                    {
                        showModal: true
                    },
                    () => {
                        let singleTrade = this.state.singleTrade;
                        let singleTradeMin;
                        if (singleTrade["min_cwd"] == 0) {
                            singleTradeMin = 1;
                        } else {
                            singleTradeMin = singleTrade["min_cwd"] / 100000;
                        }
                        document.getElementById(
                            "popupAmount_" + singleTrade["id"]
                        ).value = singleTradeMin;
                    }
                );
            }
        }
    }

    isSellLocked(tradeID, price, currency, traderId, e) {
        e.preventDefault();
        let currentAccount = this.props.currentAccount.get("id");
        let amount =
            parseInt(document.getElementById("popupAmount_" + tradeID).value) *
            100000;
        let details = document.getElementById("popupSellDetails_" + tradeID)
            .value;

        if (this.props.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();

                        this.sellAsset(
                            tradeID,
                            price,
                            currency,
                            traderId,
                            currentAccount,
                            amount,
                            details
                        );
                    })
                    .catch(() => { });
            } else {
                this.sellAsset(
                    tradeID,
                    price,
                    currency,
                    traderId,
                    currentAccount,
                    amount,
                    details
                );
            }
        }
    }

    sellAsset(
        tradeID,
        price,
        currency,
        traderId,
        currentAccount,
        amount,
        details
    ) {
        AccountActions.createP2pOrder(
            tradeID,
            amount,
            price,
            traderId,
            currentAccount,
            details
        )
        this.closeBuyModal();
    }

    sellAmountValidate(inputId, min, max) {
        let docAmountValue = document.getElementById("popupAmount_" + inputId)
            .value;

        if (docAmountValue == "") {
            docAmountValue = 0;
        }

        let amountValue = parseFloat(docAmountValue) * 100000;
        let descriptionValue = document.getElementById(
            "popupSellDetails_" + inputId
        ).value;

        let userAmount = parseFloat(docAmountValue);

        this.setState({
            totalSumm: userAmount
        });

        if (
            amountValue >= min &&
            amountValue <= max &&
            descriptionValue.length > 5
        ) {
            this.setState({
                isDisabled: false
            });
        } else {
            this.setState({
                isDisabled: true
            });
        }
    }

    isBuyLocked(tradeID, price, currency, traderId, e) {
        e.preventDefault();
        let currentAccount = this.props.currentAccount.get("id");
        let amount =
            parseInt(document.getElementById("popupAmount_" + tradeID).value) *
            100000;

        if (this.props.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.buyAsset(
                            tradeID,
                            price,
                            currency,
                            traderId,
                            currentAccount,
                            amount
                        );
                    })
                    .catch(() => { });
            } else {
                this.buyAsset(
                    tradeID,
                    price,
                    currency,
                    traderId,
                    currentAccount,
                    amount
                );
            }
        }
    }

    buyAsset(tradeID, price, currency, traderId, currentAccount, amount) {
        AccountActions.createP2pOrder(
            tradeID,
            amount,
            price,
            traderId,
            currentAccount
        )
        this.closeBuyModal();
    }

    buyAmountValidate(inputId, min, max) {
        // user amount count
        let docAmountValue = document.getElementById("popupAmount_" + inputId).value;

        if (docAmountValue == "") {
            docAmountValue = 0;
        }

        let userAmount = parseFloat(docAmountValue);

        this.setState({
            totalSumm: userAmount
        });

        // is amount valid
        let amountValue =
            parseInt(document.getElementById("popupAmount_" + inputId).value) *
            100000;

        if (amountValue >= min && amountValue <= max) {
            this.setState({
                valideAmount: true
            });
        } else {
            this.setState({
                valideAmount: false
            });
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
        let activeItem = this.state.singleTrade;
        if (Object.keys(activeItem).length === 0) {
            return (null);
        }

        else {
            let showModal = this.state.showModal;
            let rating = this.state.rating;
            let volume = this.state.volume / 100000;

            let advType = this.state.singleTrade["adv_type"]
                ? counterpart.translate("cwdgateway.exchange.type_sell")
                : counterpart.translate("cwdgateway.exchange.type_buy");

            let price = parseFloat(activeItem["price"] / 100000000)
                .toFixed(8)
                .toString()
                .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

            let userBalance = this.state.userBalance;
            let minCwdLimit = activeItem["min_cwd"] / 100000;
            let maxCwdLimit = (activeItem["max_cwd"] / 100000) - 2;

            let isTop = this.props.isTop;
            let exRate = parseFloat(activeItem["price"] / 100000000);
            let totalSumm = this.state.singleTrade["min_cwd"] / 100000;


            return (
                <section className="cwd-common__wrap">
                    <Link to="/gateway/dex" className="cwdgateway__back-link">
                        <Translate
                            content="cwdgateway.go_to_dexlist"
                        />
                    </Link>

                    <div className="cwdgateway-active__item cwdgateway-active__item--static">
                        <div className="cwdgateway-active__wrap">
                            <div className="cwdgateway-active__inner">
                                {/* DEX ID  */}
                                <span className="cwdgateway-active__item-id">
                                    #{activeItem["id"]}
                                </span>

                                <span className="cwdgateway-active__name">
                                    {advType}
                                </span>
                                <p className="cwdgateway-active__desc">
                                    {activeItem["adv_description"]}
                                </p>

                                <div className="cwdgateway-active__row">
                                    <Translate
                                        className="cwdgateway-active__text"
                                        content="cwdgateway.quantity"
                                    />

                                    {this.state.singleTrade["adv_type"] ?
                                        // GATEWAY SELLS CWD
                                        (<span className="cwdgateway-active__text cwdgateway-active__text--data">
                                            {activeItem["min_cwd"] / 100000}&nbsp;-&nbsp;

                                            {userBalance < activeItem["max_cwd"] / 100000 ?
                                                Math.floor(userBalance)
                                                :
                                                Math.floor(activeItem["max_cwd"] / 100000)
                                            }
                                            &nbsp;CWD
                                        </span>)
                                        :
                                        // GATEWAY BUYS CWD
                                        (userBalance < minCwdLimit ?
                                            <span className="cwdgateway-active__non-balance">
                                                <Translate
                                                    className="cwdgateway-active__text"
                                                    content="cwdgateway.non_balance"
                                                />
                                                {""}
                                                <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                                    {minCwdLimit}
                                                    &nbsp;CWD
                                                </span>
                                            </span>
                                            :
                                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                                {minCwdLimit}&nbsp;-&nbsp;

                                                {userBalance < maxCwdLimit ?
                                                    Math.floor(userBalance)
                                                    :
                                                    Math.floor(maxCwdLimit)
                                                }
                                                &nbsp;CWD
                                            </span>
                                        )
                                    }
                                </div>

                                <div className="cwdgateway-active__row">
                                    <Translate
                                        className="cwdgateway-active__text"
                                        content="cwdgateway.price"
                                    />
                                    <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                        {price}&nbsp;
                                        {activeItem["currency"]}
                                    </span>
                                </div>

                                <div className="cwdgateway-active__row">
                                    <Translate
                                        className="cwdgateway-active__text"
                                        content="cwdgateway.time_limit"
                                    />
                                    <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                        {activeItem["timelimit_for_reply"] / 60}&nbsp;
                                        <Translate
                                            className="cwdgateway-active__text"
                                            content="cwdgateway.min"
                                        />
                                    </span>
                                </div>

                                <div className="cwdgateway-active__row">
                                    <Translate
                                        className="cwdgateway-active__text"
                                        content="cwdgateway.geo"
                                    />
                                    <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                        {activeItem["geo"]}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="cwdgateway-active__p2p-info-wrap">
                                    <div className="cwdgateway-active__row">
                                        <Translate
                                            className="cwdgateway-active__text"
                                            content="cwdgateway.exchange.trader"
                                        />
                                        <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                            <LinkToAccountById
                                                account={activeItem["p2p_gateway"]}
                                            />
                                        </span>
                                    </div>

                                    <div className="cwdgateway-active__row">
                                        <Translate
                                            className="cwdgateway-active__text"
                                            content="cwdgateway.rating"
                                        />
                                        <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                            {rating}
                                            {isTop ? (
                                                <NewIcon
                                                    iconWidth={16}
                                                    iconHeight={16}
                                                    iconName={"star_icon"}
                                                />
                                            ) : null}
                                        </span>
                                    </div>

                                    <div className="cwdgateway-active__row">
                                        <Translate
                                            className="cwdgateway-active__text"
                                            content="cwdgateway.volume"
                                        />
                                        <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                            {volume}&nbsp;CWD
                                        </span>
                                    </div>
                                </div>

                                {this.state.singleTrade["adv_type"] ?
                                    // GATEWAY SELLS CWD
                                    <button
                                        className="cwdgateway__btn"
                                        type="button"
                                        onClick={this.openTradeModal.bind()}
                                    >
                                        <Translate content="cwdgateway.buy_btn" />
                                    </button>
                                    :

                                    // GATEWAY BUYS CWD
                                    <button
                                        className="cwdgateway__btn"
                                        type="button"
                                        onClick={this.openTradeModal.bind(
                                            this,
                                            "cwdgatewayPopup_" + activeItem["id"]
                                        )}
                                        disabled={userBalance < minCwdLimit ? true : false}
                                    >
                                        <Translate content="cwdgateway.sell_btn" />
                                    </button>
                                }

                                <div
                                    className="cwdgateway__copy-btn"
                                    onClick={this.copyToBuffer.bind(this)}
                                >
                                    <Translate content="cwdgateway.copy_btn" />
                                    <NewIcon
                                        iconWidth={20}
                                        iconHeight={20}
                                        iconName={"icon_copy"}
                                    />
                                </div>
                                {this.state.showClipboardAlert ? (
                                    <Translate
                                        className="cwdgateway__alert"
                                        content="actions.alerts.copy_text" />
                                ) : null}
                            </div>
                        </div>

                        {/* TRADE POPUP */}

                        {this.state.singleTrade["adv_type"] ?
                            // GATEWAY SELLS CWD
                            showModal ? (
                                <div>
                                    <div className="cwdgateway-popup">
                                        <NewIcon
                                            iconClass="cwdgateway-popup__modal-close"
                                            iconWidth={16}
                                            iconHeight={16}
                                            iconName={"cross"}
                                            onClick={this.closeBuyModal.bind()}
                                        />
                                        <div className="cwdgateway-popup__inner cwdgateway-popup__inner--top-block">
                                            <Translate
                                                className="cwdgateway-popup__text"
                                                content="cwdgateway.ads.buy_text"
                                            />

                                            <input
                                                className="cwdgateway__field"
                                                type="number"
                                                min={activeItem["min_cwd"]}
                                                max={activeItem["max_cwd"]}
                                                name="popupBuyAmount"
                                                id={"popupAmount_" + activeItem["id"]}
                                                onChange={this.buyAmountValidate.bind(
                                                    this,
                                                    activeItem["id"],
                                                    activeItem["min_cwd"],
                                                    activeItem["max_cwd"]
                                                )}
                                            />
                                        </div>

                                        <div className="cwdgateway-active__row cwdgateway-active__row--summ-wrap cwdgateway-active__row--modal-block">
                                            <Translate
                                                className="cwdgateway-active__text"
                                                content="cwdgateway.amount"
                                            />
                                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--summ">
                                                {Math.round(totalSumm * exRate * 100) / 100}
                                                &nbsp;{activeItem["currency"]}
                                            </span>
                                        </div>

                                        <button
                                            className="cwdgateway__btn"
                                            type="button"
                                            onClick={this.isBuyLocked.bind(
                                                this,
                                                activeItem["id"],
                                                activeItem["price"],
                                                activeItem["currency"],
                                                activeItem["p2p_gateway"]
                                            )}
                                            disabled={!this.state.valideAmount}
                                        >
                                            <Translate content="cwdgateway.buy_btn" />
                                        </button>
                                    </div>
                                    {/* OVERLAY */}
                                    <div className="cwdgateway-popup__overlay"></div>
                                </div>) : null
                            :

                            // GATEWAY BUYS CWD
                            showModal ? (
                                <div>
                                    <div
                                        className="cwdgateway-popup cwdgateway-popup--sell"
                                        id={"cwdgatewayPopup_" + activeItem["id"]}
                                    >
                                        <NewIcon
                                            iconClass="cwdgateway-popup__modal-close"
                                            iconWidth={16}
                                            iconHeight={16}
                                            iconName={"cross"}
                                            onClick={this.closeBuyModal.bind(
                                                this,
                                                "cwdgatewayPopup_" + activeItem["id"]
                                            )}
                                        />

                                        <div className="cwdgateway-popup__inner cwdgateway-popup__inner--top-block">
                                            <Translate
                                                className="cwdgateway-popup__text"
                                                content="cwdgateway.ads.sell_text"
                                            />

                                            <input
                                                className="cwdgateway__field"
                                                type="number"
                                                min={activeItem["min_cwd"]}
                                                max={activeItem["max_cwd"] - 200000}
                                                name="popupSellAmount"
                                                id={"popupAmount_" + activeItem["id"]}
                                                onChange={this.sellAmountValidate.bind(
                                                    this,
                                                    activeItem["id"],
                                                    activeItem["min_cwd"],
                                                    activeItem["max_cwd"] - 200000
                                                )}
                                            />
                                        </div>

                                        <div className="cwdgateway-active__row cwdgateway-active__row--summ-wrap cwdgateway-active__row--modal-block">
                                            <Translate
                                                className="cwdgateway-active__text"
                                                content="cwdgateway.amount_to_get"
                                            />
                                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--summ">
                                                {Math.round(totalSumm * exRate * 100) / 100}
                                                &nbsp;{activeItem["currency"]}
                                            </span>
                                        </div>

                                        <div className="cwdgateway-popup__inner">
                                            <Translate
                                                className="cwdgateway-popup__text"
                                                content="cwdgateway.ads.trade_description"
                                            />

                                            <textarea
                                                className="cwdgateway__field cwdgateway__field--desc"
                                                type="text"
                                                name="popupSellDetails"
                                                id={"popupSellDetails_" + activeItem["id"]}
                                                onChange={this.sellAmountValidate.bind(
                                                    this,
                                                    activeItem["id"],
                                                    activeItem["min_cwd"],
                                                    activeItem["max_cwd"] - 200000
                                                )}
                                                rows="3"
                                            />
                                        </div>

                                        <button
                                            className="cwdgateway__btn"
                                            type="button"
                                            onClick={this.isSellLocked.bind(
                                                this,
                                                activeItem["id"],
                                                activeItem["price"],
                                                activeItem["currency"],
                                                activeItem["p2p_gateway"]
                                            )}
                                            disabled={this.state.isDisabled}
                                        >
                                            <Translate content="cwdgateway.sell_btn" />
                                        </button>
                                    </div>
                                    {/* OVERLAY */}
                                    <div className="cwdgateway-popup__overlay"></div>
                                </div>) : null
                        }
                    </div>
                </section >
            );
        }
    }
}

export default SingleTradeItem = connect(SingleTradeItem, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                currentAccount: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
