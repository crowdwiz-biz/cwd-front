import React from "react";
import Translate from "react-translate-component";
import AssetActions from "actions/AssetActions";
import utils from "common/utils";
import {ChainStore, ChainValidation} from "bitsharesjs";
import FormattedAsset from "../Utility/FormattedAsset";
import counterpart from "counterpart";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import AssetSelector from "../Utility/AssetSelector";
import big from "bignumber.js";
import cnames from "classnames";
import assetUtils from "common/asset_utils";
import {Tabs, Tab} from "../Utility/Tabs";
import AmountSelector from "../Utility/AmountSelector";
import assetConstants from "chain/asset_constants";
import {estimateFee} from "common/trxHelper";
import PropTypes from "prop-types";
import {Switch} from "crowdwiz-ui-modal";
import NewIcon from "../NewIcon/NewIcon";

require("./scss/asset-create.scss");

let GRAPHENE_MAX_SHARE_SUPPLY = new big(
    assetConstants.GRAPHENE_MAX_SHARE_SUPPLY
);

class BitAssetOptions extends React.Component {
    static propTypes = {
        backingAsset: ChainTypes.ChainAsset.isRequired,
        isUpdate: PropTypes.bool
    };

    static defaultProps = {
        isUpdate: false
    };

    constructor(props) {
        super(props);
        this.state = {
            backingAsset: props.backingAsset.get("symbol"),
            error: null
        };
    }

    _onInputBackingAsset(asset) {
        if (this.props.disableBackingAssetChange)
            this.props.disabledBackingAssetChangeCallback();
        else
            this.setState({
                backingAsset: asset.toUpperCase(),
                error: null
            });
    }

    _onFoundBackingAsset(asset) {
        if (asset) {
            let backing =
                asset.get("bitasset") &&
                ChainStore.getAsset(
                    asset.getIn(["bitasset", "options", "short_backing_asset"])
                );
            let backing_backing =
                backing &&
                backing.get("bitasset") &&
                ChainStore.getAsset(
                    backing.getIn([
                        "bitasset",
                        "options",
                        "short_backing_asset"
                    ])
                );
            if (backing_backing && backing_backing !== "1.3.0") {
                this.setState({
                    error: counterpart.translate(
                        "account.user_issued_assets.error_too_deep"
                    )
                });
                this.props.onUpdate("invalid", true);
            } else if (!asset.getIn(["bitasset", "is_prediction_market"])) {
                if (
                    this.props.isPredictionMarket &&
                    asset.get("precision") !==
                        parseInt(this.props.assetPrecision, 10)
                ) {
                    this.setState({
                        error: counterpart.translate(
                            "account.user_issued_assets.error_precision",
                            {asset: this.props.assetSymbol}
                        )
                    });
                    this.props.onUpdate("invalid", true);
                } else {
                    this.props.onUpdate("short_backing_asset", asset.get("id"));
                    this.props.onUpdate("invalid", false);
                }
            } else {
                this.setState({
                    error: counterpart.translate(
                        "account.user_issued_assets.error_invalid"
                    )
                });
                this.props.onUpdate("invalid", true);
            }
        } else {
            this.props.onUpdate("invalid", true);
        }
    }

