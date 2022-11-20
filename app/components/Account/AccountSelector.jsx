import React from "react";
import utils from "common/utils";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import { ChainStore, PublicKey, ChainValidation, FetchChain } from "bitsharesjs";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import classnames from "classnames";
import counterpart from "counterpart";
import accountUtils from "common/account_utils";
import FloatingDropdown from "../Utility/FloatingDropdown";
import PropTypes from "prop-types";
import { Tooltip } from "crowdwiz-ui-modal";

/**
 * @brief Allows the user to enter an account by name or #ID
 *
 * This component is designed to be stateless as possible.  It's primary responsbility is to
 * manage the layout of data and to filter the user input.
 *
 */

class AccountSelector extends React.Component {
    static propTypes = {
        label: PropTypes.string, // a translation key for the label
        error: PropTypes.element, // the error message override
        placeholder: PropTypes.string, // the placeholder text to be displayed when there is no user_input
        onChange: PropTypes.func, // a method to be called any time user input changes
        onAccountChanged: PropTypes.func, // a method to be called when existing account is selected
        onAction: PropTypes.func, // a method called when Add button is clicked
        accountName: PropTypes.string, // the current value of the account selector, the string the user enters
        account: ChainTypes.ChainAccount, // account object retrieved via BindToChainState decorator (not input)
        tabIndex: PropTypes.number, // tabindex property to be passed to input tag
        disableActionButton: PropTypes.bool, // use it if you need to disable action button,
        allowUppercase: PropTypes.bool, // use it if you need to allow uppercase letters
        typeahead: PropTypes.bool,
        excludeAccounts: PropTypes.array, // array of accounts to exclude from the typeahead
        focus: PropTypes.bool
    };

    static defaultProps = {
        autosubscribe: false,
        excludeAccounts: []
    };

    constructor(props) {
        super(props);
        this.state = {
            inputChanged: false,
            accountStatusText: ""
        };
    }

    componentDidMount() {
        let { account, accountName } = this.props;

        if (typeof account === "undefined")
            account = ChainStore.getAccount(accountName);

        if (this.props.onAccountChanged && account)
            this.props.onAccountChanged(account);

        if (accountName)
            this.onInputChanged(accountName);
    }

    componentDidUpdate() {
        if (this.props.focus) {
            this.refs.user_input.focus();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.account && newProps.account !== this.props.account) {
            if (this.props.onAccountChanged)
                this.props.onAccountChanged(newProps.account);
        }
    }

    // can be used in parent component: this.refs.account_selector.getAccount()
    getAccount() {
        return this.props.account;
    }

    getError() {
        let { account, error } = this.props;

        if (!error && account && !this.getInputType(account.get("name")))
            error = counterpart.translate("account.errors.invalid");

        return error;
    }

    getInputType(value) {
        // OK
        if (!value) return null;
        if (value[0] === "#" && utils.is_object_id("1.2." + value.substring(1)))
            return "id";
        if (ChainValidation.is_account_name(value, true)) return "name";
        if (this.props.allowPubKey && PublicKey.fromPublicKeyString(value))
            return "pubkey";
        return null;
    }

    onSelected(e) {
        this.setState({ inputChanged: false });
        this._notifyOnChange(e);
    }

    _notifyOnChange(e) {
        let { onChange, onAccountChanged, accountName } = this.props;

        let _accountName = this.getVerifiedAccountName(e);

        if (_accountName === accountName) {
            // nothing has changed, don't notify
            return;
        }

        // Synchronous onChange for input change
        if (!!onChange && (!!_accountName || _accountName === ""))
            onChange(_accountName);

        // asynchronous onAccountChanged for checking on chain
        if (!!onAccountChanged) {
            FetchChain("getAccount", _accountName, undefined, {
                [_accountName]: false
            })
                .then(_account => {
                    if (!!_account) {
                        onAccountChanged(_account);
                    }
                })
                .catch(err => {
                    // error fetching
                    console.log(err);
                });
        }
    }

    onInputChanged(e) {
        this.setState({
            inputChanged: true
        });

        this._notifyOnChange(e);
    }

