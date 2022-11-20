import React from "react";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import AmountSelector from "../../Utility/AmountSelector";
import {ChainStore} from "bitsharesjs/es";
import {debounce} from "lodash";
import {Asset} from "common/MarketClasses";
import {Link} from "react-router-dom";
import NewIcon from "../../NewIcon/NewIcon";
import {Apis} from "bitsharesjs-ws";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";

//STYLES
import "../scss/staking.scss";
import "../scss/static-transfer.scss";

class StakingTransfer extends React.Component {
    constructor(props) {
        super(props);
        let currentAccount;
        let proposal = false;
        if (
            this.props.currentAccount.get("id") ==
            this.props.pocAccount.get("id")
        ) {
            currentAccount = this.props.currentAccount;
        } else {
            currentAccount = this.props.pocAccount;
            proposal = true;
        }
        this.state = {
            asset: "CWD",
            memo: "",
            fee_asset_id: "1.3.0",
            feeAmount: new Asset({amount: 0}),
            userBalance: 0,
            intervalID: 0,
            percent: this.props.percent,
            currentAccount: currentAccount,
            amount: this.props.minDeposit,
            minDeposit: this.props.minDeposit,
            asset_id: this.props.transferAsset,
            term: this.props.term,
            proposal: proposal
        };

        this.onTrxIncluded = this.onTrxIncluded.bind(this);
        this.updateFee = debounce(this.updateFee.bind(this), 250);
        this.getBalance = this.getBalance.bind(this);
    }

    componentDidMount() {
        this.getBalance(this.state.currentAccount.get("id"), "CWD");

        this.setState({
            intervalID: setInterval(
                this.getBalance.bind(
                    this,
                    this.state.currentAccount.get("id"),
                    "CWD"
                ),
                5000
            )
        });

        this.nestedRef = null;
        this.updateFee();
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

    _setTotal(asset_id, balance_id) {
        const {feeAmount} = this.state;
        let balanceObject = ChainStore.getObject(balance_id);
        let transferAsset = ChainStore.getObject(asset_id);

        let balance = new Asset({
            amount: balanceObject.get("balance"),
            asset_id: transferAsset.get("id"),
            precision: transferAsset.get("precision")
        });

        if (balanceObject) {
            if (feeAmount.asset_id === balance.asset_id) {
                balance.minus(feeAmount);
            }
            this.setState({amount: balance.getAmount({real: true})});
        }
    }

    updateFee(state = this.state) {
        let {fee_asset_id, currentAccount} = state;
        const fee_asset_types = ["1.3.0"];
        if (
            fee_asset_types.length === 1 &&
            fee_asset_types[0] !== fee_asset_id
        ) {
            fee_asset_id = fee_asset_types[0];
        }
        if (!currentAccount) return null;
        let fee_asset = new Asset({amount: 2000000});
        this.setState({
            feeAmount: fee_asset,
            fee_asset_id: "1.3.0"
        });
    }

    onAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState({
            amount,
            asset,
            asset_id: asset.get("id")
        });
        this.getBalance(this.state.currentAccount.get("id"), "CWD");
    }

