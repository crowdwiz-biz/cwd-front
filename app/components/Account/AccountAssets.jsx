import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import Translate from "react-translate-component";
import AssetActions from "actions/AssetActions";
import AssetStore from "stores/AssetStore";
import AccountActions from "actions/AccountActions";
import FormattedAsset from "../Utility/FormattedAsset";
import {debounce} from "lodash-es";
import LoadingIndicator from "../LoadingIndicator";
import IssueModal from "../Modal/IssueModal";
import {connect} from "alt-react";
import assetUtils from "common/asset_utils";
import {Map, List} from "immutable";
import AssetWrapper from "../Utility/AssetWrapper";
import NewIcon from "../NewIcon/NewIcon";

require("./scss/account-asset.scss");

class AccountAssets extends React.Component {
    static defaultProps = {
        symbol: "",
        name: "",
        description: "",
        max_supply: 0,
        precision: 0
    };

    static propTypes = {
        symbol: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            isIssueAssetModalVisible: false,
            create: {
                symbol: "",
                name: "",
                description: "",
                max_supply: 1000000000000000,
                precision: 4
            },
            issue: {
                amount: 0,
                to: "",
                to_id: "",
                asset_id: "",
                symbol: ""
            },
            errors: {
                symbol: null
            },
            isValid: false,
            searchTerm: ""
        };

        this._searchAccounts = debounce(this._searchAccounts, 150);