    render() {
        let {bitasset_opts} = this.props;
        let {error} = this.state;

        return (
            <div className="update-asset__inner update-asset__inner--short-block">
                <div className="asset-create__block">
                    <Translate
                        className="cwd-common__label"
                        content="account.user_issued_assets.feed_lifetime_sec"
                    />
                    <input
                        className="cwd-common__input"
                        type="number"
                        value={bitasset_opts.feed_lifetime_sec / 60}
                        onChange={this.props.onUpdate.bind(
                            this,
                            "feed_lifetime_sec"
                        )}
                    />
                </div>

                <div className="asset-create__block">
                    <Translate
                        className="cwd-common__label"
                        content="account.user_issued_assets.minimum_feeds"
                    />
                    <input
                        className="cwd-common__input"
                        type="number"
                        value={bitasset_opts.minimum_feeds}
                        onChange={this.props.onUpdate.bind(
                            this,
                            "minimum_feeds"
                        )}
                    />
                </div>

                <div className="asset-create__block">
                    <Translate
                        className="cwd-common__label"
                        content="account.user_issued_assets.force_settlement_delay_sec"
                    />
                    <input
                        className="cwd-common__input"
                        type="number"
                        value={bitasset_opts.force_settlement_delay_sec / 60}
                        onChange={this.props.onUpdate.bind(
                            this,
                            "force_settlement_delay_sec"
                        )}
                    />
                </div>

                <div className="asset-create__block">
                    <Translate
                        className="cwd-common__label"
                        content="account.user_issued_assets.force_settlement_offset_percent"
                    />
                    <input
                        className="cwd-common__input"
                        type="number"
                        value={
                            bitasset_opts.force_settlement_offset_percent /
                            assetConstants.GRAPHENE_1_PERCENT
                        }
                        onChange={this.props.onUpdate.bind(
                            this,
                            "force_settlement_offset_percent"
                        )}
                    />
                </div>

                <div className="asset-create__block">
                    <Translate
                        className="cwd-common__label"
                        content="account.user_issued_assets.maximum_force_settlement_volume"
                    />
                    <input
                        className="cwd-common__input"
                        type="number"
                        value={
                            bitasset_opts.maximum_force_settlement_volume /
                            assetConstants.GRAPHENE_1_PERCENT
                        }
                        onChange={this.props.onUpdate.bind(
                            this,
                            "maximum_force_settlement_volume"
                        )}
                    />
                </div>

                <AssetSelector
                    label="account.user_issued_assets.backing"
                    onChange={this._onInputBackingAsset.bind(this)}
                    asset={this.state.backingAsset}
                    assetInput={this.state.backingAsset}
                    tabIndex={1}
                    style={{width: "100%", paddingRight: "10px"}}
                    onFound={this._onFoundBackingAsset.bind(this)}
                />
                {error ? (
                    <div className="content-block has-error">{error}</div>
                ) : null}
            </div>
        );
    }
}
BitAssetOptions = BindToChainState(BitAssetOptions);

class AccountAssetCreate extends React.Component {
    static propTypes = {
        core: ChainTypes.ChainAsset.isRequired,
        globalObject: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        globalObject: "2.0.0",
        core: "1.3.0"
    };

    constructor(props) {
        super(props);

        this.state = this.resetState(props);
    }

    resetState(props) {
        // let asset = props.asset.toJS();
        let isBitAsset = false;
        let precision = utils.get_asset_precision(4);
        let corePrecision = utils.get_asset_precision(
            props.core.get("precision")
        );

        let {flagBooleans, permissionBooleans} = this._getPermissions({
            isBitAsset
        });

        // let flags = assetUtils.getFlags(flagBooleans);
        // let permissions = assetUtils.getPermissions(permissionBooleans, isBitAsset);
        // console.log("all permissions:", permissionBooleans, permissions)

        let coreRateBaseAssetName = ChainStore.getAsset("1.3.0").get("symbol");

        return {
            update: {
                symbol: "",
                precision: 4,
                max_supply: 100000,
                max_market_fee: 0,
                market_fee_percent: 0,
                description: {main: ""}
            },
            errors: {
                max_supply: null
            },
            isValid: true,
            flagBooleans: flagBooleans,
            permissionBooleans: permissionBooleans,
            isBitAsset: isBitAsset,
            is_prediction_market: false,
            core_exchange_rate: {
                quote: {
                    asset_id: null,
                    amount: 1
                },
                base: {
                    asset_id: "1.3.0",
                    amount: 1
                }
            },
            bitasset_opts: {
                feed_lifetime_sec: 60 * 60 * 24,
                minimum_feeds: 7,
                force_settlement_delay_sec: 60 * 60 * 24,
                force_settlement_offset_percent:
                    1 * assetConstants.GRAPHENE_1_PERCENT,
                maximum_force_settlement_volume:
                    20 * assetConstants.GRAPHENE_1_PERCENT,
                short_backing_asset: "1.3.0"
            },
            marketInput: ""
        };
    }

    _getPermissions(state) {
        let flagBooleans = assetUtils.getFlagBooleans(0, state.isBitAsset);
        let permissionBooleans = assetUtils.getFlagBooleans(
            "all",
            state.isBitAsset
        );

        return {
            flagBooleans,
            permissionBooleans
        };
    }

