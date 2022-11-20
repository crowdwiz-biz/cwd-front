import React from "react";
import {Tabs, Tab} from "../Utility/Tabs";
import constants from "chain/account_constants.js";
import AccountSelector from "../Account/AccountSelector";
import Immutable from "immutable";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import LinkToAccountById from "../Utility/LinkToAccountById";
import WalletApi from "api/WalletApi";
import WalletDb from "stores/WalletDb.js";
import NewIcon from "../NewIcon/NewIcon";

class AccountRow extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        tempComponent: "tr"
    };

    render() {
        let {account, onRemove} = this.props;

        return (
            <tr>
                <td>{this.props.index}</td>
                <td>{account.get("id")}</td>
                <td>
                    <LinkToAccountById account={account.get("id")} />
                </td>
                {onRemove ? (
                    <td>
                        <button
                            onClick={onRemove.bind(this, account.get("id"))}
                            className="remove-btn"
                        >
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"cross"}
                            />
                        </button>
                    </td>
                ) : null}
            </tr>
        );
    }
}
AccountRow = BindToChainState(AccountRow);

class AccountList extends React.Component {
    _onRemove(listing, account, e) {
        if (account) {
            let currentState = this.props.getCurrentState(account);
            let tr = WalletApi.new_transaction();
            tr.add_type_operation("account_whitelist", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                authorizing_account: this.props.account.get("id"),
                account_to_list: account,
                new_listing: currentState - constants.account_listing[listing]
            });
            WalletDb.process_transaction(tr, null, true);
        }
    }

    render() {
        let {removeButton, white, list} = this.props;

        let rows = list
            .map((account, index) => {
                return (
                    <AccountRow
                        key={account}
                        onRemove={
                            removeButton
                                ? this._onRemove.bind(
                                      this,
                                      white ? "white_listed" : "black_listed"
                                  )
                                : null
                        }
                        account={account}
                        index={index + 1}
                    />
                );
            })
            .toArray();

        let showHeaders = true;
        if (!rows.length) {
            showHeaders = false;
            rows.push(
                <tr key="empty">
                    <td
                        style={{padding: "1rem 0"}}
                        colSpan={removeButton ? 4 : 3}
                    >
                        <Translate
                            content={this.props.emptyText}
                            account={this.props.account.get("name")}
                        />
                    </td>
                </tr>
            );
        }

        return (
            <table className="table compact dashboard-table">
                {showHeaders ? (
                    <thead>
                        <tr>
                            <th>
                                <Translate content="general.number" />
                            </th>
                            <th>
                                <Translate content="account.id" />
                            </th>
                            <th>
                                <Translate content="account.name" />
                            </th>
                            {removeButton ? <th /> : null}
                        </tr>
                    </thead>
                ) : null}
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

class AccountWhitelist extends React.Component {
    constructor() {
        super();

        this.state = {
            accountName: "",
            accountToList: null
        };
    }

    _getCurrentState(id) {
        let {account} = this.props;
        let white = account.get("whitelisted_accounts") || Immutable.List();
        let black = account.get("blacklisted_accounts") || Immutable.List();
        let current = constants.account_listing.no_listing;

        if (white.includes(id)) {
            current += constants.account_listing.white_listed;
        }

        if (black.includes(id)) {
            current += constants.account_listing.black_listed;
        }

        return current;
    }

    _onAdd(listing, e) {
        let {accountToList} = this.state;
        let {account} = this.props;

        let currentState = this._getCurrentState(accountToList);

        if (accountToList) {
            let tr = WalletApi.new_transaction();
            tr.add_type_operation("account_whitelist", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                authorizing_account: account.get("id"),
                account_to_list: accountToList,
                new_listing: currentState + constants.account_listing[listing]
            });
            WalletDb.process_transaction(tr, null, true);
        }
    }

    _onAccountFound(account) {
        this.setState({
            accountName: account ? account.get("name") : null,
            accountToList: account ? account.get("id") : null
        });
    }

    _onAccountChanged(account) {
        this.setState({
            accountName: account,
            accountToList: null
        });
    }

    render() {
        let {account} = this.props;
        let {accountName} = this.state;

        const whiteList =
            account.get("whitelisted_accounts") || Immutable.List();
        const blackList =
            account.get("blacklisted_accounts") || Immutable.List();
        const whiteListed = account.get("whitelisting_accounts");
        const blackListed = account.get("blacklisting_accounts");

        return (
            <div ref="appTables">
                <div className="content-block small-12">
                    <div className="tabs-container generic-bordered-box white-list">
                        <Translate
                            content="account.whitelist.header"
                            className="cwd-common__title"
                        />
                        <Tabs
                            className="cwd-tabs"
                            tabsClass="cwd-tabs__list"
                            contentClass="cwd-tabs__content"
                            segmented={false}
                            actionButtons={false}
                            setting="whitelistTab"
                        >
                            <Tab title="account.whitelist.white_tab">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div
                                        style={{padding: "2rem 0"}}
                                        className="white-list__header"
                                    >
                                        <div className="white-list__amount">
                                            <Translate content="account.whitelist.whitelist_title" />
                                            <div>({whiteList.size})</div>
                                        </div>
                                        <AccountSelector
                                            label={"account.whitelist.add"}
                                            accountName={accountName}
                                            onAccountChanged={this._onAccountFound.bind(
                                                this
                                            )}
                                            onChange={this._onAccountChanged.bind(
                                                this
                                            )}
                                            account={accountName}
                                            tabIndex={2}
                                            onAction={this._onAdd.bind(
                                                this,
                                                "white_listed"
                                            )}
                                            action_label="account.perm.confirm_add"
                                            white={false}
                                            typeahead={true}
                                        />
                                    </div>

                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty"
                                            account={account}
                                            getCurrentState={this._getCurrentState.bind(
                                                this
                                            )}
                                            list={
                                                account.get(
                                                    "whitelisted_accounts"
                                                ) || Immutable.List()
                                            }
                                            removeButton
                                            white={true}
                                        />
                                    </div>
                                    {!account.get("whitelisted_accounts") ? (
                                        <p className="has-error">
                                            Please note, whitelisting is not
                                            working yet due to unresolved
                                            backend issue.
                                        </p>
                                    ) : null}
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.black_tab">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div
                                        style={{padding: "2rem 0"}}
                                        className="white-list__header"
                                    >
                                        <div className="white-list__amount">
                                            <Translate content="account.whitelist.blacklist_title" />
                                            <div>({blackList.size})</div>
                                        </div>
                                        <AccountSelector
                                            label={
                                                "account.whitelist.add_black"
                                            }
                                            accountName={accountName}
                                            onAccountChanged={this._onAccountFound.bind(
                                                this
                                            )}
                                            onChange={this._onAccountChanged.bind(
                                                this
                                            )}
                                            account={accountName}
                                            tabIndex={2}
                                            onAction={this._onAdd.bind(
                                                this,
                                                "black_listed"
                                            )}
                                            action_label="account.perm.confirm_add"
                                            typeahead={true}
                                        />
                                    </div>
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_black"
                                            account={account}
                                            getCurrentState={this._getCurrentState.bind(
                                                this
                                            )}
                                            list={account.get(
                                                "blacklisted_accounts"
                                            )}
                                            removeButton
                                        />
                                    </div>
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.white_by">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div className="white-list__amount white-list__amount--bottom">
                                        <Translate content="account.whitelist.white_by" />
                                        <div>({whiteListed.size})</div>
                                    </div>
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_white_by"
                                            account={account}
                                            list={account.get(
                                                "whitelisting_accounts"
                                            )}
                                        />
                                    </div>
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.black_by">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div className="white-list__amount white-list__amount--bottom">
                                        <Translate content="account.whitelist.black_by" />
                                        <div>({blackListed.size})</div>
                                    </div>
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_black_by"
                                            account={account}
                                            list={account.get(
                                                "blacklisting_accounts"
                                            )}
                                        />
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountWhitelist;
