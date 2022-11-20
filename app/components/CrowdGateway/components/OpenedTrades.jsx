import React from "react";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import NewIcon from "../../NewIcon/NewIcon";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import counterpart from "counterpart";
import MemoText from "../../Blockchain/MemoText";
import MemoImg from "../../Blockchain/MemoImg";
import ls from "common/localStorage";

let ss = new ls("__graphene__");
let apiUrl = ss.get("serviceApi");

//STYLES
import "../scss/cwdgateway-active.scss";

class OpenedTrades extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openTrades: this.props.openTrades.po,
            currentAccount: this.props.currentAccount,
            showModal: false,
            valideDisput: true,
            showComfirmModal: false,
            isGateway:
                this.props.openTrades.po["p2p_gateway"] ==
                this.props.currentAccount,
            userImg: apiUrl + "/static/cwd_preview.jpg",
            imgResult: false
        };

        this.openTradeModal = this.openTradeModal.bind(this);
        this.closeTradeModal = this.closeTradeModal.bind(this);
        this.openConfirmModal = this.openConfirmModal.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);

        this.validateForm = this.validateForm.bind(this);

        this.confirmTrade = this.confirmTrade.bind(this);
        this.confirmPayment = this.confirmPayment.bind(this);

        this.cancelTrade = this.cancelTrade.bind(this);
        this.completeTrade = this.completeTrade.bind(this);

        this.openDispute = this.openDispute.bind(this);
        this.replyDispute = this.replyDispute.bind(this);

        this.loadImgToIpfs = this.loadImgToIpfs.bind(this);
    }

    // modal functions
    openTradeModal() {
        this.setState({
            showModal: true
        });
    }

    closeTradeModal() {
        this.setState({
            showModal: false
        });
    }

    // confirm modal functions
    openConfirmModal() {
        this.setState({
            showComfirmModal: true
        });
    }

    closeConfirmModal() {
        this.setState({
            showComfirmModal: false
        });
    }

    validateForm() {
        let descriptionValue = document.getElementById("popupDisput").value;

        if (descriptionValue.length > 5) {
            this.setState({
                valideDisput: false
            });
        } else {
            this.setState({
                valideDisput: true
            });
        }
    }

    // trade operations functions
    confirmTrade() {
        if (this.state.currentAccount) {
            let descriptionValue = document.getElementById("popupDisput").value;

            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        AccountActions.callP2pOrder(
                            this.props.openTrades.po.id,
                            this.props.openTrades.po.p2p_gateway,
                            this.props.openTrades.po.p2p_client,
                            this.props.openTrades.po.amount.amount,
                            this.props.openTrades.po.price,
                            descriptionValue
                        );
                        this.closeTradeModal();
                    })
                    .catch(() => { });
            } else {
                AccountActions.tryToSetCurrentAccount();
                AccountActions.callP2pOrder(
                    this.props.openTrades.po.id,
                    this.props.openTrades.po.p2p_gateway,
                    this.props.openTrades.po.p2p_client,
                    this.props.openTrades.po.amount.amount,
                    this.props.openTrades.po.price,
                    descriptionValue
                );
                this.closeTradeModal();
            }
        }
    }

    confirmPayment() {
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        if (this.props.openTrades.po.order_type) {
                            AccountActions.paymentP2pOrder(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_client,
                                this.props.openTrades.po.p2p_gateway,
                                this.state.userImg
                            );
                        } else {
                            AccountActions.paymentP2pOrder(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_gateway,
                                this.props.openTrades.po.p2p_client,
                                this.state.userImg
                            );
                        }
                        this.closeConfirmModal();
                    })
                    .catch(() => { });
            } else {
                AccountActions.tryToSetCurrentAccount();
                if (this.props.openTrades.po.order_type) {
                    AccountActions.paymentP2pOrder(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_client,
                        this.props.openTrades.po.p2p_gateway,
                        this.state.userImg
                    );
                } else {
                    AccountActions.paymentP2pOrder(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_gateway,
                        this.props.openTrades.po.p2p_client,
                        this.state.userImg
                    );
                }
                this.closeConfirmModal();
            }
        }
    }

    cancelTrade(isBlackListed) {
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        AccountActions.cancelP2pOrder(
                            this.props.openTrades.po.id,
                            this.props.openTrades.po.p2p_gateway,
                            this.props.openTrades.po.p2p_client,
                            isBlackListed
                        );
                    })
                    .catch(() => { });
            } else {
                AccountActions.tryToSetCurrentAccount();
                AccountActions.cancelP2pOrder(
                    this.props.openTrades.po.id,
                    this.props.openTrades.po.p2p_gateway,
                    this.props.openTrades.po.p2p_client,
                    isBlackListed
                );
            }
        }
    }

    completeTrade() {
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        if (this.props.openTrades.po.order_type) {
                            AccountActions.release_p2p_order(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_client,
                                this.props.openTrades.po.p2p_gateway
                            );
                        } else {
                            AccountActions.release_p2p_order(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_gateway,
                                this.props.openTrades.po.p2p_client
                            );
                        }
                    })
                    .catch(() => { });
            } else {
                AccountActions.tryToSetCurrentAccount();
                if (this.props.openTrades.po.order_type) {
                    AccountActions.release_p2p_order(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_client,
                        this.props.openTrades.po.p2p_gateway
                    );
                } else {
                    AccountActions.release_p2p_order(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_gateway,
                        this.props.openTrades.po.p2p_client
                    );
                }
            }
        }
    }

    openDispute() {
        let descriptionValue = document.getElementById("popupDisput").value;

        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        if (
                            this.state.currentAccount ==
                            this.props.openTrades.po.p2p_gateway
                        ) {
                            AccountActions.openP2pDispute(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_gateway,
                                this.props.openTrades.po.p2p_client,
                                "1.2.3335",
                                descriptionValue
                            );
                        } else {
                            AccountActions.openP2pDispute(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_client,
                                this.props.openTrades.po.p2p_gateway,
                                "1.2.3335",
                                descriptionValue
                            );
                        }
                    })
                    .catch(() => { });
                this.closeTradeModal();
            } else {
                AccountActions.tryToSetCurrentAccount();
                if (
                    this.state.currentAccount ==
                    this.props.openTrades.po.p2p_gateway
                ) {
                    AccountActions.openP2pDispute(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_gateway,
                        this.props.openTrades.po.p2p_client,
                        "1.2.3335",
                        descriptionValue
                    );
                } else {
                    AccountActions.openP2pDispute(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_client,
                        this.props.openTrades.po.p2p_gateway,
                        "1.2.3335",
                        descriptionValue
                    );
                }
                this.closeTradeModal();
            }
        }
    }

    replyDispute() {
        let descriptionValue = document.getElementById("popupDisput").value;

        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        if (
                            this.state.currentAccount ==
                            this.props.openTrades.po.p2p_gateway
                        ) {
                            AccountActions.replyP2pDispute(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_gateway,
                                this.props.openTrades.po.p2p_client,
                                "1.2.3335",
                                descriptionValue
                            );
                        } else {
                            AccountActions.replyP2pDispute(
                                this.props.openTrades.po.id,
                                this.props.openTrades.po.p2p_client,
                                this.props.openTrades.po.p2p_gateway,
                                "1.2.3335",
                                descriptionValue
                            );
                        }
                    })
                    .catch(() => { });
                this.closeTradeModal();
            } else {
                AccountActions.tryToSetCurrentAccount();
                if (
                    this.state.currentAccount ==
                    this.props.openTrades.po.p2p_gateway
                ) {
                    AccountActions.replyP2pDispute(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_gateway,
                        "1.2.3335",
                        descriptionValue
                    );
                } else {
                    AccountActions.replyP2pDispute(
                        this.props.openTrades.po.id,
                        this.props.openTrades.po.p2p_client,
                        "1.2.3335",
                        descriptionValue
                    );
                }
                this.closeTradeModal();
            }
        }
    }

    loadImgToIpfs() {
        var file = document.getElementById("userLotImg");
        var formData = new FormData();
        let fetchUrl = apiUrl + "/upload_cwdex";

        formData.append("file0", file.files[0]);

        fetch(fetchUrl, {
            method: "POST",
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    userImg: apiUrl + "/ipfs/" + data,
                    imgResult: true
                });
            })
            .catch(error => console.log(error));
    }

    render() {
        let openTrades = this.props.openTrades.po;
        let openTradesDescription = this.props.openTrades.description;

        let showModal = this.state.showModal;
        let showComfirmModal = this.state.showComfirmModal;
        let advType = openTrades["order_type"]
            ? counterpart.translate("cwdgateway.exchange.type_sell")
            : counterpart.translate("cwdgateway.exchange.type_buy");
        let advTypeBool = openTrades["order_type"];

        let isGateway = this.state.isGateway;
        let buttonBlock;
        let textMessage;
        let memoComponent;
        let memoComponentImg;

        if (openTrades.payment_details) {
            memoComponent = <MemoText memo={openTrades.payment_details} />;
        }
        if (openTrades.file_hash) {
            memoComponentImg = <MemoImg memo={openTrades.file_hash} />;
        }
        // FOR GATEWAY
        if (advTypeBool && isGateway && openTrades["status"] == 1) {
            buttonBlock = 1; //The client wants to buy CWD from gateway and gateway must in this case either confirm the transaction and freeze their crowds or cancel the transaction BUTTONS: CONFIRM ORDER and CANCEL
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_1"
                ) +
                new Date(
                    openTrades["time_for_approve"] + "Z"
                ).toLocaleDateString("en-EN", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });
        }
        if (advTypeBool && isGateway && openTrades["status"] == 2) {
            buttonBlock = 2; //The client wants to buy CWD from Gateway and Gateway has confirmed the transaction and is now waiting for the client to confirm the payment, can't do anything. At the same time, a memo text should be shown . BUTTONS: none
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_2"
                ) +
                new Date(openTrades["time_for_reply"] + "Z").toLocaleDateString(
                    "en-EN",
                    {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }
        if (!advTypeBool && isGateway && openTrades["status"] == 2) {
            buttonBlock = 3; //The client wants to sell CWD to gateway in this case, the transaction is immediately confirmed and the client's crowds are frozen. In this case, Gateway can either confirm the transfer or cancel the transaction. At the same time, a memo text should be shown.  BUTTONS: CONFIRM PAYMENT and CANCEL
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_3"
                ) +
                new Date(openTrades["time_for_reply"] + "Z").toLocaleDateString(
                    "en-EN",
                    {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }
        if (!advTypeBool && isGateway && openTrades["status"] == 3) {
            buttonBlock = 4; //The client wants to sell CWD to Gateway and Gateway has confirmed the transfer of funds. Now he can expect the successful completion of the transaction or open a dispute. At the same time, a memo text should be shown. BUTTONS: OPEN DISPUTE
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_4"
            );
        }
        if (advTypeBool && isGateway && openTrades["status"] == 3) {
            buttonBlock = 5; //The client wants to buy a CWD from Gateway. The client confirmed the payment. In this case, the gateway can either confirm receipt of funds and successfully complete the transaction or open a dispute. At the same time, a memo text should be shown. BUTTONS: COMPLETE THE TRANSACTION AND OPEN DISPUTE
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_5"
            );
        }
        // FOR CLIENT
        if (advTypeBool && !isGateway && openTrades["status"] == 1) {
            buttonBlock = 6; //The client wants to buy CWD from Gateway, in this case the client is waiting for confirmation of the application from gateway. BUTTONS: none
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_6"
                ) +
                new Date(
                    openTrades["time_for_approve"] + "Z"
                ).toLocaleDateString("en-EN", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });
        }
        if (advTypeBool && !isGateway && openTrades["status"] == 2) {
            buttonBlock = 7; //The client wants to buy CWD from gateway, the order is confirmed by gateway, the client must confirm the payment, also in this case we show memo. BUTTONS: CONFIRM PAYMENT
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_7"
                ) +
                new Date(openTrades["time_for_reply"] + "Z").toLocaleDateString(
                    "en-EN",
                    {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }
        if (!advTypeBool && !isGateway && openTrades["status"] == 2) {
            buttonBlock = 8; //The client wants to sell CWD to gateway in this case, the transaction is immediately confirmed and the client's crowds are frozen. At the same time, a memo text should be shown. BUTTONS: none
            textMessage =
                counterpart.translate(
                    "cwdgateway.exchange.open_trades.trade_status_text_8"
                ) +
                new Date(openTrades["time_for_reply"] + "Z").toLocaleDateString(
                    "en-EN",
                    {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }
        if (!advTypeBool && !isGateway && openTrades["status"] == 3) {
            buttonBlock = 9; //The client wants to sell CWD to Gateway and Gateway has confirmed the transfer of funds. In this case, the client can confirm receipt of funds and successfully complete the order. At the same time, a memo text should be shown. BUTTONS: CONFIRM RECEIVING OF FUNDS
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_9"
            );
        }
        if (advTypeBool && !isGateway && openTrades["status"] == 3) {
            buttonBlock = 10; //The client wants to buy a CWD from Gateway. The client confirmed the payment. Now he can expect a successful completion of the transaction. At the same time, a memo text should be shown.
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_10"
            );
        }

        let confirmTradeBtn = false;
        if ([1].indexOf(buttonBlock) != -1) {
            confirmTradeBtn = true;
        }
        let cancelTradeBtn = false;
        if ([1, 3].indexOf(buttonBlock) != -1) {
            cancelTradeBtn = true;
        }
        let blackListBtn = false;
        if ([1, 3].indexOf(buttonBlock) != -1) {
            blackListBtn = true;
        }
        let confirmPaymentBtn = false;
        if ([3, 7].indexOf(buttonBlock) != -1) {
            confirmPaymentBtn = true;
        }
        let completeTradeBtn = false;
        if ([2, 5, 8, 9].indexOf(buttonBlock) != -1) {
            completeTradeBtn = true;
        }
        let openDisputeBtn = false;
        if ([4, 5, 9, 10].indexOf(buttonBlock) != -1) {
            openDisputeBtn = true;
        }
        let replyDisputeBtn = false;
        if (openTrades["status"] == 4) {
            replyDisputeBtn = true;
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_11"
            );
        }
        if (
            openTrades["status"] == 4 &&
            ((advTypeBool && isGateway) || (!advTypeBool && !isGateway))
        ) {
            completeTradeBtn = true;
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_12"
            );
        }
        if (openTrades["status"] == 5) {
            textMessage = counterpart.translate(
                "cwdgateway.exchange.open_trades.trade_status_text_12"
            );
            if ((advTypeBool && isGateway) || (!advTypeBool && !isGateway)) {
                completeTradeBtn = true;
            }
        }

        let price = parseFloat(openTrades["price"] / 100000000)
            .toFixed(8)
            .toString()
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

        let summ = parseFloat(
            (openTrades["price"] * openTrades["amount"]["amount"]) /
            100000 /
            100000000
        )
            .toFixed(8)
            .toString()
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

        return (
            <li className="cwdgateway-active__item cwdgateway-active__item--static">
                <div className="cwdgateway-active__wrap">
                    <div className="cwdgateway-active__inner cwdgateway-active__inner--non-p2p-block">
                        {/* DEX ID  */}
                        <span className="cwdgateway-active__item-id">
                            #{openTrades["id"]}
                        </span>

                        <span className="cwdgateway-active__name">
                            {advType}
                        </span>
                        <p className="cwdgateway-active__desc">
                            {openTradesDescription}
                        </p>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.quantity"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                {openTrades["amount"]["amount"] / 100000}
                                &nbsp;CWD
                            </span>
                        </div>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.price"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                {price}&nbsp;
                                {openTrades["currency"]}
                            </span>
                        </div>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.exchange.trader"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                <LinkToAccountById
                                    account={openTrades["p2p_gateway"]}
                                />
                            </span>
                        </div>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.exchange.client"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                <LinkToAccountById
                                    account={openTrades["p2p_client"]}
                                />
                            </span>
                        </div>

                        <div className="cwdgateway-active__row cwdgateway-active__row--summ-wrap">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.amount"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--summ">
                                {summ}&nbsp;{openTrades["currency"]}
                            </span>
                        </div>
                    </div>

                    {/*TEXT BLOCK*/}
                    <div>
                        <div className="cwdgateway-active__row cwdgateway-active__row--message">
                            <span className="cwdgateway-active__text">
                                {textMessage}
                            </span>
                        </div>

                        {memoComponent ? (
                            <div className="cwdgateway-active__row cwdgateway-active__memo">
                                <span>{memoComponent}</span>
                            </div>
                        ) : null}
                        {memoComponentImg ? (
                            <div className="cwdgateway-active__row cwdgateway-active__memo">
                                <span>{memoComponentImg}</span>
                            </div>
                        ) : null}
                    </div>

                    {/* BTN BLOCK */}
                    <div className="cwdgateway__btn-block">
                        {confirmTradeBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.openTradeModal.bind(this)}
                                >
                                    <Translate content="cwdgateway.confirm_trade_btn" />
                                </button>
                            </div>
                        ) : null}

                        {cancelTradeBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.cancelTrade.bind(this, false)}
                                >
                                    <Translate content="cwdgateway.cancel_trade_btn" />
                                </button>
                            </div>
                        ) : null}

                        {blackListBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.cancelTrade.bind(this, true)}
                                >
                                    <Translate content="cwdgateway.black_list_btn" />
                                </button>
                            </div>
                        ) : null}

                        {confirmPaymentBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.openConfirmModal.bind(this)}
                                >
                                    <Translate content="cwdgateway.confirm_payment_btn" />
                                </button>
                            </div>
                        ) : null}

                        {completeTradeBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.completeTrade.bind(this)}
                                >
                                    <Translate content="cwdgateway.confirm_funds" />
                                </button>
                            </div>
                        ) : null}

                        {openDisputeBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.openTradeModal.bind(this)}
                                >
                                    <Translate content="cwdgateway.disput_btn" />
                                </button>
                            </div>
                        ) : null}

                        {replyDisputeBtn ? (
                            <div className="cwdgateway__btn-wrap">
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.openTradeModal.bind(this)}
                                >
                                    <Translate content="cwdgateway.disput_reply" />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* TRADE MODAL */}
                {showModal ? (
                    <div>
                        <div className="cwdgateway-popup cwdgateway-popup--disput">
                            <NewIcon
                                iconClass="cwdgateway-popup__modal-close"
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"cross"}
                                onClick={this.closeTradeModal.bind()}
                            />
                            <div className="cwdgateway-popup__inner">
                                {confirmTradeBtn ? (
                                    <Translate
                                        className="cwdgateway-popup__text"
                                        content="cwdgateway.my_trades.trade_confirm_text"
                                    />
                                ) : (
                                    <Translate
                                        className="cwdgateway-popup__text"
                                        content="cwdgateway.my_trades.disput_text"
                                    />
                                )}

                                <textarea
                                    className="cwdgateway__field"
                                    id="popupDisput"
                                    rows="7"
                                    name="description"
                                    onChange={this.validateForm.bind()}
                                />
                            </div>

                            {confirmTradeBtn ? (
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.confirmTrade.bind(this)}
                                    disabled={this.state.valideDisput}
                                >
                                    <Translate content="cwdgateway.submit_btn" />
                                </button>
                            ) : null}

                            {openDisputeBtn ? (
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.openDispute.bind(this)}
                                    disabled={this.state.valideDisput}
                                >
                                    <Translate content="cwdgateway.submit_btn" />
                                </button>
                            ) : null}

                            {replyDisputeBtn ? (
                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.replyDispute.bind(this)}
                                    disabled={this.state.valideDisput}
                                >
                                    <Translate content="cwdgateway.submit_btn" />
                                </button>
                            ) : null}
                        </div>
                        {/* OVERLAY */}
                        <div className="cwdgateway-popup__overlay"></div>
                    </div>
                ) : null}

                {showComfirmModal ? (
                    <div>
                        <div className="cwdgateway-popup cwdgateway-popup--confirm">
                            <NewIcon
                                iconClass="cwdgateway-popup__modal-close"
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"cross"}
                                onClick={this.closeConfirmModal.bind()}
                            />
                            <div className="cwdgateway-popup__inner">
                                <Translate
                                    className="cwdgateway-popup__text"
                                    content="cwdgateway.my_trades.trade_confirm_bill"
                                />

                                <label
                                    className="cwd-upload__upload-label"
                                    htmlFor="userLotImg"
                                >
                                    <NewIcon
                                        iconWidth={50}
                                        iconHeight={50}
                                        iconName={"upload"}
                                    />

                                    {this.state.imgResult ? (
                                        <Translate
                                            className="cwd-upload__label-text"
                                            content="crowdmarket.file-ok"
                                            element="span"
                                        />
                                    ) : (
                                        <Translate
                                            className="cwd-upload__label-text"
                                            content="crowdmarket.choose-file"
                                            element="span"
                                        />
                                    )}
                                </label>
                                <input
                                    className="cwd-upload__upload"
                                    ref="userUploadInput"
                                    id="userLotImg"
                                    type="file"
                                    name="img_url"
                                    required
                                    onChange={this.loadImgToIpfs.bind(this)}
                                />

                                <div
                                    className="add-lot__img-preview"
                                    style={{
                                        backgroundImage: `url(${this.state.userImg.replace(
                                            /http+[a-zA-Z0-9.:/]+ipfs/g,
                                            apiUrl + "/ipfs"
                                        )})`
                                    }}
                                ></div>
                            </div>

                            <button
                                className="cwdgateway__btn"
                                type="button"
                                onClick={this.confirmPayment.bind(this)}
                                disabled={
                                    this.state.userImg ==
                                    apiUrl + "/static/cwd_preview.jpg" ||
                                    this.state.userImg == ""
                                }
                            >
                                <Translate content="cwdgateway.submit_btn" />
                            </button>
                        </div>
                        {/* OVERLAY */}
                        <div className="cwdgateway-popup__overlay"></div>
                    </div>
                ) : null}
            </li>
        );
    }
}

export default OpenedTrades;