    _createAsset(e) {
        e.preventDefault();
        let {
            update,
            flagBooleans,
            permissionBooleans,
            core_exchange_rate,
            isBitAsset,
            is_prediction_market,
            bitasset_opts
        } = this.state;

        let {account} = this.props;

        let flags = assetUtils.getFlags(flagBooleans, isBitAsset);
        let permissions = assetUtils.getPermissions(
            permissionBooleans,
            isBitAsset
        );

        if (this.state.marketInput !== update.description.market) {
            update.description.market = "";
        }
        let description = JSON.stringify(update.description);

        AssetActions.createAsset(
            account.get("id"),
            update,
            flags,
            permissions,
            core_exchange_rate,
            isBitAsset,
            is_prediction_market,
            bitasset_opts,
            description
        ).then(result => {
            console.log(
                "... AssetActions.createAsset(account_id, update)",
                account.get("id"),
                update,
                flags,
                permissions
            );
        });
    }

    _hasChanged() {
        return !utils.are_equal_shallow(
            this.state,
            this.resetState(this.props)
        );
    }

    _reset(e) {
        e.preventDefault();

        this.setState(this.resetState(this.props));
    }

    _forcePositive(number) {
        return parseFloat(number) < 0 ? "0" : number;
    }

    _onUpdateDescription(value, e) {
        let {update} = this.state;
        let updateState = true;

        switch (value) {
            case "condition":
                if (e.target.value.length > 60) {
                    updateState = false;
                    return;
                }
                update.description[value] = e.target.value;
                break;

            case "short_name":
                if (e.target.value.length > 32) {
                    updateState = false;
                    return;
                }
                update.description[value] = e.target.value;
                break;

            case "market":
                update.description[value] = e;
                break;

            case "visible":
                update.description[value] = !update.description[value];
                break;

            default:
                update.description[value] = e.target.value;
                break;
        }

        if (updateState) {
            this.forceUpdate();
            this._validateEditFields(update);
        }
    }

    onChangeBitAssetOpts(value, e) {
        let {bitasset_opts, errors} = this.state;

        switch (value) {
            case "force_settlement_offset_percent":
            case "maximum_force_settlement_volume":
                bitasset_opts[value] =
                    parseFloat(e.target.value) *
                    assetConstants.GRAPHENE_1_PERCENT;
                break;
            case "minimum_feeds":
                bitasset_opts[value] = parseInt(e.target.value, 10);
                break;
            case "feed_lifetime_sec":
            case "force_settlement_delay_sec":
                console.log(
                    e.target.value,
                    parseInt(parseFloat(e.target.value) * 60, 10)
                );
                bitasset_opts[value] = parseInt(
                    parseFloat(e.target.value) * 60,
                    10
                );
                break;

            case "short_backing_asset":
                bitasset_opts[value] = e;
                break;

            case "invalid":
                errors.invalid_bitasset = e;
                break;

            default:
                bitasset_opts[value] = e.target.value;
                break;
        }

        let isValid =
            !errors.symbol && !errors.max_supply && !errors.invalid_bitasset;

        this.setState({isValid: isValid, errors: errors});
    }

