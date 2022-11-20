import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import counterpart from "counterpart";
import { Apis } from "bitsharesjs-ws";
import { ChainStore } from "bitsharesjs";

//STYLES
import "../scss/cwdgateway-active.scss";
import "../scss/cwdgateway-popup.scss";

class TradeItemSell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sellAds: this.props.sellAds,
            showModal: false,
            currentAccount: this.props.currentAccount,
            isDisabled: true,
            userBalance: 0,
            totalSumm: this.props.sellAds.pa.min_cwd / 100000
        };

        this.closeBuyModal = this.closeBuyModal.bind(this);
        this.openTradeModal = this.openTradeModal.bind(this);

        this.isSellLocked = this.isSellLocked.bind(this);
        this.amountValidate = this.amountValidate.bind(this);
        this.sellAsset = this.sellAsset.bind(this);

        this.getBalance = this.getBalance.bind(this);
    }

    componentDidMount() {
        this.getBalance(this.state.currentAccount, "CWD");
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
    }

    openTradeModal() {
        let isScam = false;
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        if (this.props.currentAccount && scamAccounts) {
            isScam =
                scamAccounts
                    .get("blacklisted_accounts")
                    .indexOf(this.props.currentAccount) >= 0;

            if (!isScam) {
                this.setState(
                    {
                        showModal: true
                    },
                    () => {
                        let sellAds = this.state.sellAds.pa;
                        let sellAdsMin;
                        if (sellAds["min_cwd"] == 0) {
                            sellAdsMin = 1;
                        } else {
                            sellAdsMin = sellAds["min_cwd"] / 100000;
                        }
                        document.getElementById(
                            "popupAmount_" + sellAds["id"]
                        ).value = sellAdsMin;
                    }
                );
            }
        }
    }

    isSellLocked(tradeID, price, currency, traderId, e) {
        e.preventDefault();
        let currentAccount = this.state.currentAccount;
        let amount =
            parseInt(document.getElementById("popupAmount_" + tradeID).value) *
            100000;
        let details = document.getElementById("popupSellDetails_" + tradeID)
            .value;

        if (this.state.currentAccount) {
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
        );

        this.closeBuyModal();
    }

    amountValidate(inputId, min, max) {
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

    onNavigate(item, e){
        e.preventDefault();

        let itemId = item;
        let idSplit = itemId.split(".");
        let urlId = idSplit[2];

        this.props.history.push(`/gateway/dex/item-${urlId}`);
    };

    render() {
        let activeItem = this.state.sellAds.pa;
        let showModal = this.state.showModal;
        let rating = this.state.sellAds.rating;
        let volume = this.state.sellAds.volume / 100000;

        let advType = activeItem["adv_type"]
            ? counterpart.translate("cwdgateway.exchange.type_sell")
            : counterpart.translate("cwdgateway.exchange.type_buy");
            
        let price = parseFloat(activeItem["price"] / 100000000)
            .toFixed(8)
            .toString()
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

        let userBalance = this.state.userBalance;
        let minCwdLimit = activeItem["min_cwd"] / 100000;
        let maxCwdLimit = activeItem["max_cwd"] / 100000 - 2;

        let isTop = this.props.isTop;
        let exRate = parseFloat(activeItem["price"] / 100000000);
        let totalSumm = this.state.totalSumm;

        return (
            <li className="cwdgateway-active__item">
                <div className="cwdgateway-active__wrap">
                    <div className="cwdgateway-active__inner">
                        {/* DEX ID  */}
                        <span
                            className="cwdgateway-active__item-id"
                            onClick={this.onNavigate.bind(
                                this,
                                activeItem["id"]
                            )}
                        >
                            #{activeItem["id"]}
                        </span>

                        {/* DEX TYPE */}
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
                            {userBalance < minCwdLimit ? (
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
                            ) : (
                                <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                    {minCwdLimit}&nbsp;-&nbsp;{Math.floor(maxCwdLimit)}
                                    &nbsp;CWD
                                </span>
                            )}
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
                    </div>
                </div>

                {/* SELL POPUP */}
                {showModal ? (
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
                                    onChange={this.amountValidate.bind(
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
                                    onChange={this.amountValidate.bind(
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
                    </div>
                ) : null}
            </li>
        );
    }
}

export default TradeItemSell;
