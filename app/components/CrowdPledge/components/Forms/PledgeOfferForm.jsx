import React from "react";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AmountSelector from "../../../Utility/AmountSelector";
import {Asset} from "common/MarketClasses";

//STYLES
import "../../scss/pledge-form.scss";

class PledgeOfferForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.currentAccount,
            pledgeType: true,
            isValid: false,
            pledge_amount: "",
            pledge_asset_id: null,
            pledge_asset: null,
            credit_amount: "",
            credit_asset_id: null,
            credit_asset: null,
            repay_amount: "",
            repay_asset_id: null,
            repay_asset: null
        };
        this.onPledgeAmountChanged = this.onPledgeAmountChanged.bind(this);
        this.isWalletLocked = this.isWalletLocked.bind(this);

        this.addPledgeOffer = this.addPledgeOffer.bind(this);
        this.pledgeTypeCheck = this.pledgeTypeCheck.bind(this);
    }

    pledgeTypeCheck(pledgeTypeId) {
        if (pledgeTypeId === true) {
            document
                .getElementById("pledgeTypeBuy")
                .classList.remove("pledge-form__radio-btn--active");

            document
                .getElementById("pledgeTypeSell")
                .classList.add("pledge-form__radio-btn--active");

            this.setState({
                pledgeType: true
            });
        } else {
            document
                .getElementById("pledgeTypeSell")
                .classList.remove("pledge-form__radio-btn--active");
            document
                .getElementById("pledgeTypeBuy")
                .classList.add("pledge-form__radio-btn--active");
            this.setState({
                pledgeType: false
            });
        }
    }

    onPledgeAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState({
            pledge_amount: amount,
            pledge_asset: asset,
            pledge_asset_id: asset.get("id")
        });
    }

    onCreditAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState({
            credit_amount: amount,
            credit_asset: asset,
            credit_asset_id: asset.get("id")
        });
    }

    onRepayAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState({
            repay_amount: amount,
            repay_asset: asset,
            repay_asset_id: asset.get("id")
        });
    }

    isWalletLocked(e) {
        e.preventDefault();
        if (this.state.currentAccount) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                        this.addPledgeOffer();
                    })
                    .catch(() => {});
            } else {
                this.addPledgeOffer();
            }
        }
    }

    addPledgeOffer() {
        let currentAccount = this.props.currentAccount;
        const {pledge_asset, credit_asset, repay_asset} = this.state;
        let {pledge_amount, credit_amount, repay_amount} = this.state;
        const pledgeAmount = new Asset({
            real: pledge_amount,
            asset_id: pledge_asset.get("id"),
            precision: pledge_asset.get("precision")
        });
        const creditAmount = new Asset({
            real: credit_amount,
            asset_id: credit_asset.get("id"),
            precision: credit_asset.get("precision")
        });
        const repayAmount = new Asset({
            real: repay_amount,
            asset_id: repay_asset.get("id"),
            precision: repay_asset.get("precision")
        });
        let repayPeriod = parseInt(
            document.getElementById("pladgePeriod").value
        );

        if (this.state.pledgeType) {
            AccountActions.pledge_offer_take_create(
                currentAccount,
                pledgeAmount.getAmount(),
                pledge_asset.get("id"),
                creditAmount.getAmount(),
                credit_asset.get("id"),
                repayAmount.getAmount(),
                repay_asset.get("id"),
                repayPeriod
            )
                .then(() => {
                    TransactionConfirmStore.unlisten(this.onTrxIncluded);
                    TransactionConfirmStore.listen(this.onTrxIncluded);
                })
                .catch(e => {
                    let msg = e.message
                        ? e.message.split("\n")[1] || e.message
                        : null;
                    console.log("error: ", e, msg);
                    this.setState({error: msg});
                });
        } else {
            AccountActions.pledge_offer_give_create(
                currentAccount,
                pledgeAmount.getAmount(),
                pledge_asset.get("id"),
                creditAmount.getAmount(),
                credit_asset.get("id"),
                repayAmount.getAmount(),
                repay_asset.get("id"),
                repayPeriod
            )
                .then(() => {
                    TransactionConfirmStore.unlisten(this.onTrxIncluded);
                    TransactionConfirmStore.listen(this.onTrxIncluded);
                })
                .catch(e => {
                    let msg = e.message
                        ? e.message.split("\n")[1] || e.message
                        : null;
                    console.log("error: ", e, msg);
                    this.setState({error: msg});
                });
        }
    }

    render() {
        let {pledge_amount, pledge_asset_id, pledge_asset} = this.state;
        let {credit_amount, credit_asset_id, credit_asset} = this.state;
        let {repay_amount, repay_asset_id, repay_asset} = this.state;

        let asset_types = [
            "1.3.0",
            "1.3.1",
            "1.3.3",
            "1.3.5",
            "1.3.6",
            "1.3.10",
            "1.3.23",
            "1.3.24",
            "1.3.31",
            "1.3.32"
        ];

        let isDisabled = true;

        if(pledge_asset_id != repay_asset_id && pledge_amount > 0 && credit_amount > 0 && repay_amount > 0) {
            isDisabled = false
        }

        return (
            <div className="pledge-form__tab">
                <div className="pledge-form">
                    <div className="pledge-form__wrap">
                        <div className="pledge-form__inner">
                            <input
                                className="pledge-common__field"
                                id="tradeTitle"
                                type="hidden"
                                name="name"
                                value={this.state.currentAccount}
                            />
                            {/* PLADEGE TYPE */}
                            <div className="pledge-form__field-wrap">
                                <Translate
                                    className="pledge-form__subtitle"
                                    content="crowd_pledge.exchange.pledge_type_text"
                                />

                                <div className="pledge-form__selection-wrap">
                                    <span
                                        className="pledge-form__radio-btn pledge-form__radio-btn--active"
                                        id="pledgeTypeSell"
                                        onClick={this.pledgeTypeCheck.bind(
                                            this,
                                            true
                                        )}
                                    >
                                        <Translate
                                            className="pledge-form__radio-text"
                                            content="crowd_pledge.exchange.type_take"
                                        />
                                    </span>
                                    <span
                                        className="pledge-form__radio-btn"
                                        id="pledgeTypeBuy"
                                        onClick={this.pledgeTypeCheck.bind(
                                            this,
                                            false
                                        )}
                                    >
                                        <Translate
                                            className="pledge-form__radio-text"
                                            content="crowd_pledge.exchange.type_give"
                                        />
                                    </span>
                                </div>
                            </div>

                            {this.state.pledgeType ? (
                                <Translate
                                    className="pledge-form__subtitle pledge-form__subtitle--light"
                                    content="crowd_pledge.exchange.take_descripiton_text"
                                    id="descriptionText"
                                />
                            ) : (
                                <Translate
                                    className="pledge-form__subtitle pledge-form__subtitle--light"
                                    content="crowd_pledge.exchange.give_descripiton_text"
                                    id="descriptionText"
                                />
                            )}

                            {/*  PLEDGE AMOUNT  */}
                            <div className="pledge-form__field-wrap">
                                <Translate
                                    className="pledge-form__subtitle"
                                    content="crowd_pledge.exchange.pledge_amount"
                                />

                                <div className="pledge-common__asset-wrap">
                                    <AmountSelector
                                        amount={pledge_amount}
                                        onChange={this.onPledgeAmountChanged.bind(
                                            this
                                        )}
                                        asset={
                                            asset_types.length > 0 &&
                                            pledge_asset
                                                ? pledge_asset.get("id")
                                                : pledge_asset_id
                                                ? pledge_asset_id
                                                : asset_types[0]
                                        }
                                        assets={asset_types}
                                        display_balance={false}
                                        tabIndex={2}
                                        allowNaN={true}
                                    />
                                </div>
                            </div>

                            {/*  CREDIT AMOUNT  */}
                            <div className="pledge-form__field-wrap">
                                <Translate
                                    className="pledge-form__subtitle"
                                    content="crowd_pledge.exchange.credit_amount"
                                />

                                <div className="pledge-common__asset-wrap">
                                    <AmountSelector
                                        amount={credit_amount}
                                        onChange={this.onCreditAmountChanged.bind(
                                            this
                                        )}
                                        asset={
                                            asset_types.length > 0 &&
                                            credit_asset
                                                ? credit_asset.get("id")
                                                : credit_asset_id
                                                ? credit_asset_id
                                                : asset_types[0]
                                        }
                                        assets={asset_types}
                                        display_balance={false}
                                        tabIndex={2}
                                        allowNaN={true}
                                    />
                                </div>
                            </div>

                            {/*  REPAY AMOUNT  */}
                            <div className="pledge-form__field-wrap">
                                <Translate
                                    className="pledge-form__subtitle"
                                    content="crowd_pledge.exchange.repay_amount"
                                />

                                <div className="pledge-common__asset-wrap">
                                    <AmountSelector
                                        amount={repay_amount}
                                        onChange={this.onRepayAmountChanged.bind(
                                            this
                                        )}
                                        asset={
                                            asset_types.length > 0 &&
                                            repay_asset
                                                ? repay_asset.get("id")
                                                : repay_asset_id
                                                ? repay_asset_id
                                                : asset_types[0]
                                        }
                                        assets={asset_types}
                                        display_balance={false}
                                        tabIndex={2}
                                        allowNaN={true}
                                    />
                                </div>
                            </div>

                            {/* PLADGE PERIOD */}
                            <label
                                className="pledge-form__field-wrap"
                                htmlFor="replyLimit"
                            >
                                <Translate
                                    className="pledge-form__subtitle"
                                    content="crowd_pledge.exchange.repay_period"
                                />

                                <input
                                    className="pledge-common__field"
                                    id="pladgePeriod"
                                    type="number"
                                    name="pladgePeriod"
                                />
                            </label>

                            <button
                                className="pledge-common__btn"
                                type="button"
                                onClick={this.isWalletLocked.bind(this)}
                                disabled={isDisabled}
                            >
                                <Translate content="crowd_pledge.exchange.title" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PledgeOfferForm;