    _onUpdateInput(value, e) {
        let {update, errors} = this.state;
        let updateState = true;
        let shouldRestoreCursor = false;
        let precision = utils.get_asset_precision(this.state.update.precision);
        const target = e.target;
        const caret = target.selectionStart;
        const inputValue = target.value;

        switch (value) {
            case "market_fee_percent":
                update[value] = this._forcePositive(target.value);
                break;

            case "max_market_fee":
                if (
                    new big(inputValue)
                        .times(precision)
                        .gt(GRAPHENE_MAX_SHARE_SUPPLY)
                ) {
                    errors.max_market_fee =
                        "The number you tried to enter is too large";
                    return this.setState({errors});
                }
                target.value = utils.limitByPrecision(
                    target.value,
                    this.state.update.precision
                );
                update[value] = target.value;
                break;

            case "precision":
                // Enforce positive number
                update[value] = this._forcePositive(target.value);
                break;

            case "max_supply":
                shouldRestoreCursor = true;

                const regexp_numeral = new RegExp(/[[:digit:]]/);

                // Ensure input is valid
                if (!regexp_numeral.test(target.value)) {
                    target.value = target.value.replace(/[^0-9.]/g, "");
                }

                // Catch initial decimal input
                if (target.value.charAt(0) == ".") {
                    target.value = "0.";
                }

                // Catch double decimal and remove if invalid
                if (
                    target.value.charAt(target.value.length) !=
                    target.value.search(".")
                ) {
                    target.value.substr(1);
                }

                target.value = utils.limitByPrecision(
                    target.value,
                    this.state.update.precision
                );
                update[value] = target.value;

                // if ((new big(target.value)).times(Math.pow(10, precision).gt(GRAPHENE_MAX_SHARE_SUPPLY)) {
                //     return this.setState({
                //         update,
                //         errors: {max_supply: "The number you tried to enter is too large"
                //     }});
                // }
                break;

            case "symbol":
                shouldRestoreCursor = true;
                // Enforce uppercase
                const symbol = target.value.toUpperCase();
                // Enforce characters
                let regexp = new RegExp("^[.A-Z0-9]+$");
                if (symbol !== "" && !regexp.test(symbol)) {
                    break;
                }
                ChainStore.getAsset(symbol);
                update[value] = this._forcePositive(symbol);
                break;

            default:
                update[value] = target.value;
                break;
        }

        if (updateState) {
            this.setState({update: update}, () => {
                if (shouldRestoreCursor) {
                    const selectionStart =
                        caret - (inputValue.length - update[value].length);
                    target.setSelectionRange(selectionStart, selectionStart);
                }
            });
            this._validateEditFields(update);
        }
    }

    _validateEditFields(new_state) {
        let {errors} = this.state;
        errors.max_supply = null;

        errors.symbol = ChainValidation.is_valid_symbol_error(new_state.symbol);
        let existingAsset = ChainStore.getAsset(new_state.symbol);
        if (existingAsset) {
            errors.symbol = counterpart.translate(
                "account.user_issued_assets.exists"
            );
        }

        try {
            errors.max_supply =
                new_state.max_supply <= 0
                    ? counterpart.translate(
                          "account.user_issued_assets.max_positive"
                      )
                    : new big(new_state.max_supply)
                          .times(Math.pow(10, new_state.precision))
                          .gt(GRAPHENE_MAX_SHARE_SUPPLY)
                    ? counterpart.translate(
                          "account.user_issued_assets.too_large"
                      )
                    : null;
        } catch (err) {
            console.log("err:", err);
            errors.max_supply = counterpart.translate(
                "account.user_issued_assets.too_large"
            );
        }

        let isValid =
            !errors.symbol && !errors.max_supply && !errors.invalid_bitasset;

        this.setState({isValid: isValid, errors: errors});
    }

    _onFlagChange(key) {
        let booleans = this.state.flagBooleans;
        booleans[key] = !booleans[key];
        this.setState({
            flagBooleans: booleans
        });
    }

    _onPermissionChange(key) {
        let booleans = this.state.permissionBooleans;
        booleans[key] = !booleans[key];
        this.setState({
            permissionBooleans: booleans
        });
    }

    _onInputCoreAsset(type, asset) {
        if (type === "quote") {
            this.setState({
                quoteAssetInput: asset
            });
        } else if (type === "base") {
            this.setState({
                baseAssetInput: asset
            });
        }
    }

    _onFoundCoreAsset(type, asset) {
        if (asset) {
            let core_rate = this.state.core_exchange_rate;
            core_rate[type].asset_id = asset.get("id");

            this.setState({
                core_exchange_rate: core_rate
            });

            this._validateEditFields({
                max_supply: this.state.max_supply,
                core_exchange_rate: core_rate
            });
        }
    }

    _onInputMarket(asset) {
        this.setState({
            marketInput: asset
        });
    }

    _onFoundMarketAsset(asset) {
        if (asset) {
            this._onUpdateDescription("market", asset.get("symbol"));
        }
    }

    _onCoreRateChange(type, e) {
        let amount, asset;
        if (type === "quote") {
            amount = utils.limitByPrecision(
                e.target.value,
                this.state.update.precision
            );
            asset = null;
        } else {
            if (!e || !("amount" in e)) {
                return;
            }
            amount =
                e.amount == ""
                    ? "0"
                    : utils.limitByPrecision(
                          e.amount.toString().replace(/,/g, ""),
                          this.props.core.get("precision")
                      );
            asset = e.asset.get("id");
        }

        let {core_exchange_rate} = this.state;
        core_exchange_rate[type] = {
            amount: amount,
            asset_id: asset
        };
        this.forceUpdate();
    }