        this.showIssueAssetModal = this.showIssueAssetModal.bind(this);
        this.hideIssueAssetModal = this.hideIssueAssetModal.bind(this);
    }

    showIssueAssetModal() {
        this.setState({
            isIssueAssetModalVisible: true
        });
    }

    hideIssueAssetModal() {
        this.setState({
            isIssueAssetModalVisible: false
        });
    }

    _checkAssets(assets, force) {
        if (this.props.account.get("assets").size) return;
        let lastAsset = assets
            .sort((a, b) => {
                if (a.symbol > b.symbol) {
                    return 1;
                } else if (a.symbol < b.symbol) {
                    return -1;
                } else {
                    return 0;
                }
            })
            .last();

        if (assets.size === 0 || force) {
            AssetActions.getAssetList.defer("A", 100);
            this.setState({assetsFetched: 100});
        } else if (assets.size >= this.state.assetsFetched) {
            AssetActions.getAssetList.defer(lastAsset.symbol, 100);
            this.setState({assetsFetched: this.state.assetsFetched + 99});
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this._checkAssets(nextProps.assets);
    }

    UNSAFE_componentWillMount() {
        this._checkAssets(this.props.assets, true);
    }

    _onIssueInput(value, e) {
        let key = e.target.id;
        let {issue} = this.state;

        if (key === "to") {
            this._searchAccounts(e.target.value);
            issue.to = e.target.value;
            let account = this.props.searchAccounts.findEntry(name => {
                return name === e.target.value;
            });

            issue.to_id = account ? account[0] : null;
        } else {
            issue[value] = e.target.value;
        }

        this.setState({issue: issue});
    }

    _searchAccounts(searchTerm) {
        AccountActions.accountSearch(searchTerm);
    }

    _issueButtonClick(asset_id, symbol, e) {
        e.preventDefault();
        let {issue} = this.state;
        issue.asset_id = asset_id;
        issue.symbol = symbol;
        this.setState({issue: issue});
        this.showIssueAssetModal();
    }

    _editButtonClick(symbol, account_name, e) {
        e.preventDefault();
        this.props.history.push(
            `/account/${account_name}/update-asset/${symbol}`
        );
    }

    _createButtonClick(account_name) {
        this.props.history.push(`/account/${account_name}/create-asset`);
    }

    render() {
        let {account, account_name, assets, assetsList} = this.props;

        let accountExists = true;
        if (!account) {
            return <LoadingIndicator type="circle" />;
        } else if (account.notFound) {
            accountExists = false;
        }
        if (!accountExists) {
            return (
                <div className="grid-block">
                    <h5>
                        <Translate
                            component="h5"
                            content="account.errors.not_found"
                            name={account_name}
                        />
                    </h5>
                </div>
            );
        }

        if (assetsList.length) {
            assets = assets.clear();
            assetsList.forEach(a => {
                if (a) assets = assets.set(a.get("id"), a.toJS());
            });
        }
        let myAssets = assets
            .filter(asset => {
                return asset.issuer === account.get("id");
            })
            .sort((a, b) => {
                return (
                    parseInt(a.id.substring(4, a.id.length), 10) -
                    parseInt(b.id.substring(4, b.id.length), 10)
                );
            })
            .map(asset => {
                let description = assetUtils.parseDescription(
                    asset.options.description
                );
                let desc = description.short_name
                    ? description.short_name
                    : description.main;

                if (desc.length > 100) {
                    desc = desc.substr(0, 100) + "...";
                }

                const dynamicObject = this.props.getDynamicObject(
                    asset.dynamic_asset_data_id
                );

                return (
                    <tr key={asset.symbol}>
                        <td>
                            <Link to={`/asset/${asset.symbol}`}>
                                {asset.symbol}
                            </Link>
                        </td>
                        <td>
                            {"bitasset" in asset ? (
                                asset.bitasset.is_prediction_market ? (
                                    <Translate content="account.user_issued_assets.pm" />
                                ) : (
                                    <Translate content="account.user_issued_assets.mpa" />
                                )
                            ) : (
                                "User Issued Asset"
                            )}
                        </td>
                        <td>
                            {dynamicObject ? (
                                <FormattedAsset
                                    hide_asset
                                    amount={parseInt(
                                        dynamicObject.get("current_supply"),
                                        10
                                    )}
                                    asset={asset.id}
                                />
                            ) : null}
                        </td>
                        <td>
                            <FormattedAsset
                                hide_asset
                                amount={parseInt(asset.options.max_supply, 10)}
                                asset={asset.id}
                            />
                        </td>
                        <td className="account-asset__table-btn">
                            {!asset.bitasset_data_id ? (
                                <a
                                    onClick={this._issueButtonClick.bind(
                                        this,
                                        asset.id,
                                        asset.symbol
                                    )}
                                >
                                    <NewIcon
                                        iconClass="account-asset__add-asset-icon"
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"cross-circle"}
                                    />
                                </a>
                            ) : null}
                        </td>

                        <td className="account-asset__table-btn account-asset__table-btn--edit">
                            <a
                                onClick={this._editButtonClick.bind(
                                    this,
                                    asset.symbol,
                                    account_name
                                )}
                            >
                                <NewIcon
                                    iconClass="account-asset__dashboard-icon"
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"dashboard"}
                                />
                            </a>
                        </td>
                    </tr>
                );
            })
            .toArray();

        return (
            <div>
                <div className="tabs-container generic-bordered-box">
                    <Translate
                        content="account.user_issued_assets.issued_assets"
                        className="cwd-common__title"
                    />

                    <div className="account-asset__inner">
                        <table className="table account-asset__table cwd-table">
                            <thead className="cwd-table__header">
                                <tr>
                                    <th className="cwd-table__th">
                                        <Translate content="account.user_issued_assets.symbol" />
                                    </th>
                                    <th className="cwd-table__th">
                                        <Translate content="explorer.asset.summary.asset_type" />
                                    </th>

                                    <th className="cwd-table__th">
                                        <Translate content="markets.supply" />
                                    </th>

                                    <th className="cwd-table__th">
                                        <Translate content="account.user_issued_assets.max_supply" />
                                    </th>
                                    <th
                                        className="cwd-table__th"
                                        style={{textAlign: "center"}}
                                    >
                                        <Translate content="transaction.trxTypes.asset_issue" />
                                    </th>
                                    <th
                                        className="cwd-table__th"
                                        style={{textAlign: "center"}}
                                    >
                                        <Translate content="transaction.trxTypes.asset_update" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{myAssets}</tbody>
                        </table>
                    </div>

                    <div className="content-block">
                        <button
                            className="cwd-btn__asset-btn"
                            onClick={this._createButtonClick.bind(
                                this,
                                account_name
                            )}
                        >
                            <Translate content="transaction.trxTypes.asset_create" />
                        </button>
                    </div>
                </div>

                <IssueModal
                    visible={this.state.isIssueAssetModalVisible}
                    hideModal={this.hideIssueAssetModal}
                    showModal={this.showIssueAssetModal}
                    asset_to_issue={this.state.issue.asset_id}
                />
            </div>
        );
    }
}

AccountAssets = AssetWrapper(AccountAssets, {
    propNames: ["assetsList"],
    asList: true,
    withDynamic: true
});

export default connect(AccountAssets, {
    listenTo() {
        return [AssetStore];
    },
    getProps(props) {
        let assets = Map(),
            assetsList = List();
        if (props.account.get("assets", []).size) {
            props.account.get("assets", []).forEach(id => {
                assetsList = assetsList.push(id);
            });
        } else {
            assets = AssetStore.getState().assets;
        }
        return {assets, assetsList};
    }
});
