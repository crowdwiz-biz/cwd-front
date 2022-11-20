import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import counterpart from "counterpart";

//STYLES
import "../scss/cwdgateway-active.scss";
import "../scss/cwdgateway-popup.scss";

class TradeItemBuy extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buyAds: this.props.buyAds,
            showModal: false,
            currentAccount: this.props.currentAccount,
            valideAmount: true,
            rating: 0,
            totalSumm: this.props.buyAds.pa.min_cwd / 100000
        };
        this.closeBuyModal = this.closeBuyModal.bind(this);
        this.openTradeModal = this.openTradeModal.bind(this);

        this.isBuyLocked = this.isBuyLocked.bind(this);
        this.amountValidate = this.amountValidate.bind(this);
        this.buyAsset = this.buyAsset.bind(this);
    }

    closeBuyModal() {
        this.setState({
            showModal: false
        });
    }

    openTradeModal() {
        this.setState(
            {
                showModal: true
            },
            () => {
                let buyAds = this.state.buyAds.pa;
                let buyAdsMin;
                if (buyAds["min_cwd"] == 0) {
                    buyAdsMin = 1;
                } else {
                    buyAdsMin = buyAds["min_cwd"] / 100000;
                }
                document.getElementById(
                    "popupAmount_" + buyAds["id"]
                ).value = buyAdsMin;
            }
        );
    }

    isBuyLocked(tradeID, price, currency, traderId, e) {
        e.preventDefault();
        let currentAccount = this.state.currentAccount;
        let amount =
            parseInt(document.getElementById("popupAmount_" + tradeID).value) *
            100000;

        if (this.state.currentAccount) {
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
        );

        this.closeBuyModal();
    }

    amountValidate(inputId, min, max) {
        // user amount count
        let docAmountValue = document.getElementById("popupAmount_" + inputId)
            .value;

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


    onNavigate(item, e) {
        e.preventDefault();

        let itemId = item;
        let idSplit = itemId.split(".");
        let urlId = idSplit[2];

        this.props.history.push(`/gateway/dex/item-${urlId}`);
    };

    render() {
        let activeItem = this.state.buyAds.pa;
        let rating = this.state.buyAds.rating;
        let volume = this.state.buyAds.volume / 100000;
        let showModal = this.state.showModal;

        let advType = activeItem["adv_type"]
            ? counterpart.translate("cwdgateway.exchange.type_sell")
            : counterpart.translate("cwdgateway.exchange.type_buy");

        let price = parseFloat(activeItem["price"] / 100000000)
            .toFixed(8)
            .toString()
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

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
                            )}>
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
                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                {activeItem["min_cwd"] / 100000}&nbsp;-&nbsp;
                                {Math.floor(activeItem["max_cwd"] / 100000)}
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
                            onClick={this.openTradeModal.bind()}
                        >
                            <Translate content="cwdgateway.buy_btn" />
                        </button>
                    </div>
                </div>

                {/* BUY POPUP */}
                {showModal ? (
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
                                    onChange={this.amountValidate.bind(
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
                    </div>
                ) : null}
            </li>
        );
    }
}

export default TradeItemBuy;
