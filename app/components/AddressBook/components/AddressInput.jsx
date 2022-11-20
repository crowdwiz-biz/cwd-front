import React from "react";
import counterpart from "counterpart";
import { ChainStore } from "bitsharesjs";
import AddressCard from "./AddressCard";
import NewIcon from "../../NewIcon/NewIcon";


class AddressInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inspectedAccount: null,
            scamArray: [],
            isSearchValue: ""
        }
        this._updateState = this._updateState.bind(this);
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
        const accountName = document.getElementById("accountNameInput").value.toLowerCase();
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
        const accountName = document.getElementById("accountNameInput").value.toLowerCase();

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
        }
        if (inspectedAccount === null) {
            this.setState({
                inspectedAccount: null
            });
        }
    }

    clearSearchInput() {
        document.getElementById("accountNameInput").value = "";

        this.setState({
            isSearchValue: "",
            inspectedAccount: null
        });
    }

    render() {
        let currentAccount = this.props.currentAccount;
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
                statusTipClass = "address-input__status-tip address-input__status-tip--scammer";
                inputClass = "address-input address-input--scammer";
            }
            else {
                accountStatusTip = counterpart.translate("account.member." + accountMember) + " " + counterpart.translate("address_book.contract") + contractName[accountStatus];
                statusTipClass = "address-input__status-tip  address-input__status-tip--success";
                inputClass = "address-input";
            }
        }
        else {
            accountStatusTip = counterpart.translate("address_book.no_such_account");
            statusTipClass = "address-input__status-tip";
            inputClass = "address-input";
        }

        return (
            <div className="address-input__container">
                <div className="address-input__wrap">
                    <input
                        id="accountNameInput"
                        autoComplete="off"
                        type="text"
                        placeholder={counterpart.translate("address_book.input_placeholder")}
                        onChange={this.onInputChanged.bind(this)}
                        className={inputClass + " cwd-common__input"}
                    />

                    <span className="address-input__clear-btn" onClick={this.clearSearchInput.bind(this)}>
                        <NewIcon
                            iconWidth={15}
                            iconHeight={18}
                            iconName={"address-book_close_icon"}
                        />
                    </span>

                    {isSearchValue.length > 0 ?
                        <div className={statusTipClass}>
                            <span>{accountStatusTip}</span>
                        </div>
                        : null
                    }
                </div>

                {inspectedAccount != null ?
                    <div className="address-input__card-container">
                        <AddressCard
                            inspectedAccId={inspectedAccId}
                            currentAccount={currentAccount}
                            history={this.props.history}
                        />
                    </div>
                    : null
                }
            </div>
        );
    }
}

export default AddressInput;