    onTrxIncluded(confirm_store_state) {
        if (
            confirm_store_state.included &&
            confirm_store_state.broadcasted_transaction
        ) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        } else if (confirm_store_state.closed) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        }
    }

    setNestedRef(ref) {
        this.nestedRef = ref;
    }

    isWalletLocked(proposal_account) {
        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    if (proposal_account == null) {
                        this.onSubmit();
                    } else {
                        this.proposeOnSubmit(proposal_account);
                    }
                })
                .catch(() => {});
        } else {
            if (proposal_account == null) {
                this.onSubmit();
            } else {
                this.proposeOnSubmit(proposal_account);
            }
        }
    }

    onSubmit() {
        let accountID = this.state.currentAccount.get("id");
        let term = parseInt(this.state.term);
        let amount = parseInt(this.state.amount) * 100000;

        AccountActions.pocStak(accountID, amount, term).then(() => {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.listen(this.onTrxIncluded);
        });
    }

    proposeOnSubmit(proposal_account) {
        let current_account = this.state.currentAccount.get("id");
        let accountID = proposal_account;
        let term = parseInt(this.state.term);
        let amount = parseInt(this.state.amount) * 100000;

        AccountActions.proposePocStak(
            current_account,
            amount,
            term,
            proposal_account
        ).then(() => {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.listen(this.onTrxIncluded);
        });
    }

    render() {
        let {currentAccount, userBalance, proposal} = this.state;
        let description = this.props.description;
        let percent = this.props.percent;
        let minDeposit = this.props.minDeposit;

        let accountName = currentAccount.get("name");
        let accountID = this.props.currentAccount.get("id");

        let amount = parseFloat(this.state.amount);
        let fee = this.state.feeAmount.getAmount({real: true});
        let account_balances = currentAccount.get("balances").toJS();
        let width = window.innerWidth;

        let isDepositValid = amount >= minDeposit;
        let isAmountValid = 0 <= userBalance - amount - fee;
        let isSubmitValid = isAmountValid && isDepositValid;

        return (
            <section className="staking">
                <div className="staking__about-wrap">
                    <Translate
                        className="staking__title"
                        content="staking.title"
                    />

                    <div className="staking__description">
                        <Translate content="staking.description" />

                        <Link
                            to={`/account/${accountName}/vesting/?activeTab=1`}
                            className="staking__description-link"
                        >
                            <Translate content="staking.description_link" />
                        </Link>
                    </div>

                    <Translate
                        className="staking__description"
                        content={`staking.${description}`}
                        component="p"
                    />
                    <Translate
                        className="staking__percent-text"
                        content="staking.deposit_percent"
                    />
                    <span className="staking__percent">{percent}%</span>
                </div>

                <div className="static-transfer__wrap">
                    {width > 576 ? (
                        <div className="static-transfer__header">
                            <div className="static-transfer__header-item">
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.avialiable_text"
                                />
                            </div>
                            <div className="static-transfer__header-item">
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.transfer_amount"
                                />
                            </div>
                            <div className="static-transfer__header-item">
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.fee"
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="static-transfer__body">
                        <div>
                            {width < 576 ? (
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.avialiable_text"
                                />
                            ) : null}

                            <div className="static-transfer__item">
                                <div className="static-transfer__field-wrap">
                                    <div className="static-transfer__current-balance">
                                        {userBalance}
                                    </div>
                                    <span className="static-transfer__asset">
                                        CWD
                                    </span>
                                </div>

                                <button
                                    disabled={userBalance == 0 ? true : false}
                                    className="static-transfer__push-btn"
                                    type="button"
                                    onClick={this._setTotal.bind(
                                        this,
                                        "1.3.0",
                                        account_balances["1.3.0"],
                                        fee,
                                        "1.3.0"
                                    )}
                                >
                                    <NewIcon
                                        iconWidth={18}
                                        iconHeight={14}
                                        iconName={"btn_arrow"}
                                    />
                                </button>
                            </div>
                        </div>

                        {/*  AMOUNT   */}

                        <div>
                            {width < 576 ? (
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.transfer_amount"
                                />
                            ) : null}
                            <div
                                className={
                                    isSubmitValid
                                        ? "static-transfer__item static-transfer__item--amount"
                                        : "static-transfer__item static-transfer__item--amount static-transfer__item--amount-alert"
                                }
                            >
                                <AmountSelector
                                    amount={amount}
                                    onChange={this.onAmountChanged.bind(this)}
                                    asset={"1.3.0"}
                                    assets={["1.3.0"]}
                                    min={minDeposit}
                                    inputId={"amountInput_" + minDeposit}
                                />
                                <span className="static-transfer__asset">
                                    CWD
                                </span>

                                <div
                                    className={
                                        isSubmitValid
                                            ? "static-transfer__min-block"
                                            : "static-transfer__min-block static-transfer__min-block--alert"
                                    }
                                >
                                    {isAmountValid ? (
                                        <span>
                                            <Translate content="static-transfer.min" />{" "}
                                            {minDeposit}
                                            {" CWD"}
                                        </span>
                                    ) : (
                                        <span>
                                            <Translate content="static-transfer.non_balance" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            {width < 576 ? (
                                <Translate
                                    className="static-transfer__header-text"
                                    content="static-transfer.fee"
                                />
                            ) : null}
                            <div className="static-transfer__item static-transfer__item--submit">
                                {/*  FEE   */}
                                <div
                                    className="static-transfer__field-wrap static-transfer__field-wrap--fee"
                                    id="inputRoundWrap"
                                >
                                    <AmountSelector
                                        refCallback={this.setNestedRef.bind(
                                            this
                                        )}
                                        disabled={true}
                                        amount={fee}
                                        asset={"1.3.0"}
                                        assets={["1.3.0"]}
                                        inputClass={
                                            "static-transfer__fee-field"
                                        }
                                    />

                                    <span className="static-transfer__asset">
                                        CWD
                                    </span>
                                </div>

                                {/*  SUBMIT   */}
                                <button
                                    // disabled={!isSubmitValid}
                                    className="cwd-btn__rounded cwd-btn__rounded--confirm"
                                    onClick={
                                        proposal
                                            ? this.isWalletLocked.bind(
                                                  this,
                                                  accountID
                                              )
                                            : this.isWalletLocked.bind(
                                                  this,
                                                  null
                                              )
                                    }
                                >
                                    {proposal ? (
                                        <Translate content="static-transfer.propose_btn" />
                                    ) : (
                                        <Translate content="static-transfer.send_btn" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default StakingTransfer;
