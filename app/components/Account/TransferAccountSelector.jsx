import React from "react";
import { ChainStore } from "bitsharesjs";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import counterpart from "counterpart";
import PropTypes from "prop-types";


//STYLES
import "./scss/transfer-account-selector.scss"

class TransferAccountSelector extends React.Component {
    static propTypes = {
        label: PropTypes.string, // a translation key for the label
        placeholder: PropTypes.string, // the placeholder text to be displayed when there is no user_input
        onChange: PropTypes.func, // a method to be called any time user input changes
        onAccountChanged: PropTypes.func, // a method to be called when existing account is selected
        accountName: PropTypes.string, // the current value of the account selector, the string the user enters
        account: ChainTypes.ChainAccount, // account object retrieved via BindToChainState decorator (not input)
    };

    static defaultProps = {
        autosubscribe: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            inspectedAccount: null,
            scamArray: [],
            isSearchValue: ""
        }
        this._updateState = this._updateState.bind(this);
    }

    componentDidMount() {
        let { account, accountName, inputId } = this.props;

        if (typeof account === "undefined")
            account = ChainStore.getAccount(accountName);

        if (this.props.onAccountChanged && account)
            this.props.onAccountChanged(account);

        if (accountName)
            this.onInputChanged(accountName);
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.account && newProps.account !== this.props.account) {
            if (this.props.onAccountChanged)
                this.props.onAccountChanged(newProps.account);
        }
    }

    UNSAFE_componentWillMount() {
        ChainStore.subscribe(this._updateState);
        if (this.state.scamArray.length === 0) {
            let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");
            let scamArray = []
            if (scamAccounts) {
                scamAccounts.get("blacklisted_accounts").map(acc => {
                    scamArray.push(acc)
                })
                this.setState({
                    scamArray: scamArray
                });
            }
        }
    }

    componentWillUnmount() {
        ChainStore.unsubscribe(this._updateState);
    }

    _updateState() {
        // GET SCAM ACCOUNTS
        if (this.state.scamArray.length === 0) {
            let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");
            let scamArray = []
            if (scamAccounts) {
                scamAccounts.get("blacklisted_accounts").map(acc => {
                    scamArray.push(acc)
                })
                this.setState({
                    scamArray: scamArray
                });
            }
        }
        // GET ACCOUNT
        const accountName = document.getElementById(this.props.inputId).value.toLowerCase();
        let inspectedAccount = ChainStore.getAccount(accountName);
        if (this.state.inspectedAccount === null) {
            if (inspectedAccount) {
                this.findAccount(inspectedAccount)
            }
        }
        else {
            if ((inspectedAccount && inspectedAccount.get("name") != this.state.inspectedAccount.get("name")) || inspectedAccount === null) {
                this.findAccount(inspectedAccount)
            }
        }
    }

    onInputChanged() {
        const accountName = document.getElementById(this.props.inputId).value.toLowerCase();

        this.setState({
            isSearchValue: accountName
        })

        let inspectedAccount = ChainStore.getAccount(accountName);
        if (this.state.inspectedAccount === null) {
            if (inspectedAccount) {
                this.findAccount(inspectedAccount)
            }
        }
        else {
            if ((inspectedAccount && inspectedAccount.get("name") != this.state.inspectedAccount.get("name")) || inspectedAccount === null) {
                this.findAccount(inspectedAccount)
            }
        }
    }

    findAccount(inspectedAccount) {
        if (inspectedAccount) {
            this.setState({
                inspectedAccount: inspectedAccount
            });
            this.props.onAccountChanged(inspectedAccount);
        }
        if (inspectedAccount === null) {
            this.setState({
                inspectedAccount: null
            });
            this.props.onAccountChanged(null);
        }
    }

    render() {
        let { showStatus } = this.props;
        let { inspectedAccount, isSearchValue } = this.state;
        let accountStatusTip;
        let statusTipClass;
        let inputClass;
        let inspectedAccId;
        let accountStatus = null;
        let contractName = [" Client", " Start", " Expert", " Citizen", " Infinity"];

        if (inspectedAccount != null) {
            inspectedAccId = inspectedAccount.get("id");

            accountStatus = inspectedAccount ?
                inspectedAccount.get("referral_status_type")
                : null;
            let accountMember = inspectedAccount
                ? ChainStore.getAccountMemberStatus(inspectedAccount)
                : null;


            if (this.state.scamArray.includes(inspectedAccount.get("id"))) {
                accountStatusTip = counterpart.translate("account.member.suspected_scammer");
                statusTipClass = "transfer-account-selector__status-tip transfer-account-selector__status-tip--scammer";
                inputClass = "transfer-modal transfer-modal--scammer";
            }
            else {
                accountStatusTip = counterpart.translate("account.member." + accountMember) + " " + counterpart.translate("address_book.contract") + contractName[accountStatus]+", #"+inspectedAccId.split(".")[2];
                statusTipClass = "transfer-account-selector__status-tip  transfer-account-selector__status-tip--success";
                inputClass = "transfer-modal";
            }
        }
        else {
            accountStatusTip = counterpart.translate("address_book.no_such_account");
            statusTipClass = "transfer-account-selector__status-tip";
            inputClass = "transfer-modal";
        }

        return (
            <div className="account-selector">
                <div className="account-selector__input-wrap">
                    <input
                        id={this.props.inputId}
                        autoComplete="off"
                        type="text"
                        placeholder={this.props.placeholder || counterpart.translate("account.name")}
                        onChange={this.onInputChanged.bind(this)}
                        className={"cwd-common__input"}
                        readOnly={this.props.readOnly}
                        value={this.props.accountName}
                    />

                    {isSearchValue.length > 0 && showStatus ?
                        <div className={statusTipClass}>
                            <span>{accountStatusTip}</span>
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    }
}

TransferAccountSelector = BindToChainState(TransferAccountSelector);

export default TransferAccountSelector;