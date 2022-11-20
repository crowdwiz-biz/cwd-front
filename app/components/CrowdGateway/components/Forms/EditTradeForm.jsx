import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import NewIcon from "../../../NewIcon/NewIcon";
import LinkToAccountById from "../../../Utility/LinkToAccountById";

//STYLES
import "../../scss/trade-form.scss";

class EditTradeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tradeItem: this.props.tradeItem,
            currentAccount: this.props.currentAccount,
            tradeStatus: true,
            tradeType: this.props.tradeItem["adv_type"]
        };
        this.editTradeItem = this.editTradeItem.bind(this);
        this.tradeStatusCheck = this.tradeStatusCheck.bind(this);

        this.isWalletLocked = this.isWalletLocked.bind(this);

        this.showEditForm = this.showEditForm.bind(this);
        this.closeEditForm = this.closeEditForm.bind(this);

        this.removeFromBlackList = this.removeFromBlackList.bind(this);
    }

    componentDidUpdate(nextProps) {
        const { tradeItem } = this.props;
        if (nextProps.tradeItem !== tradeItem) {
            if (tradeItem) {
                this.setState({ 
                    tradeItem: nextProps.tradeItem
                });
            }
        }
    }

    tradeStatusCheck(tradeStatusId) {
        if (tradeStatusId) {
            document
                .getElementById("tradeStatusBuy")
                .classList.remove("trade-form__radio-btn--active");

            document
                .getElementById("tradeStatusSell")
                .classList.add("trade-form__radio-btn--active");
        } else {
            document
                .getElementById("tradeStatusSell")
                .classList.remove("trade-form__radio-btn--active");
            document
                .getElementById("tradeStatusBuy")
                .classList.add("trade-form__radio-btn--active");
        }
        this.setState({
            tradeStatus: tradeStatusId
        });
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

    showEditForm(e) {
        e.preventDefault();
        this.setState(
            {
                showEditForm: true
            },
            () => {
                let tradeItem = this.state.tradeItem;

                document.getElementById("tradeDescription").value =
                    tradeItem["adv_description"];
                document.getElementById("tradeMin").value =
                    tradeItem["min_cwd"] / 100000;
                document.getElementById("tradeMax").value =
                    tradeItem["max_cwd"] / 100000;
                document.getElementById("tradeCurrency").value =
                    tradeItem["currency"];
                document.getElementById("tradePrice").value = parseFloat(
                    tradeItem["price"] / 100000000
                )
                    .toFixed(8)
                    .toString()
                    .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                document.getElementById("userTradeMin").value =
                    tradeItem["min_p2p_complete_deals"];
                document.getElementById("userStatusMin").value =
                    tradeItem["min_account_status"];
                document.getElementById("confirmLimit").value =
                    tradeItem["timelimit_for_approve"] / 60;
                document.getElementById("replyLimit").value =
                    tradeItem["timelimit_for_reply"] / 60;
                document.getElementById("tradeGeo").value = tradeItem["geo"];
            }
        );
    }

    closeEditForm() {
        this.setState({
            showEditForm: false
        });
    }

    isWalletLocked(e) {
        e.preventDefault();
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.editTradeItem();
                    })
                    .catch(() => { });
            } else {
                this.editTradeItem();
            }
        }
    }

    editTradeItem() {
        let tradeStatus = this.state.tradeStatus ? 1 : 0;
        let advType = this.state.tradeType;
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

        AccountActions.editP2pAdv(
            this.props.tradeItem["id"],
            this.props.tradeItem["p2p_gateway"],
            advType,
            description,
            tradeMax,
            tradeMin,
            tradePrice,
            tradeCurrency,
            userTradeMin,
            userStatusMin,
            replyLimit,
            confirmLimit,
            tradeGeo,
            tradeStatus
        );
        this.closeEditForm();
    }

    removeFromBlackList(account) {
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        AccountActions.removeFromP2pAdvBlackList(
                            this.props.tradeItem["id"],
                            this.props.tradeItem["p2p_gateway"],
                            account
                        );
                    })
                    .catch(() => { });
            } else {
                AccountActions.tryToSetCurrentAccount();
                AccountActions.removeFromP2pAdvBlackList(
                    this.props.tradeItem["id"],
                    this.props.tradeItem["p2p_gateway"],
                    account
                );
            }
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
        let tradeItem = this.state.tradeItem;
        let userStatusText = [
            counterpart.translate("cwdgateway.exchange.type_client"),
            "Start",
            "Expert",
            "Citizen",
            "Infinity"
        ];
        let showEditForm = this.state.showEditForm;

        let advType = tradeItem["adv_type"]
            ? counterpart.translate("cwdgateway.exchange.type_sell")
            : counterpart.translate("cwdgateway.exchange.type_buy");

        let price = parseFloat(tradeItem["price"] / 100000000)
            .toFixed(8)
            .toString()
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

        return (
            <li className="cwdgateway-active__item">
                <div className="cwdgateway-active__wrap">
                    <div className="cwdgateway-active__inner cwdgateway-active__inner--non-p2p-block">
                        {/* DEX ID  */}
                        <span
                            className="cwdgateway-active__item-id"
                            onClick={this.onNavigate.bind(
                                this,
                                tradeItem["id"]
                            )}>
                            #{tradeItem["id"]}
                        </span>

                        <span className="cwdgateway-active__name">
                            {advType}
                        </span>
                        <p className="cwdgateway-active__desc">
                            {tradeItem["adv_description"]}
                        </p>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.quantity"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data">
                                {tradeItem["min_cwd"] / 100000} -{" "}
                                {tradeItem["max_cwd"] / 100000}
                            </span>
                        </div>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.price"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                {price}&nbsp;
                                {tradeItem["currency"]}
                            </span>
                        </div>

                        <div className="cwdgateway-active__row">
                            <Translate
                                className="cwdgateway-active__text"
                                content="cwdgateway.geo"
                            />
                            <span className="cwdgateway-active__text cwdgateway-active__text--data cwdgateway-active__text--price">
                                {tradeItem["geo"]}
                            </span>
                        </div>

                        {tradeItem["black_list"].length > 0 ? (
                            <div className="cwdgateway-active__row cwdgateway-active__row--black-list">
                                <Translate
                                    className="cwdgateway-active__text"
                                    content="cwdgateway.black_list"
                                />
                                {tradeItem["black_list"].map(
                                    (blackAcc, index) => (
                                        <span
                                            className="cwdgateway-active__black-wrap"
                                            key={index++}
                                        >
                                            <LinkToAccountById
                                                account={blackAcc}
                                            />

                                            {index + 1 ==
                                                tradeItem["black_list"].length
                                                ? ","
                                                : null}
                                            <NewIcon
                                                iconWidth={14}
                                                iconHeight={14}
                                                iconName={"cross"}
                                                onClick={this.removeFromBlackList.bind(
                                                    this,
                                                    blackAcc
                                                )}
                                            />
                                        </span>
                                    )
                                )}
                            </div>
                        ) : null}
                    </div>

                    <button
                        className="cwdgateway__btn"
                        type="button"
                        onClick={this.showEditForm.bind()}
                    >
                        <Translate content="cwdgateway.edit_btn" />
                    </button>
                </div>

                {showEditForm ? (
                    <div className="trade-form__container">
                        <div className="trade-form">
                            <NewIcon
                                iconClass="cwdgateway-popup__modal-close"
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"cross"}
                                onClick={this.closeEditForm.bind()}
                            />

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
                                        {/* TRADE IS ACTIVE*/}
                                        <div className="trade-form__field-wrap">
                                            <Translate
                                                className="trade-form__subtitle"
                                                content="cwdgateway.exchange.active_exchange.adv_type"
                                            />

                                            <div className="trade-form__selection-wrap">
                                                <span
                                                    className={
                                                        tradeItem["status"]
                                                            ? "trade-form__radio-btn trade-form__radio-btn--active"
                                                            : "trade-form__radio-btn"
                                                    }
                                                    id="tradeStatusSell"
                                                    onClick={this.tradeStatusCheck.bind(
                                                        this,
                                                        true
                                                    )}
                                                >
                                                    <Translate
                                                        className="trade-form__radio-text"
                                                        content="cwdgateway.exchange.active_exchange.active"
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        !tradeItem["status"]
                                                            ? "trade-form__radio-btn trade-form__radio-btn--active"
                                                            : "trade-form__radio-btn"
                                                    }
                                                    id="tradeStatusBuy"
                                                    onClick={this.tradeStatusCheck.bind(
                                                        this,
                                                        false
                                                    )}
                                                >
                                                    <Translate
                                                        className="trade-form__radio-text"
                                                        content="cwdgateway.exchange.active_exchange.disactive"
                                                    />
                                                </span>
                                            </div>
                                        </div>

                                        {/* TRADE TYPE */}
                                        <div className="trade-form__field-wrap">
                                            <Translate
                                                className="trade-form__subtitle"
                                                content="cwdgateway.exchange.trade_type_text"
                                            />

                                            <div className="trade-form__selection-wrap">
                                                <span
                                                    className={
                                                        this.state.tradeType
                                                            ? "trade-form__radio-btn trade-form__radio-btn--active"
                                                            : "trade-form__radio-btn"
                                                    }
                                                    id="tradeTypeSell"
                                                    onClick={this.tradeTypeCheck.bind(this, true)}
                                                >
                                                    <Translate
                                                        className="trade-form__radio-text"
                                                        content="cwdgateway.exchange.type_sell"
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        this.state.tradeType
                                                            ? "trade-form__radio-btn"
                                                            : "trade-form__radio-btn trade-form__radio-btn--active"
                                                    }
                                                    id="tradeTypeBuy"
                                                    onClick={this.tradeTypeCheck.bind(this, false)}
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
                                                rows="8"
                                                name="description"
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
                                            onClick={this.isWalletLocked.bind(
                                                this
                                            )}
                                        >
                                            <Translate content="cwdgateway.exchange.active_exchange.edit_btn" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
                {showEditForm ? (
                    <div className="cwdgateway-popup__overlay"></div>
                ) : null}
            </li>
        );
    }
}

export default EditTradeForm;