    _onToggleBitAsset() {
        let {update} = this.state;
        this.state.isBitAsset = !this.state.isBitAsset;
        if (!this.state.isBitAsset) {
            this.state.is_prediction_market = false;
        }

        let {flagBooleans, permissionBooleans} = this._getPermissions(
            this.state
        );
        this.state.flagBooleans = flagBooleans;
        this.state.permissionBooleans = permissionBooleans;

        this.forceUpdate();
    }

    _onTogglePM() {
        this.state.is_prediction_market = !this.state.is_prediction_market;
        this.state.update.precision = this.props.core.get("precision");
        this.state.core_exchange_rate.base.asset_id = this.props.core.get("id");
        this.forceUpdate();
    }

    assetChanged() {
        let s = this.state;
        let p = this.resetState(this.props);
        return (
            JSON.stringify(s.update) !== JSON.stringify(p.update) ||
            JSON.stringify(s.core_exchange_rate) !==
                JSON.stringify(p.core_exchange_rate) ||
            (s.new_issuer_account_id !== null &&
                s.new_issuer_account_id !== s.issuer) ||
            JSON.stringify(s.flagBooleans) !== JSON.stringify(p.flagBooleans) ||
            JSON.stringify(s.permissionBooleans) !==
                JSON.stringify(p.permissionBooleans)
        );
    }

    pageChanged() {
        let {
            isBitAsset,
            bitasset_opts,
            original_bitasset_opts,
            feedProducers,
            originalFeedProducers
        } = this.state;
        return (
            this.assetChanged() ||
            (isBitAsset &&
                (JSON.stringify(bitasset_opts) !==
                    JSON.stringify(original_bitasset_opts) ||
                    !utils.are_equal_shallow(
                        feedProducers.toJS(),
                        originalFeedProducers.toJS()
                    )))
        );
    }