    getVerifiedAccountName(e) {
        let { allowUppercase } = this.props;

        let value = null;
        if (typeof e === "string") {
            value = e;
        } else if (e && e.target) {
            value = e.target.value.trim();
        } else {
            value = "";
        }

        if (!allowUppercase) value = value.toLowerCase();

        // If regex matches ^.*#/account/account-name/.*$, parse out account-name
        let _value = value.replace("#", "").match(/(?:\/account\/)(.*)/);
        if (_value) value = _value[1];
        
        return value;
    }

    _onAddContact() {
        AccountActions.addAccountContact(this.props.accountName);
    }

    _onRemoveContact() {
        AccountActions.removeAccountContact(this.props.accountName);
    }

    onAction(e) {
        let { onAction, disableActionButton, account, accountName } = this.props;
        e.preventDefault();
        if (!this.getError() && onAction && !disableActionButton) {
            if (account) onAction(account);
            else if (this.getInputType(accountName) === "pubkey")
                onAction(accountName);
        }
    }

    render() {
        let {
            accountName,
            account,
            disableActionButton
        } = this.props;

        const inputType = this.getInputType(accountName);
        let error = this.getError();

        let inspectedAccount = ChainStore.getAccount(accountName);
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        let accountStatusTip;
        let tipClassName;
        let accountStatusText;
        let scamArray = [];

        if (account && scamAccounts) {
            scamAccounts.get("blacklisted_accounts").map(acc => {
                scamArray.push(acc)
            })
        }

        if (!!accountName) {
            let accountStatus = inspectedAccount
                ? ChainStore.getAccountMemberStatus(inspectedAccount)
                : null;

            accountStatusText = inspectedAccount
                ? !accountUtils.isKnownScammer(inspectedAccount.get("name")) && !scamArray.includes(inspectedAccount.get("id"))
                    ? counterpart.translate("account.member." + accountStatus)
                    : counterpart.translate("account.member.suspected_scammer")
                : counterpart.translate("account.errors.unknown");

            accountStatusTip = accountStatusText;

            tipClassName = accountUtils.isKnownScammer(accountName) || !inspectedAccount || scamArray.includes(inspectedAccount.get("id"))
                ? "account-selector__status-block account-selector__status-block--negative"
                : "account-selector__status-block"
        }

        let actionClass = classnames("button permissions__add-btn", {
            disabled:
                !(account || inputType === "pubkey") ||
                error ||
                disableActionButton
        });

        return (
            <div className="account-selector" style={this.props.style}>
                <div className="content-area">
                    <Tooltip
                        className="input-area cwd-buttons"
                        title={this.props.tooltip}
                    >
                        <div className="inline-label input-wrapper">
                            <div className="account-selector__input-wrap">
                                <input
                                    name="username"
                                    autoComplete="off"
                                    type="text"
                                    value={this.props.accountName || ""}
                                    placeholder={
                                        this.props.placeholder ||
                                        counterpart.translate(
                                            "account.name"
                                        )
                                    }
                                    ref="user_input"
                                    onChange={this.onInputChanged.bind(
                                        this
                                    )}
                                    tabIndex={this.props.tabIndex}
                                    className="cwd-common__input"
                                    disabled={this.props.isDisabled}
                                />

                                {accountStatusTip && this.props.showStatus ?
                                    <div className={tipClassName}>{accountStatusTip}</div> : null
                                }
                            </div>


                            {this.props.dropDownContent ? (
                                <div className="form-label select floating-dropdown">
                                    <FloatingDropdown
                                        entries={this.props.dropDownContent}
                                        values={this.props.dropDownContent.reduce(
                                            (map, a) => {
                                                if (a) map[a] = a;
                                                return map;
                                            },
                                            {}
                                        )}
                                        singleEntry={
                                            this.props.dropDownContent[0]
                                        }
                                        value={this.props.dropDownValue || ""}
                                        onChange={this.props.onDropdownSelect}
                                    />
                                </div>
                            ) : null}
                            {this.props.children}
                            {this.props.onAction ? (
                                <button
                                    className={actionClass}
                                    onClick={this.onAction.bind(this)}
                                >
                                    <Translate
                                        content={this.props.action_label}
                                    />
                                </button>
                            ) : null}
                        </div>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

AccountSelector = BindToChainState(AccountSelector);

export default AccountSelector;