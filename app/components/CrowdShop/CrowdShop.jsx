import React from "react";
import BalanceComponent from "../Utility/BalanceComponent";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountStore from "stores/AccountStore";
import AmountSelector from "../Utility/AmountSelector";
import utils from "common/utils";
import counterpart from "counterpart";
import TransactionConfirmStore from "stores/TransactionConfirmStore";
import Immutable from "immutable";
import {ChainStore} from "bitsharesjs";
import {connect} from "alt-react";
import {
    checkFeeStatusAsync,
    checkBalance,
    shouldPayFeeWithAssetAsync
} from "common/trxHelper";
import {debounce, isNaN} from "lodash-es";
import classnames from "classnames";
import {Asset} from "common/MarketClasses";
import queryString from "query-string";

import "./scss/shopping-transfer.scss";

class CrowdShop extends React.Component {
    constructor(props) {
        super(props);
        let state = CrowdShop.getInitialState();
        let query = queryString.parse(props.location.search) || {};

        if (query.from) {
            state.from_name = query.from;
            ChainStore.getAccount(query.from);
        }
        if (query.to) {
            state.to_name = query.to;
            ChainStore.getAccount(query.to);
        }
        if (query.amount) state.amount = query.amount;
        if (query.asset) {
            state.asset_id = query.asset;
            state.asset = ChainStore.getAsset(query.asset);
        }
        if (query.memo) state.memo = query.memo;
        let currentAccount = AccountStore.getState().currentAccount;
        if (!state.from_name) state.from_name = currentAccount;

        this.state = state;
        this.onTrxIncluded = this.onTrxIncluded.bind(this);

        this._updateFee = debounce(this._updateFee.bind(this), 250);
        this._checkFeeStatus = this._checkFeeStatus.bind(this);
        this._checkBalance = this._checkBalance.bind(this);
    }

    static getInitialState() {
        return {
            from_name: "",
            to_name: "",
            from_account: null,
            to_account: null,
            amount: "",
            asset_id: null,
            asset: null,
            memo: "",
            error: null,
            propose: false,
            propose_account: "",
            feeAsset: null,
            fee_asset_id: "1.3.0",
            feeAmount: new Asset({amount: 0}),
            feeStatus: {}
        };
    }

    componentDidMount() {
        this.nestedRef = null;
        this._updateFee();
        this._checkFeeStatus();

        var url_string = window.location.href;
        var url = new URL(url_string);
        var to_name = url.searchParams.get("to_name");

        this.setState({
            to_name: to_name
        });
    }

    shouldComponentUpdate(np, ns) {
        let {asset_types: current_types} = this._getAvailableAssets();
        let {asset_types: next_asset_types} = this._getAvailableAssets(ns);

        if (next_asset_types.length === 1) {
            let asset = ChainStore.getAsset(next_asset_types[0]);
            if (current_types.length !== 1) {
                this.onAmountChanged({amount: ns.amount, asset});
            }

            if (next_asset_types[0] !== this.state.fee_asset_id) {
                if (asset && this.state.fee_asset_id !== next_asset_types[0]) {
                    this.setState({
                        feeAsset: asset,
                        fee_asset_id: next_asset_types[0]
                    });
                }
            }
        }
        return true;
    }

    UNSAFE_componentWillReceiveProps(np) {
        if (
            np.currentAccount !== this.state.from_name &&
            np.currentAccount !== this.props.currentAccount
        ) {
            this.setState(
                {
                    from_name: np.from_name,
                    from_account: ChainStore.getAccount(np.from_name),
                    to_name: np.to_name ? np.to_name : "",
                    to_account: np.to_name
                        ? ChainStore.getAccount(np.to_name)
                        : null,
                    feeStatus: {},
                    fee_asset_id: "1.3.0",
                    feeAmount: new Asset({amount: 0})
                },
                () => {
                    this._updateFee();
                    this._checkFeeStatus();
                }
            );
        }
    }