    render() {
        let {globalObject, core} = this.props;
        let {
            errors,
            isValid,
            update,
            flagBooleans,
            permissionBooleans,
            core_exchange_rate,
            is_prediction_market,
            isBitAsset,
            bitasset_opts
        } = this.state;

        // Estimate the asset creation fee from the symbol character length
        let symbolLength = update.symbol.length,
            createFee = 0;

        if (symbolLength === 3) {
            createFee = (
                <FormattedAsset
                    amount={estimateFee(
                        "asset_create",
                        ["symbol3"],
                        globalObject
                    )}
                    asset={"1.3.0"}
                />
            );
        } else if (symbolLength === 4) {
            createFee = (
                <FormattedAsset
                    amount={estimateFee(
                        "asset_create",
                        ["symbol4"],
                        globalObject
                    )}
                    asset={"1.3.0"}
                />
            );
        } else if (symbolLength > 4) {
            createFee = (
                <FormattedAsset
                    amount={estimateFee(
                        "asset_create",
                        ["long_symbol"],
                        globalObject
                    )}
                    asset={"1.3.0"}
                />
            );
        }

        // Loop over flags
        let flags = [];

        let getFlag = (key, onClick, isChecked) => {
            return (
                <table
                    key={"table_" + key}
                    className="table update-asset__table"
                >
                    <tbody>
                        <tr>
                            <td className="update-asset__permission-data">
                                <Translate
                                    content={`account.user_issued_assets.${key}`}
                                />
                                :
                            </td>
                            <td className="update-asset__switch">
                                <Switch
                                    checked={isChecked}
                                    onChange={onClick}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        };
        for (let key in permissionBooleans) {
            if (permissionBooleans[key] && key !== "charge_market_fee") {
                flags.push(
                    getFlag(
                        key,
                        this._onFlagChange.bind(this, key),
                        flagBooleans[key]
                    )
                );
            }
        }

        flags.push(
            getFlag(
                "visible",
                this._onUpdateDescription.bind(this, "visible"),
                update.description.visible
                    ? false
                    : update.description.visible === false
                    ? true
                    : false
            )
        );

        // Loop over permissions
        let permissions = [];
        for (let key in permissionBooleans) {
            permissions.push(
                <table
                    key={"table_" + key}
                    className="table update-asset__table"
                >
                    <tbody>
                        <tr>
                            <td className="update-asset__permission-data">
                                <Translate
                                    content={`account.user_issued_assets.${key}`}
                                />
                                :
                            </td>
                            <td className="update-asset__switch">
                                <Switch
                                    checked={permissionBooleans[key]}
                                    onChange={this._onPermissionChange.bind(
                                        this,
                                        key
                                    )}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }

        let width = window.innerWidth;

        return (
            <div>
                <div className="cwd-common__header">
                    <Translate
                        className="cwd-common__title"
                        content="header.create_asset"
                    />

                    <div className="tabs-btn__wrap">
                        <button
                            className="tabs-btn__btn"
                            onClick={this._reset.bind(this)}
                            value={counterpart.translate("account.perm.reset")}
                            disabled={!this.pageChanged()}
                        >
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"cross"}
                            />
                            <Translate content="account.perm.reset" />
                        </button>
                        <button
                            className="tabs-btn__btn"
                            disabled={isValid ? false : true}
                            onClick={this._createAsset.bind(this)}
                        >
                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"save"}
                            />
                            <Translate content="header.create_asset" />
                        </button>
                    </div>
                </div>

                <Tabs
                    className="cwd-tabs"
                    tabsClass="cwd-tabs__list"
                    contentClass="cwd-tabs__content"
                    segmented={false}
                    actionButtons={false}
                    defaultActiveTab={0}
                    setting="createAssetTab"
                >
                    {/* TAB 01 */}
                    <Tab title="account.user_issued_assets.primary">
                        <div className="update-asset__inner">
                            {/* TICKER INFO */}
                            <div className="asset-create__section">
                                <div className="asset-create__ticker-data-wrap">
                                    <div className="asset-create__input-wrap">
                                        <Translate
                                            className="cwd-common__label"
                                            content="account.user_issued_assets.symbol"
                                        />
                                        <input
                                            className="cwd-common__input"
                                            type="text"
                                            value={update.symbol}
                                            onChange={this._onUpdateInput.bind(
                                                this,
                                                "symbol"
                                            )}
                                            tabIndex={1}
                                        />
                                        {errors.symbol ? (
                                            <p className="asset-create__error has-error">
                                                {errors.symbol}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="asset-create__input-wrap">
                                        <Translate
                                            className="cwd-common__label"
                                            content="account.user_issued_assets.max_supply"
                                        />{" "}
                                        <input
                                            className="cwd-common__input"
                                            type="text"
                                            value={update.max_supply}
                                            onChange={this._onUpdateInput.bind(
                                                this,
                                                "max_supply"
                                            )}
                                            tabIndex={2}
                                        />
                                        {errors.max_supply ? (
                                            <p className="asset-create__error has-error">
                                                {errors.max_supply}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="asset-create__input-wrap">
                                        <Translate
                                            className="cwd-common__label"
                                            content="account.user_issued_assets.decimals"
                                        />
                                        <div className="asset-create__range-wrap">
                                            <input
                                                min="0"
                                                max="8"
                                                step="1"
                                                type="range"
                                                value={update.precision}
                                                onChange={this._onUpdateInput.bind(
                                                    this,
                                                    "precision"
                                                )}
                                                tabIndex={3}
                                            />
                                            <span className="asset-create__range-value">
                                                {update.precision}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="asset-create__block">
                                    <Translate
                                        content="account.user_issued_assets.cer_warning_1"
                                        component="label"
                                        className="has-error"
                                    />
                                    <Translate
                                        content="account.user_issued_assets.precision_warning"
                                        component="p"
                                    />
                                </div>
                            </div>

                            {/* EXCHANGE RATE */}
                            <Translate
                                component="h3"
                                content="account.user_issued_assets.core_exchange_rate"
                            />
                            <div className="asset-create__ticker-data-wrap">
                                <div className="asset-create__input-wrap">
                                    <Translate
                                        className="cwd-common__label"
                                        content="account.user_issued_assets.quote"
                                    />
                                    <input
                                        className="cwd-common__input"
                                        type="text"
                                        placeholder="0.0"
                                        onChange={this._onCoreRateChange.bind(
                                            this,
                                            "quote"
                                        )}
                                        value={core_exchange_rate.quote.amount}
                                        tabIndex={4}
                                    />

                                    {errors.quote_asset ? (
                                        <p className="asset-create__error has-error">
                                            {errors.quote_asset}
                                        </p>
                                    ) : null}
                                    {errors.base_asset ? (
                                        <p className="asset-create__error has-error">
                                            {errors.base_asset}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="asset-create__input-wrap">
                                    <AmountSelector
                                        label="account.user_issued_assets.base"
                                        amount={core_exchange_rate.base.amount}
                                        onChange={this._onCoreRateChange.bind(
                                            this,
                                            "base"
                                        )}
                                        asset={core_exchange_rate.base.asset_id}
                                        assets={[
                                            core_exchange_rate.base.asset_id
                                        ]}
                                        placeholder="0.0"
                                        tabIndex={5}
                                    />
                                </div>

                                <div className="asset-create__input-wrap">
                                    <div className="asset-create__price-wrap">
                                        <Translate content="exchange.price" />

                                        <span className="asset-create__price">
                                            <span className="asset-create__price-value">
                                                :{" "}
                                                {utils.format_number(
                                                    utils.get_asset_price(
                                                        core_exchange_rate.quote
                                                            .amount *
                                                            utils.get_asset_precision(
                                                                update.precision
                                                            ),
                                                        {
                                                            precision:
                                                                update.precision
                                                        },
                                                        core_exchange_rate.base
                                                            .amount *
                                                            utils.get_asset_precision(
                                                                core
                                                            ),
                                                        core
                                                    ),
                                                    2 +
                                                        (parseInt(
                                                            update.precision,
                                                            10
                                                        ) || 8)
                                                )}
                                            </span>
                                            <span>
                                                {update.symbol}
                                                {"/"}
                                                {core.get("symbol")}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SMARTASSET BLOCK */}
                            {/* <div className="asset-create__smart-asset-block">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="update-asset__permission-data">
                                                <Translate
                                                    content={
                                                        "account.user_issued_assets.mpa"
                                                    }
                                                />
                                                :
                                            </td>
                                            <td className="update-asset__switch">
                                                <Switch
                                                    checked={isBitAsset}
                                                    onChange={this._onToggleBitAsset.bind(
                                                        this
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {isBitAsset ? (
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className="update-asset__permission-data">
                                                    <Translate
                                                        content={
                                                            "account.user_issued_assets.pm"
                                                        }
                                                    />
                                                    :
                                                </td>
                                                <td className="update-asset__switch">
                                                    <Switch
                                                        checked={
                                                            is_prediction_market
                                                        }
                                                        onChange={this._onTogglePM.bind(
                                                            this
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : null}
                            </div> */}

                            <div className="asset-create__block">
                                <Translate
                                    content="account.user_issued_assets.cer_warning_1"
                                    component="label"
                                    className="has-error"
                                />
                                <Translate
                                    content="account.user_issued_assets.cer_warning_2"
                                    component="p"
                                />
                            </div>

                            <div>
                                <Translate
                                    className="update-asset__trade-fee-text"
                                    content="account.user_issued_assets.approx_fee"
                                />
                                <span className="update-asset__trade-fee">
                                    {createFee}
                                </span>
                            </div>
                        </div>
                    </Tab>

                    {/* TAB 02 */}
                    <Tab title="account.user_issued_assets.description">
                        <div className="update-asset__inner update-asset__inner--short-block">
                            <div className="update-asset__desc-block">
                                <Translate
                                    className="cwd-common__label"
                                    content="account.user_issued_assets.description"
                                />
                                <textarea
                                    rows={width > 576 ? 4 : 6}
                                    className="cwd-common__textarea"
                                    value={update.description.main}
                                    onChange={this._onUpdateDescription.bind(
                                        this,
                                        "main"
                                    )}
                                />
                            </div>

                            <div className="update-asset__desc-block">
                                <Translate
                                    className="cwd-common__label"
                                    content="account.user_issued_assets.short"
                                />
                                <input
                                    className="cwd-common__input"
                                    type="text"
                                    value={update.description.short_name}
                                    onChange={this._onUpdateDescription.bind(
                                        this,
                                        "short_name"
                                    )}
                                />
                            </div>

                            <div className="update-asset__desc-block">
                                <AssetSelector
                                    label="account.user_issued_assets.market"
                                    onChange={this._onInputMarket.bind(this)}
                                    asset={this.state.marketInput}
                                    assetInput={this.state.marketInput}
                                    onFound={this._onFoundMarketAsset.bind(
                                        this
                                    )}
                                />
                                {errors.invalid_market_pair ? (
                                    <p className="asset-create__error has-error">
                                        {errors.invalid_market_pair}
                                    </p>
                                ) : null}
                            </div>

                            {is_prediction_market ? (
                                <div>
                                    <div className="update-asset__desc-block">
                                        <Translate
                                            className="cwd-common__label"
                                            content="account.user_issued_assets.condition"
                                        />
                                        <input
                                            className="cwd-common__input"
                                            type="text"
                                            value={update.description.condition}
                                            onChange={this._onUpdateDescription.bind(
                                                this,
                                                "condition"
                                            )}
                                        />
                                    </div>

                                    <div className="update-asset__desc-block">
                                        <Translate
                                            className="cwd-common__label"
                                            content="account.user_issued_assets.expiry"
                                        />
                                        <input
                                            className="cwd-common__input"
                                            type="date"
                                            value={update.description.expiry}
                                            onChange={this._onUpdateDescription.bind(
                                                this,
                                                "expiry"
                                            )}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </Tab>

                    {/* TAB 03 */}
                    <Tab title="account.permissions">
                        <div className="update-asset__inner update-asset__inner--short-block">
                            <div className="update-asset__desc-block">
                                {permissions}
                            </div>
                        </div>
                    </Tab>

                    {/* TAB 04 */}
                    <Tab title="account.user_issued_assets.flags">
                        {permissionBooleans["charge_market_fee"] ? (
                            <div className="update-asset__inner update-asset__inner--short-block">
                                <Translate
                                    component="h3"
                                    content="account.user_issued_assets.market_fee"
                                />
                                <div className="update-asset__desc-block">
                                    <table className="table update-asset__table">
                                        <tbody>
                                            <tr>
                                                <td className="update-asset__permission-data">
                                                    <Translate content="account.user_issued_assets.charge_market_fee" />
                                                    :
                                                </td>
                                                <td className="update-asset__switch">
                                                    <Switch
                                                        checked={
                                                            flagBooleans.charge_market_fee
                                                        }
                                                        onChange={this._onFlagChange.bind(
                                                            this,
                                                            "charge_market_fee"
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div
                                    className={cnames({
                                        disabled: !flagBooleans.charge_market_fee
                                    })}
                                >
                                    <div className="update-asset__desc-block">
                                        <span className="left-label update-asset__label">
                                            <Translate content="account.user_issued_assets.market_fee" />{" "}
                                            (%)
                                        </span>
                                        <input
                                            className="cwd-common__input"
                                            type="number"
                                            value={update.market_fee_percent}
                                            onChange={this._onUpdateInput.bind(
                                                this,
                                                "market_fee_percent"
                                            )}
                                        />
                                    </div>

                                    <div className="update-asset__desc-block">
                                        <span className="left-label update-asset__label">
                                            <Translate content="account.user_issued_assets.max_market_fee" />{" "}
                                            ({update.symbol})
                                        </span>
                                        <input
                                            className="cwd-common__input"
                                            type="number"
                                            value={update.max_market_fee}
                                            onChange={this._onUpdateInput.bind(
                                                this,
                                                "max_market_fee"
                                            )}
                                        />
                                    </div>
                                    {errors.max_market_fee ? (
                                        <p className="asset-create__error has-error">
                                            {errors.max_market_fee}
                                        </p>
                                    ) : null}
                                </div>

                                <h3>
                                    <Translate content="account.user_issued_assets.flags" />
                                </h3>

                                <div className="update-asset__desc-block">
                                    {flags}
                                </div>
                            </div>
                        ) : null}
                    </Tab>

                    {/* TAB 05 */}
                    {isBitAsset ? (
                        <Tab title="account.user_issued_assets.bitasset_opts">
                            <BitAssetOptions
                                bitasset_opts={bitasset_opts}
                                onUpdate={this.onChangeBitAssetOpts.bind(this)}
                                backingAsset={bitasset_opts.short_backing_asset}
                                assetPrecision={update.precision}
                                assetSymbol={update.symbol}
                                isPredictionMarket={is_prediction_market}
                            />
                        </Tab>
                    ) : null}
                </Tabs>
            </div>
        );
    }
}

AccountAssetCreate = BindToChainState(AccountAssetCreate);

export {AccountAssetCreate, BitAssetOptions};
