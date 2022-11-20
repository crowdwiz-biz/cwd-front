import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";

//STYLES
import "../../scss/trade-form.scss";

class TradeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            tradeType: true,
            isValid: false
        };
        this.isWalletLocked = this.isWalletLocked.bind(this);

        this.addTradeItem = this.addTradeItem.bind(this);
        this.tradeTypeCheck = this.tradeTypeCheck.bind(this);
    }

    componentDidMount() {
        document.getElementById("userTradeMin").value = 0;
        document.getElementById("confirmLimit").value = 60;
        document.getElementById("replyLimit").value = 60;
    }

    tradeTypeCheck(tradeTypeId) {
        if (tradeTypeId) {
            document
                .getElementById("tradeTypeBuy")
                .classList.remove("trade-form__radio-btn--active");

            document
                .getElementById("tradeTypeSell")
                .classList.add("trade-form__radio-btn--active");
        } else {
            document
                .getElementById("tradeTypeSell")
                .classList.remove("trade-form__radio-btn--active");
            document
                .getElementById("tradeTypeBuy")
                .classList.add("trade-form__radio-btn--active");
        }

        this.setState({
            tradeType: tradeTypeId
        });
    }

    isWalletLocked(e) {
        e.preventDefault();
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.addTradeItem();
                    })
                    .catch(() => {});
            } else {
                this.addTradeItem();
            }
        }
    }

    addTradeItem() {
        let currentAccount = this.props.currentAccount;
        let tradeType = this.state.tradeType;
        let description = document.getElementById("tradeDescription").value;
        let tradeMin =
            parseInt(document.getElementById("tradeMin").value) * 100000;
        let tradeMax =
            parseInt(document.getElementById("tradeMax").value) * 100000;
        let tradePriceArr = document
            .getElementById("tradePrice")
            .value.replace(/\./gi, ",")
            .split(",");
        let tradePrice = 0;
        if (tradePriceArr.length == 2) {
            tradePrice =
                tradePriceArr[0] * 100000000 +
                tradePriceArr[1].substr(0, 8) *
                    Math.pow(10, 8 - tradePriceArr[1].substr(0, 8).length);
        } else {
            tradePrice = tradePriceArr[0] * 100000000;
        }
        let tradeCurrency = document.getElementById("tradeCurrency").value;
        let userTradeMin = parseInt(
            document.getElementById("userTradeMin").value
        );
        let userStatusMin = parseInt(
            document.getElementById("userStatusMin").value
        );
        let confirmLimit =
            parseInt(document.getElementById("confirmLimit").value) * 60;
        let replyLimit =
            parseInt(document.getElementById("replyLimit").value) * 60;
        let tradeGeo = document.getElementById("tradeGeo").value;

        AccountActions.createP2pAdv(
            currentAccount,
            tradeType,
            description,
            tradeMax,
            tradeMin,
            tradePrice,
            tradeCurrency,
            userTradeMin,
            userStatusMin,
            replyLimit,
            confirmLimit,
            tradeGeo
        );
    }

    render() {
        let userStatusText = [
            counterpart.translate("cwdgateway.exchange.type_client"),
            "Start",
            "Expert",
            "Citizen",
            "Infinity"
        ];

        return (
            <div className="trade-form__tab">
                <div className="trade-form">
                    <div className="trade-form__wrap">
                        <div className="trade-form__inner">
                            <div>
                                <input
                                    className="cwdgateway__field"
                                    id="tradeTitle"
                                    type="hidden"
                                    name="name"
                                    value={this.state.currentAccount}
                                />
                                {/* TRADE TYPE */}
                                <div className="trade-form__field-wrap">
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.trade_type_text"
                                    />

                                    <div className="trade-form__selection-wrap">
                                        <span
                                            className="trade-form__radio-btn trade-form__radio-btn--active"
                                            id="tradeTypeSell"
                                            onClick={this.tradeTypeCheck.bind(
                                                this,
                                                true
                                            )}
                                        >
                                            <Translate
                                                className="trade-form__radio-text"
                                                content="cwdgateway.exchange.type_sell"
                                            />
                                        </span>
                                        <span
                                            className="trade-form__radio-btn"
                                            id="tradeTypeBuy"
                                            onClick={this.tradeTypeCheck.bind(
                                                this,
                                                false
                                            )}
                                        >
                                            <Translate
                                                className="trade-form__radio-text"
                                                content="cwdgateway.exchange.type_buy"
                                            />
                                        </span>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="tradeDescription"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.ad_description"
                                    />
                                    <textarea
                                        className="cwdgateway__field cwdgateway__field--desc"
                                        id="tradeDescription"
                                        rows="12"
                                        name="description"
                                        placeholder={counterpart.translate(
                                            "cwdgateway.exchange.ad_placeholder"
                                        )}
                                    />
                                </label>
                            </div>

                            <div>
                                {/* QUANTITY MIN */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="quantityMin"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.amount_min"
                                    />
                                    <input
                                        className="cwdgateway__field"
                                        id="tradeMin"
                                        type="number"
                                        min="1"
                                        name="quantityMin"
                                    />
                                </label>

                                {/* QUANTITY MAX */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="quantityMax"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.amount_max"
                                    />
                                    <input
                                        className="cwdgateway__field"
                                        id="tradeMax"
                                        type="number"
                                        min="1"
                                        name="quantityMax"
                                    />
                                </label>

                                {/* CURRENCY */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="tradeCurrency"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.currency"
                                    />

                                    <input
                                        className="cwdgateway__field cwdgateway__field--currency"
                                        id="tradeCurrency"
                                        type="text"
                                        name="currency"
                                    />
                                </label>

                                {/* PRICE */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="tradePrice"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.price"
                                    />

                                    <input
                                        className="cwdgateway__field"
                                        id="tradePrice"
                                        type="number"
                                        min="1"
                                        name="price"
                                    />
                                </label>

                                {/* USER TRADES MIN */}
                                <label
                                    className="trade-form__field-wrap"
                                    htmlFor="userTradeMin"
                                >
                                    <Translate
                                        className="trade-form__subtitle"
                                        content="cwdgateway.exchange.user_trades_min"
                                    />

                                    <input
                                        className="cwdgateway__field"
                                        id="userTradeMin"
                                        type="number"
                                        name="userTradeMin"
                                    />
                                </label>
                            </div>

                            <div className="trade-form__block">
                                <div className="trade-form__3-column">
                                    {/* USER STATUS MIN */}
                                    <label
                                        className="trade-form__field-wrap"
                                        htmlFor="userStatusMin"
                                    >
                                        <Translate
                                            className="trade-form__subtitle"
                                            content="cwdgateway.exchange.user_status_min"
                                        />

                                        <select
                                            className="cwdgateway__field"
                                            id="userStatusMin"
                                            name="userStatusMin"
                                            defaultValue="0"
                                        >
                                            <option value="0">
                                                {userStatusText[0]}
                                            </option>
                                            <option value="1">
                                                {userStatusText[1]}
                                            </option>
                                            <option value="2">
                                                {userStatusText[2]}
                                            </option>
                                            <option value="3">
                                                {userStatusText[3]}
                                            </option>
                                            <option value="4">
                                                {userStatusText[4]}
                                            </option>
                                        </select>
                                    </label>

                                    {/* USER CONFIRM LIMIT */}
                                    <label
                                        className="trade-form__field-wrap"
                                        htmlFor="confirmLimit"
                                    >
                                        <Translate
                                            className="trade-form__subtitle"
                                            content="cwdgateway.exchange.confirm_limit"
                                        />

                                        <input
                                            className="cwdgateway__field"
                                            id="confirmLimit"
                                            type="number"
                                            name="confirmLimit"
                                            min="60"
                                        />
                                    </label>

                                    {/* USER REPLY LIMIT */}
                                    <label
                                        className="trade-form__field-wrap"
                                        htmlFor="replyLimit"
                                    >
                                        <Translate
                                            className="trade-form__subtitle"
                                            content="cwdgateway.exchange.reply_limit"
                                        />

                                        <input
                                            className="cwdgateway__field"
                                            id="replyLimit"
                                            type="number"
                                            name="replyLimit"
                                            min="60"
                                        />
                                    </label>

                                    {/* TRADE GEO */}
                                    <label
                                        className="trade-form__field-wrap"
                                        htmlFor="tradeGeo"
                                    >
                                        <Translate
                                            className="trade-form__subtitle"
                                            content="cwdgateway.exchange.trade_geo"
                                        />

                                        <input
                                            className="cwdgateway__field"
                                            id="tradeGeo"
                                            type="text"
                                            name="tradeGeo"
                                        />
                                    </label>
                                </div>

                                <button
                                    className="cwdgateway__btn"
                                    type="button"
                                    onClick={this.isWalletLocked.bind(this)}
                                >
                                    <Translate content="cwdgateway.exchange.title" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TradeForm;