    _checkBalance() {
        const {feeAmount, amount, from_account, asset} = this.state;
        if (!asset || !from_account) return;
        this._updateFee();
        const balanceID = from_account.getIn(["balances", asset.get("id")]);
        const feeBalanceID = from_account.getIn([
            "balances",
            feeAmount.asset_id
        ]);
        if (!asset || !from_account) return;
        if (!balanceID) return this.setState({balanceError: true});
        let balanceObject = ChainStore.getObject(balanceID);
        let feeBalanceObject = feeBalanceID
            ? ChainStore.getObject(feeBalanceID)
            : null;
        if (!feeBalanceObject || feeBalanceObject.get("balance") === 0) {
            this.setState({fee_asset_id: "1.3.0"}, this._updateFee);
        }
        if (!balanceObject || !feeAmount) return;
        if (!amount) return this.setState({balanceError: false});
        const hasBalance = checkBalance(
            amount,
            asset,
            feeAmount,
            balanceObject
        );
        if (hasBalance === null) return;
        this.setState({balanceError: !hasBalance});
    }

    _checkFeeStatus(state = this.state) {
        let {from_account, open} = state;
        if (!from_account || !open) return;

        const assets = Object.keys(from_account.get("balances").toJS()).sort(
            utils.sortID
        );
        let feeStatus = {};
        let p = [];
        assets.forEach(a => {
            p.push(
                checkFeeStatusAsync({
                    accountID: from_account.get("id"),
                    feeID: a,
                    options: ["price_per_kbyte"],
                    data: {
                        type: "memo",
                        content: this.state.memo
                    }
                })
            );
        });
        Promise.all(p)
            .then(status => {
                assets.forEach((a, idx) => {
                    feeStatus[a] = status[idx];
                });
                if (!utils.are_equal_shallow(this.state.feeStatus, feeStatus)) {
                    this.setState({
                        feeStatus
                    });
                }
                this._checkBalance();
            })
            .catch(err => {
                console.error(err);
            });
    }

    _updateFee(state = this.state) {
        let {fee_asset_id, from_account, asset_id} = state;
        const {fee_asset_types} = this._getAvailableAssets(state);
        if (
            fee_asset_types.length === 1 &&
            fee_asset_types[0] !== fee_asset_id
        ) {
            fee_asset_id = fee_asset_types[0];
        }
        if (!from_account) return null;
        checkFeeStatusAsync({
            accountID: from_account.get("id"),
            feeID: fee_asset_id,
            options: ["price_per_kbyte"],
            data: {
                type: "memo",
                content: state.memo
            }
        }).then(({fee, hasBalance, hasPoolBalance}) =>
            shouldPayFeeWithAssetAsync(from_account, fee).then(should =>
                should
                    ? this.setState({fee_asset_id: asset_id}, this._updateFee)
                    : this.setState({
                          feeAmount: fee,
                          fee_asset_id: fee.asset_id,
                          hasBalance,
                          hasPoolBalance,
                          error: !hasBalance || !hasPoolBalance
                      })
            )
        );
    }

    fromChanged(from_name) {
        if (this.state.propose) this.setState({from_name});
    }

    toChanged(to_name) {
        this.setState({to_name, error: null});
    }

    onFromAccountChanged(from_account) {
        this.setState({from_account});
    }

    onToAccountChanged(to_account) {
        this.setState({to_account, error: null});
    }

    onAmountChanged({amount, asset}) {
        if (!asset) {
            return;
        }
        this.setState(
            {
                amount,
                asset,
                asset_id: asset.get("id"),
                error: null,
                maxAmount: false
            },
            this._checkBalance
        );
    }

    onFeeChanged({asset}) {
        this.setState(
            {feeAsset: asset, fee_asset_id: asset.get("id"), error: null},
            this._updateFee
        );
    }

    onMemoChanged(e) {
        this.setState({memo: e.target.value});
        this._updateFee;
    }

    onTrxIncluded(confirm_store_state) {
        if (
            confirm_store_state.included &&
            confirm_store_state.broadcasted_transaction
        ) {
            // this.setState(CrowdShop.getInitialState());
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        } else if (confirm_store_state.closed) {
            TransactionConfirmStore.unlisten(this.onTrxIncluded);
            TransactionConfirmStore.reset();
        }
    }

    resetForm() {
        this.setState({memo: "", to_name: "", amount: ""});
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({error: null});

        const {asset} = this.state;
        let {amount} = this.state;
        const sendAmount = new Asset({
            real: amount,
            asset_id: asset.get("id"),
            precision: asset.get("precision")
        });

        AccountActions.transfer(
            this.state.from_account.get("id"),
            this.state.to_account.get("id"),
            sendAmount.getAmount(),
            asset.get("id"),
            this.state.memo
                ? new Buffer(this.state.memo, "utf-8")
                : this.state.memo,
            this.state.propose ? this.state.propose_account : null,
            this.state.feeAsset ? this.state.feeAsset.get("id") : "1.3.0"
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

    setNestedRef(ref) {
        this.nestedRef = ref;
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
            this.setState(
                {maxAmount: true, amount: balance.getAmount({real: true})},
                this._checkBalance
            );
        }
    }

    _getAvailableAssets(state = this.state) {
        const {feeStatus} = this.state;
        function hasFeePoolBalance(id) {
            if (feeStatus[id] === undefined) return true;
            return feeStatus[id] && feeStatus[id].hasPoolBalance;
        }

        function hasBalance(id) {
            if (feeStatus[id] === undefined) return true;
            return feeStatus[id] && feeStatus[id].hasBalance;
        }

        const {from_account, from_error} = state;
        let asset_types = [],
            fee_asset_types = [];
        if (!(from_account && from_account.get("balances") && !from_error)) {
            return {asset_types, fee_asset_types};
        }
        let account_balances = state.from_account.get("balances").toJS();
        asset_types = Object.keys(account_balances).sort(utils.sortID);
        fee_asset_types = Object.keys(account_balances).sort(utils.sortID);
        for (let key in account_balances) {
            let balanceObject = ChainStore.getObject(account_balances[key]);
            if (balanceObject && balanceObject.get("balance") === 0) {
                asset_types.splice(asset_types.indexOf(key), 1);
                if (fee_asset_types.indexOf(key) !== -1) {
                    fee_asset_types.splice(fee_asset_types.indexOf(key), 1);
                }
            }
        }

        fee_asset_types = fee_asset_types.filter(a => {
            return hasFeePoolBalance(a) && hasBalance(a);
        });

        return {asset_types, fee_asset_types};
    }

    render() {
        let {
            propose,
            from_account,
            to_account,
            asset,
            asset_id,
            feeAmount,
            amount,
            error,
            to_name,
            from_name,
            memo,
            feeAsset,
            fee_asset_id,
            balanceError
        } = this.state;

        let from_my_account =
            AccountStore.isMyAccount(from_account) ||
            from_name === this.props.passwordAccount;
        let from_error =
            from_account && !from_my_account && !propose ? true : false;

        let {asset_types, fee_asset_types} = this._getAvailableAssets();
        let balance = null;
        let balance_fee = null;

        // Estimate fee
        let fee = this.state.feeAmount.getAmount({real: true});
        if (from_account && from_account.get("balances") && !from_error) {
            let account_balances = from_account.get("balances").toJS();
            let _error = this.state.balanceError ? "has-error" : "valid-amount";
            if (asset_types.length === 1)
                asset = ChainStore.getAsset(asset_types[0]);
            if (asset_types.length > 0) {
                let current_asset_id = asset ? asset.get("id") : asset_types[0];
                let feeID = feeAsset ? feeAsset.get("id") : "1.3.0";

                balance = (
                    <span>
                        <Translate
                            className="transfer__text"
                            content="transfer.available"
                        />{" "}
                        <span
                            className={_error}
                            onClick={this._setTotal.bind(
                                this,
                                current_asset_id,
                                account_balances[current_asset_id],
                                fee,
                                feeID
                            )}
                        >
                            <BalanceComponent
                                balance={account_balances[current_asset_id]}
                            />
                        </span>
                    </span>
                );

                if (feeID == current_asset_id && this.state.balanceError) {
                    balance_fee = (
                        <span>
                            <span className={_error}>
                                <Translate content="transfer.errors.insufficient" />
                            </span>
                        </span>
                    );
                }
            } else {
                balance = (
                    <span>
                        <span className={_error}>
                            <Translate content="transfer.errors.noFunds" />
                        </span>
                    </span>
                );
                balance_fee = (
                    <span>
                        <span className={_error}>
                            <Translate content="transfer.errors.noFunds" />
                        </span>
                    </span>
                );
            }
        }

        const amountValue = parseFloat(
            String.prototype.replace.call(amount, /,/g, "")
        );
        const isAmountValid = amountValue && !isNaN(amountValue);
        const isToAccountValid =
            to_account && to_account.get("name") === to_name;
        const isSendNotValid =
            !from_account ||
            !isToAccountValid ||
            !isAmountValid ||
            !asset ||
            from_error ||
            balanceError;

        let tabIndex = 1;

        return (
            <section className="cwd-common__wrap">
                <form
                    className="shopping-transfer__form"
                    onSubmit={this.onSubmit.bind(this)}
                    noValidate
                >
                    <Translate
                        className="cwd-common__title"
                        content="shopping.transfer_title"
                    />

                    {/*  M E M O  */}
                    <div className="content-block transfer-input">
                        <span className="shopping-transfer__details">
                            {memo}
                        </span>
                    </div>

                    <div className="shopping-transfer__inner">
                        {/*  F R O M  */}
                        <div className="content-block">
                            <label className="cwd-common__label">
                                {counterpart.translate("shopping.customer")}
                            </label>
                            <AccountSelector
                                label="transfer.from"
                                accountName={from_name}
                                account={from_account}
                                onChange={this.fromChanged.bind(this)}
                                onAccountChanged={this.onFromAccountChanged.bind(
                                    this
                                )}
                                size={60}
                                typeahead={propose || undefined}
                                hideImage
                                isDisabled={true}
                            />
                        </div>
                        {/*  T O  */}
                        <div className="content-block">
                            <label className="cwd-common__label">
                                {counterpart.translate("shopping.shop")}
                            </label>
                            <AccountSelector
                                label="transfer.to"
                                accountName={to_name}
                                account={to_name}
                                onChange={this.toChanged.bind(this)}
                                onAccountChanged={this.onToAccountChanged.bind(
                                    this
                                )}
                                size={60}
                                hideImage
                                isDisabled={true}
                            />
                        </div>
                        {/*  A M O U N T   */}
                        <div className="content-block">
                            <AmountSelector
                                label="shopping.amount"
                                amount={amount}
                                onChange={this.onAmountChanged.bind(this)}
                                asset={
                                    asset_types.length > 0 && asset
                                        ? asset.get("id")
                                        : asset_id
                                        ? asset_id
                                        : asset_types[0]
                                }
                                assets={asset_types}
                                tabIndex={2}
                                allowNaN={true}
                                disabled={true}
                            />
                            {this.state.balanceError ? (
                                <p
                                    className="has-error no-margin"
                                    style={{paddingTop: 10}}
                                >
                                    <Translate content="transfer.errors.insufficient" />
                                </p>
                            ) : null}
                        </div>

                        {/*  F E E   */}
                        <div className="content-block">
                            <AmountSelector
                                label="transfer.fee"
                                disabled={true}
                                amount={fee}
                                onChange={this.onFeeChanged.bind(this)}
                                asset={
                                    fee_asset_types.length && feeAmount
                                        ? feeAmount.asset_id
                                        : fee_asset_types.length === 1
                                        ? fee_asset_types[0]
                                        : fee_asset_id
                                        ? fee_asset_id
                                        : fee_asset_types[0]
                                }
                                assets={["1.3.0", "1.3.3"]}
                                tabIndex={4}
                                error={
                                    this.state.hasPoolBalance === false
                                        ? "transfer.errors.insufficient"
                                        : null
                                }
                                scroll_length={2}
                            />
                        </div>

                        <button
                            className={classnames(
                                "cwd-btn__rounded cwd-btn__rounded--confirm",
                                "cwd-btn__rounded cwd-btn__rounded--disabled"
                            )}
                            type="submit"
                            value="Submit"
                            tabIndex={tabIndex++}
                            disabled={isSendNotValid}
                        >
                            <Translate
                                component="span"
                                content="shopping.pay_btn"
                            />
                        </button>
                    </div>
                </form>
            </section>
        );
    }
}

export default connect(CrowdShop, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        return {
            currentAccount: AccountStore.getState().currentAccount,
            passwordAccount: AccountStore.getState().passwordAccount,
            contactsList: AccountStore.getState().accountContacts
        };
    }
});
