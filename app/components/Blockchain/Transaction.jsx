import React from "react";
import PropTypes from "prop-types";
import FormattedAsset from "../Utility/FormattedAsset";
import { Link as RealLink } from "react-router-dom";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import classNames from "classnames";
import { FormattedDate } from "react-intl";
import Inspector from "react-json-inspector";
import utils from "common/utils";
import LinkToAccountById from "../Utility/LinkToAccountById";
import LinkToAssetById from "../Utility/LinkToAssetById";
import FormattedPrice from "../Utility/FormattedPrice";
import account_constants from "chain/account_constants";
import NewIcon from "../NewIcon/NewIcon";
import PrivateKeyStore from "stores/PrivateKeyStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import ProposedOperation from "./ProposedOperation";
import { ChainTypes } from "bitsharesjs";
let { operations } = ChainTypes;
import ReactTooltip from "react-tooltip";
import moment from "moment";
import { Tooltip } from "crowdwiz-ui-modal";

import "./scss/transaction.scss"

require("./scss/operation.scss");
require("./json-inspector.scss");

let ops = Object.keys(operations);
let listings = Object.keys(account_constants.account_listing);

const TranslateBoolean = ({ value, ...otherProps }) => (
    <Translate
        content={`boolean.${value ? "true" : "false"}`}
        {...otherProps}
    />
);

class OpType extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.type !== this.props.type;
    }

    render() {
        let trxTypes = counterpart.translate("transaction.trxTypes");
        let labelClass = classNames("transaction__title txtlabel", this.props.color || "info");

        return (
            <h4 className={labelClass}>
                {this.props.txIndex >= 0 ?
                    <span>
                        #{this.props.txIndex + 1}
                        :&nbsp;
                    </span>
                    : null
                }
                {trxTypes[ops[this.props.type]]}
            </h4>
        );
    }
}

class NoLinkDecorator extends React.Component {
    render() {
        return <span>{this.props.children}</span>;
    }
}

class OperationTable extends React.Component {
    render() {
        let fee_row =
            this.props.fee.amount > 0 ? (
                <div className="transaction__row">
                    <div className="transaction__legend">
                        <Translate component="span" content="transfer.fee" />
                    </div>
                    <div>
                        <FormattedAsset
                            color="fee"
                            amount={this.props.fee.amount}
                            asset={this.props.fee.asset_id}
                        />
                    </div>
                </div>
            ) : null;

        return (
            <div className="transaction__inner">
                <OpType
                    txIndex={this.props.txIndex}
                    type={this.props.type}
                    color={this.props.color}
                />
                {this.props.children}
                {fee_row}
            </div>
        );
    }
}

class Transaction extends React.Component {
    componentDidMount() {
        ReactTooltip.rebuild();
    }

    linkToAccount(name_or_id) {
        if (!name_or_id) return <span>-</span>;
        let Link = this.props.no_links ? NoLinkDecorator : RealLink;
        return utils.is_object_id(name_or_id) ? (
            <LinkToAccountById account={name_or_id} />
        ) : (
            <Link to={`/account/${name_or_id}`}>{name_or_id}</Link>
        );
    }

    linkToAsset(symbol_or_id) {
        if (!symbol_or_id) return <span>-</span>;
        let Link = this.props.no_links ? NoLinkDecorator : RealLink;
        return utils.is_object_id(symbol_or_id) ? (
            <LinkToAssetById asset={symbol_or_id} />
        ) : (
            <Link to={`/asset/${symbol_or_id}`}>{symbol_or_id}</Link>
        );
    }

    _toggleLock(e) {
        e.preventDefault();
        WalletUnlockActions.unlock()
            .then(() => {
                this.forceUpdate();
            })
            .catch(() => { });
    }

    render() {
        let price;
        let { trx } = this.props;
        let info = null;
        info = [];

        let opCount = trx.operations.length;
        let memo = null;

        trx.operations.forEach((op, opIndex) => {
            let rows = [];
            let key = 0;

            let color = "";
            switch (
            ops[op[0]] // For a list of trx types, see chain_types.coffee
            ) {
                case "transfer":
                    color = "success";

                    if (op[1].memo) {
                        let { text, isMine } = PrivateKeyStore.decodeMemo(
                            op[1].memo
                        );

                        memo = text ? (
                            <div
                                className="memo"
                                style={{ wordBreak: "break-all" }}
                            >
                                {text}
                            </div>
                        ) : !text && isMine ? (
                            <div>
                                <Translate content="transfer.memo_unlock" />
                                &nbsp;
                                <a onClick={this._toggleLock.bind(this)}>
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"locked"}
                                    />
                                </a>
                            </div>
                        ) : null;
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.from"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].from)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].to)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    {
                        memo
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate content="transfer.memo" />
                                    </div>
                                    {memo}
                                </div>
                            )
                            : null;
                    }

                    break;

                // ==========================================================================

                case "limit_order_create":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="exchange.price"
                                />
                            </div>
                            <div>
                                <FormattedPrice
                                    base_asset={op[1].amount_to_sell.asset_id}
                                    quote_asset={op[1].min_to_receive.asset_id}
                                    base_amount={op[1].amount_to_sell.amount}
                                    quote_amount={op[1].min_to_receive.amount}
                                    noPopOver
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="exchange.sell"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount_to_sell.amount}
                                    asset={op[1].amount_to_sell.asset_id}
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Tooltip
                                    placement="left"
                                    title={counterpart.translate(
                                        "tooltip.buy_min"
                                    )}
                                >
                                    <Translate
                                        component="span"
                                        content="exchange.buy_min"
                                    />
                                </Tooltip>
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].min_to_receive.amount}
                                    asset={op[1].min_to_receive.asset_id}
                                />
                            </div>
                        </div>
                    );

                    // rows.push(
                    //     <div key="2">
                    //         <div><Translate component="span" content="transaction.min_receive" /></div>
                    //         <div>{!missingAssets[1] ? <FormattedAsset amount={op[1].min_to_receive.amount} asset={op[1].min_to_receive.asset_id} /> : null}</div>
                    //     </div>
                    // );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.seller"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].seller)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.expiration"
                                />
                            </div>
                            <div>
                                <FormattedDate
                                    value={moment.utc(op[1].expiration)}
                                    format="full"
                                    timeZoneName="short"
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "limit_order_cancel":
                    color = "cancel";
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.order_id"
                                />
                            </div>
                            <div>{op[1].order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.fee_payer"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "short_order_cancel":
                    color = "cancel";
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.order_id"
                                />
                            </div>
                            <div>{op[1].order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.fee_payer"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "call_order_update":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.funding_account"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].funding_account)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.delta_collateral"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].delta_collateral.amount}
                                    asset={op[1].delta_collateral.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.delta_debt"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].delta_debt.amount}
                                    asset={op[1].delta_debt.asset_id}
                                />
                            </div>
                        </div>
                    );
                    if (
                        !!op[1].extensions &&
                        !!op[1].extensions.target_collateral_ratio
                    ) {
                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="transaction.collateral_target"
                                    />
                                </div>
                                <div>
                                    {op[1].extensions.target_collateral_ratio /
                                        1000}
                                </div>
                            </div>
                        );
                    }

                    break;

                // ==========================================================================

                case "key_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.fee_payer"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.key"
                                />
                            </div>
                            <div>{op[1].key_data[1]}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "account_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.name"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].name)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.member.registrar"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].registrar)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.member.lifetime_referrer"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].referrer)}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "account_update":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.name"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].account)}</div>
                        </div>
                    );
                    if (op[1].new_options) {
                        if (op[1].new_options.voting_account) {
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.votes.proxy"
                                        />
                                    </div>
                                    <div>
                                        {this.linkToAccount(
                                            op[1].new_options.voting_account
                                        )}
                                    </div>
                                </div>
                            );
                        } else {
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.votes.proxy"
                                        />
                                    </div>
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.votes.no_proxy"
                                        />
                                    </div>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.options.num_committee"
                                        />
                                    </div>
                                    <div>{op[1].new_options.num_committee}</div>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.options.num_witnesses"
                                        />
                                    </div>
                                    <div>{op[1].new_options.num_witness}</div>
                                </div>
                            );
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="account.options.votes"
                                        />
                                    </div>
                                    <div>
                                        {JSON.stringify(
                                            op[1].new_options.votes
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="account.options.memo_key"
                                    />
                                </div>
                                <div>
                                    {op[1].new_options.memo_key.substring(
                                        0,
                                        10
                                    ) + "..."}
                                </div>
                            </div>
                        );
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.common_options"
                                />
                            </div>
                            <div>
                                <Inspector data={op[1]} search={false} />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "account_whitelist":
                    let listing;
                    for (var i = 0; i < listings.length; i++) {
                        if (
                            account_constants.account_listing[listings[i]] ===
                            op[1].new_listing
                        ) {
                            listing = listings[i];
                        }
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.authorizing_account"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].authorizing_account)}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.listed_account"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].account_to_list)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.new_listing"
                                />
                            </div>
                            <div>
                                <Translate
                                    content={`transaction.whitelist_states.${listing}`}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "account_upgrade":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.account_upgrade"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].account_to_upgrade)}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.lifetime"
                                />
                            </div>
                            <div>
                                {op[1].upgrade_to_lifetime_member.toString()}
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "account_transfer":
                    /* This case is uncomplete, needs filling out with proper fields */
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.from"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].account_id)}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_create":
                    color = "warning";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.assets.issuer"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].issuer)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.assets.symbol"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].symbol)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.assets.precision"
                                />
                            </div>
                            <div>{op[1].precision}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.user_issued_assets.max_supply"
                                />
                            </div>
                            <div>
                                {utils.format_asset(
                                    op[1].common_options.max_supply,
                                    op[1]
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.user_issued_assets.description"
                                />
                            </div>
                            <div>{op[1].common_options.description}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.market_fee"
                                />
                            </div>
                            <div>
                                {op[1].common_options.market_fee_percent / 100}%
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.max_market_fee"
                                />
                            </div>
                            <div>
                                {utils.format_asset(
                                    op[1].common_options.max_market_fee,
                                    op[1]
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.common_options"
                                />
                            </div>
                            <div>
                                <Inspector data={op[1]} search={false} />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_update":
                case "asset_update_bitasset":
                    color = "warning";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.asset_update"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].asset_to_update)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.assets.issuer"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].issuer)}</div>
                        </div>
                    );
                    if (op[1].new_issuer !== op[1].issuer) {
                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="account.user_issued_assets.new_issuer"
                                    />
                                </div>
                                <div>{this.linkToAccount(op[1].new_issuer)}</div>
                            </div>
                        );
                    }
                    if (op[1].new_options.core_exchange_rate) {
                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="markets.core_rate"
                                    />
                                </div>
                                <div>
                                    <FormattedPrice
                                        base_asset={
                                            op[1].new_options.core_exchange_rate
                                                .base.asset_id
                                        }
                                        quote_asset={
                                            op[1].new_options.core_exchange_rate
                                                .quote.asset_id
                                        }
                                        base_amount={
                                            op[1].new_options.core_exchange_rate
                                                .base.amount
                                        }
                                        quote_amount={
                                            op[1].new_options.core_exchange_rate
                                                .quote.amount
                                        }
                                        noPopOver
                                    />
                                </div>
                            </div>
                        );
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.new_options"
                                />
                            </div>
                            <div>
                                <Inspector
                                    data={op[1].new_options}
                                    search={false}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_update_feed_producers":
                    color = "warning";
                    let producers = [];
                    op[1].new_feed_producers.forEach(producer => {
                        // let missingAsset = this.getAccounts([producer])[0];
                        producers.push(
                            <div>
                                {this.linkToAccount(producer)}
                                <br />
                            </div>
                        );
                    });

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.asset_update"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].asset_to_update)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.new_producers"
                                />
                            </div>
                            <div>{producers}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_issue":
                    color = "warning";

                    if (op[1].memo) {
                        let { text, isMine } = PrivateKeyStore.decodeMemo(
                            op[1].memo
                        );

                        memo = text ? (
                            <div>{text}</div>
                        ) : !text && isMine ? (
                            <div>
                                <Translate content="transfer.memo_unlock" />
                                &nbsp;
                                <a onClick={this._toggleLock.bind(this)}>
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"locked"}
                                    />
                                </a>
                            </div>
                        ) : null;
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.assets.issuer"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].issuer)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.asset_issue"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    style={{ fontWeight: "bold" }}
                                    amount={op[1].asset_to_issue.amount}
                                    asset={op[1].asset_to_issue.asset_id}
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].issue_to_account)}
                            </div>
                        </div>
                    );

                    {
                        memo
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate content="transfer.memo" />
                                    </div>
                                    {memo}
                                </div>
                            )
                            : null;
                    }

                    break;

                // ==========================================================================

                case "asset_burn":
                    color = "cancel";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].payer)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount_to_burn.amount}
                                    asset={op[1].amount_to_burn.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_fund_fee_pool":
                    color = "warning";
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].from_account)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].asset_id)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount}
                                    asset="1.3.0"
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_settle":
                    color = "warning";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].account)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].amount.asset_id)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_publish_feed":
                    color = "warning";
                    let { feed } = op[1];

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.publisher"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].publisher)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>{this.linkToAsset(op[1].asset_id)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.price_feed.maximum_short_squeeze_ratio"
                                />
                            </div>
                            <div>
                                {(
                                    feed.maximum_short_squeeze_ratio / 1000
                                ).toFixed(2)}
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.price_feed.maintenance_collateral_ratio"
                                />
                            </div>
                            <div>
                                {(
                                    feed.maintenance_collateral_ratio / 1000
                                ).toFixed(2)}
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="markets.core_rate"
                                />
                            </div>
                            <div>
                                <FormattedPrice
                                    base_asset={
                                        feed.core_exchange_rate.base.asset_id
                                    }
                                    quote_asset={
                                        feed.core_exchange_rate.quote.asset_id
                                    }
                                    base_amount={
                                        feed.core_exchange_rate.base.amount
                                    }
                                    quote_amount={
                                        feed.core_exchange_rate.quote.amount
                                    }
                                    noPopOver
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.settlement_price"
                                />
                            </div>
                            <div>
                                <FormattedPrice
                                    base_asset={
                                        feed.settlement_price.base.asset_id
                                    }
                                    quote_asset={
                                        feed.settlement_price.quote.asset_id
                                    }
                                    base_amount={
                                        feed.settlement_price.base.amount
                                    }
                                    quote_amount={
                                        feed.settlement_price.quote.amount
                                    }
                                    noPopOver
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "committee_member_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.committee_member.title"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(
                                    op[1].committee_member_account
                                )}
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "witness_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.witness"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].witness_account)}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "witness_update":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.witness"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].witness_account)}</div>
                        </div>
                    );

                    if (op[1].new_url) {
                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="transaction.new_url"
                                    />
                                </div>
                                <div>
                                    <a
                                        href={op[1].new_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {op[1].new_url}
                                    </a>
                                </div>
                            </div>
                        );
                    }

                    break;

                // ==========================================================================

                case "balance_claim":
                    color = "success";

                    let bal_id = op[1].balance_to_claim.substring(5);

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.claimed"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].total_claimed.amount}
                                    asset={op[1].total_claimed.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.deposit_to"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].deposit_to_account)}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.balance_id"
                                />
                            </div>
                            <div>#{bal_id}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.balance_owner"
                                />
                            </div>
                            <div style={{ fontSize: "80%" }}>
                                {op[1].balance_owner_key.substring(0, 10)}
                                ...
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "vesting_balance_withdraw":
                    color = "success";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].owner)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "transfer_to_blind":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.from"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].from)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.blinding_factor"
                                />
                            </div>
                            <div style={{ fontSize: "80%" }}>
                                {op[1].blinding_factor}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.outputs"
                                />
                            </div>
                            <div>
                                <Inspector
                                    data={op[1].outputs[0]}
                                    search={false}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "transfer_from_blind":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].to)}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.blinding_factor"
                                />
                            </div>
                            <div style={{ fontSize: "80%" }}>
                                {op[1].blinding_factor}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.inputs"
                                />
                            </div>
                            <div>
                                <Inspector
                                    data={op[1].inputs[0]}
                                    search={false}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "blind_transfer":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.inputs"
                                />
                            </div>
                            <div>
                                <Inspector
                                    data={op[1].inputs[0]}
                                    search={false}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.outputs"
                                />
                            </div>
                            <div>
                                <Inspector
                                    data={op[1].outputs[0]}
                                    search={false}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "proposal_create":
                    var expiration_date = new Date(op[1].expiration_time + "Z");
                    var has_review_period =
                        op[1].review_period_seconds !== undefined;
                    var review_begin_time = !has_review_period
                        ? null
                        : expiration_date.getTime() -
                        op[1].review_period_seconds * 1000;
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.review_period"
                                />
                            </div>
                            <div>
                                {has_review_period ? (
                                    <FormattedDate
                                        value={new Date(review_begin_time)}
                                        format="full"
                                    />
                                ) : (
                                    <span>&mdash;</span>
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.expiration_time"
                                />
                            </div>
                            <div>
                                <FormattedDate
                                    value={expiration_date}
                                    format="full"
                                />
                            </div>
                        </div>
                    );
                    var operations = [];
                    for (let pop of op[1].proposed_ops) operations.push(pop.op);

                    let proposalsText = op[1].proposed_ops.map((o, index) => {
                        return (
                            <ProposedOperation
                                key={index}
                                index={index}
                                op={o.op}
                                inverted={false}
                                hideFee={true}
                                hideOpLabel={true}
                                hideDate={true}
                                proposal={true}
                            />
                        );
                    });

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.proposed_operations"
                                />
                            </div>
                            <div>{proposalsText}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.fee_paying_account"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "proposal_update":
                    let fields = [
                        "active_approvals_to_add",
                        "active_approvals_to_remove",
                        "owner_approvals_to_add",
                        "owner_approvals_to_remove",
                        "key_approvals_to_add",
                        "key_approvals_to_remove"
                    ];

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.fee_paying_account"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.id"
                                />
                            </div>
                            <div>{op[1].proposal}</div>
                        </div>
                    );

                    fields.forEach(field => {
                        if (op[1][field].length) {
                            rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            content={`proposal.update.${field}`}
                                        />
                                    </div>
                                    <div>
                                        {op[1][field].map(value => {
                                            return (
                                                <div key={value}>
                                                    {this.linkToAccount(value)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                    });

                    break;

                // ==========================================================================

                case "proposal_delete":
                    color = "cancel";
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.fee_paying_account"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].fee_paying_account)}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_delete.using_owner_authority"
                                />
                            </div>
                            <div>
                                <TranslateBoolean
                                    value={op[1].using_owner_authority}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="proposal_create.id"
                                />
                            </div>
                            <div>{op[1].proposal}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "asset_claim_fees":
                    color = "success";

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.claimed"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount_to_claim.amount}
                                    asset={op[1].amount_to_claim.asset_id}
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.deposit_to"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].issuer)}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "asset_reserve":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="modal.reserve.from"
                                />
                            </div>
                            <div>{this.linkToAccount(op[1].payer)}</div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>
                                {this.linkToAsset(
                                    op[1].amount_to_reserve.asset_id
                                )}
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount_to_reserve.amount}
                                    asset={op[1].amount_to_reserve.asset_id}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "worker_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.workers.title"
                                />
                            </div>
                            <div>{op[1].name}</div>
                        </div>
                    );

                    let startDate = counterpart.localize(
                        new Date(op[1].work_begin_date),
                        { type: "date" }
                    );
                    let endDate = counterpart.localize(
                        new Date(op[1].work_end_date),
                        { type: "date" }
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.workers.period"
                                />
                            </div>
                            <div>
                                {startDate} - {endDate}
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.workers.daily_pay"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].daily_pay}
                                    asset="1.3.0"
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.workers.website"
                                />
                            </div>
                            <div>{op[1].url}</div>
                        </div>
                    );

                    if (op[1].initializer[1]) {
                        rows.push(
                            <div key={key++} className="transaction__row">
                                <div>
                                    <Translate
                                        component="span"
                                        content="explorer.workers.vesting_pay"
                                    />
                                </div>
                                <div>
                                    {
                                        op[1].initializer[1]
                                            .pay_vesting_period_days
                                    }
                                </div>
                            </div>
                        );
                    }

                    break;

                // ==========================================================================

                case "asset_claim_pool":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="account.name"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].issuer} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>
                                <LinkToAssetById asset={op[1].asset_id} />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount_to_claim.amount}
                                    asset={op[1].amount_to_claim.asset_id}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "asset_update_issuer":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.from"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].issuer} />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].new_issuer} />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.title"
                                />
                            </div>
                            <div>
                                <LinkToAssetById
                                    asset={op[1].asset_to_update}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "bid_collateral":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].bidder} />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.collateral_bid.collateral"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    asset={op[1].additional_collateral.asset_id}
                                    amount={op[1].additional_collateral.amount}
                                />
                            </div>
                        </div>
                    );

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.asset.collateral_bid.debt"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    asset={op[1].debt_covered.asset_id}
                                    amount={op[1].debt_covered.amount}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "account_status_upgrade":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.account_upgrade"
                                />
                            </div>
                            <div>
                                {this.linkToAccount(op[1].account_to_upgrade)}
                            </div>
                        </div>
                    );
                    {
                        op[1].referral_status_type == 1
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="explorer.block.new_contract"
                                        />
                                    </div>
                                    <div>Start</div>
                                </div>
                            )
                            : null;
                    }
                    {
                        op[1].referral_status_type == 2
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="explorer.block.new_contract"
                                        />
                                    </div>
                                    <div>Expert</div>
                                </div>
                            )
                            : null;
                    }
                    {
                        op[1].referral_status_type == 3
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="explorer.block.new_contract"
                                        />
                                    </div>
                                    <div>Citizen</div>
                                </div>
                            )
                            : null;
                    }
                    {
                        op[1].referral_status_type == 4
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate
                                            component="span"
                                            content="explorer.block.new_contract"
                                        />
                                    </div>
                                    <div>Infinity</div>
                                </div>
                            )
                            : null;
                    }
                    break;

                // ==========================================================================

                case "flipcoin_bet":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].bettor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.bet_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].bet.amount} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "flipcoin_call":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].caller} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.bet_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].bet.amount} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "lottery_goods_create_lot":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].owner} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.lot_create"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].ticket_price.amount}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "lottery_goods_buy_ticket":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].participant}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.lottery_ticket_price"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].ticket_price.amount}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "lottery_goods_send_contacts":
                    if (op[1].winner_contacts) {
                        let { text, isMine } = PrivateKeyStore.decodeMemo(
                            op[1].winner_contacts
                        );

                        memo = text ? (
                            <div
                                className="memo"
                                style={{ wordBreak: "break-all" }}
                            >
                                {text}
                            </div>
                        ) : !text && isMine ? (
                            <div>
                                <Translate content="transfer.memo_unlock" />
                                &nbsp;
                                <a onClick={this._toggleLock.bind(this)}>
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"locked"}
                                    />
                                </a>
                            </div>
                        ) : null;
                    }
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].winner} />
                            </div>
                        </div>
                    );
                    {
                        memo
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate content="transfer.memo" />
                                    </div>
                                    {memo}
                                </div>
                            )
                            : null;
                    }

                    break;

                // ==========================================================================

                case "lottery_goods_confirm_delivery":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].winner} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.lot_num"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].lot_id.lottery_goods}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "matrix_open_room":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.account.title"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.matrix_id"
                                />
                            </div>
                            <div>{op[1].matrix_id}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.matrix_level"
                                />
                            </div>
                            <div>{op[1].matrix_level}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.matrix_price"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].level_price.amount}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "create_p2p_adv":
                    price = parseFloat(op[1].price / 100000000)
                        .toFixed(8)
                        .toString()
                        .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.adv_type"
                                />
                            </div>
                            <div>
                                {op[1].adv_type ? (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.adv_type_sell"
                                    />
                                ) : (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.adv_type_buy"
                                    />
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.adv_description"
                                />
                            </div>
                            <div>{op[1].adv_description}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_cwd"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].min_cwd} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.max_cwd"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].max_cwd} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.price"
                                />
                            </div>
                            <div>{price}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.currency"
                                />
                            </div>
                            <div>{op[1].currency}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_p2p_complete_deals"
                                />
                            </div>
                            <div>{op[1].min_p2p_complete_deals}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_account_status"
                                />
                            </div>
                            <div>{op[1].min_account_status}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.timelimit_for_reply"
                                />
                            </div>
                            <div>{op[1].timelimit_for_reply / 60}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.timelimit_for_approve"
                                />
                            </div>
                            <div>{op[1].timelimit_for_approve / 60}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">Geo</div>
                            <div>{op[1].geo}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "edit_p2p_adv":
                    price =
                        parseFloat(op[1].price) /
                        (100000000)
                            .toFixed(8)
                            .toString()
                            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.adv_type"
                                />
                            </div>
                            <div>
                                {op[1].status ? (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.status_active"
                                    />
                                ) : (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.status_inactive"
                                    />
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.adv_type"
                                />
                            </div>
                            <div>
                                {op[1].adv_type ? (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.adv_type_sell"
                                    />
                                ) : (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.adv_type_buy"
                                    />
                                )}
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.adv_description"
                                />
                            </div>
                            <div>{op[1].adv_description}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_cwd"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].min_cwd} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.max_cwd"
                                />
                            </div>
                            <div>
                                <FormattedAsset amount={op[1].max_cwd} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.price"
                                />
                            </div>
                            <div>{price}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.currency"
                                />
                            </div>
                            <div>{op[1].currency}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_p2p_complete_deals"
                                />
                            </div>
                            <div>{op[1].min_p2p_complete_deals}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.min_account_status"
                                />
                            </div>
                            <div>{op[1].min_account_status}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.timelimit_for_reply"
                                />
                            </div>
                            <div>{op[1].timelimit_for_reply / 60}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.timelimit_for_approve"
                                />
                            </div>
                            <div>{op[1].timelimit_for_approve / 60}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">Geo</div>
                            <div>{op[1].geo}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "create_p2p_order":
                    price = parseFloat(op[1].price / 100000000)
                        .toFixed(8)
                        .toString()
                        .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_adv"
                                />
                            </div>
                            <div>{op[1].p2p_adv}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.quantity"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.price"
                                />
                            </div>
                            <div>{price}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_client"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].p2p_client} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "cancel_p2p_order":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_client"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].p2p_client} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.blacklist"
                                />
                            </div>
                            <div>
                                {op[1].blacklist ? (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.blacklist_true"
                                    />
                                ) : (
                                    <Translate
                                        component="span"
                                        content="transaction.trxTypes.p2p_ops.blacklist_false"
                                    />
                                )}
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "call_p2p_order":
                    price = parseFloat(op[1].price / 100000000)
                        .toFixed(8)
                        .toString()
                        .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.quantity"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.price"
                                />
                            </div>
                            <div>{price}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_client"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].p2p_client} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "payment_p2p_order":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].recieving_account}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_client"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].paying_account}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "release_p2p_order":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].recieving_account}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_client"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].paying_account}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "open_p2p_dispute":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.applicant"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.defendant"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].defendant} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.arbitr"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].arbitr} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "reply_p2p_dispute":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_order"
                                />
                            </div>
                            <div>{op[1].p2p_order}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.reply_disput"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.arbitr"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].arbitr} />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "remove_from_p2p_adv_black_list":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.p2p_adv"
                                />
                            </div>
                            <div>{op[1].p2p_adv}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.trader"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].p2p_gateway}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.p2p_ops.black_acc"
                                />
                            </div>
                            <div>
                                <LinkToAccountById
                                    account={op[1].blacklisted}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "send_message":
                    color = "success";

                    if (op[1].memo) {
                        let { text, isMine } = PrivateKeyStore.decodeMemo(
                            op[1].memo
                        );

                        memo = text ? (
                            <div
                                className="memo"
                                style={{ wordBreak: "break-all" }}
                            >
                                {text}
                            </div>
                        ) : !text && isMine ? (
                            <div>
                                <Translate content="transfer.memo_unlock" />
                                &nbsp;
                                <a onClick={this._toggleLock.bind(this)}>
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={16}
                                        iconName={"locked"}
                                    />
                                </a>
                            </div>
                        ) : null;
                    }

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.from"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].from} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transfer.to"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].to} />
                            </div>
                        </div>
                    );
                    {
                        memo
                            ? rows.push(
                                <div key={key++} className="transaction__row">
                                    <div>
                                        <Translate content="transfer.memo" />
                                    </div>
                                    {memo}
                                </div>
                            )
                            : null;
                    }

                    break;

                // ==========================================================================

                //CREDIT OPS
                case "credit_system_get":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "credit_repay":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "credit_offer_create":
                    min_income = parseFloat(op[1].min_income / 100000000)
                        .toFixed(8)
                        .toString()
                        .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.min_income"
                                />
                            </div>
                            <div>{min_income}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "credit_offer_cancel":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LLinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_offer"
                                />
                            </div>
                            <div>{op[1].credit_offer}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "credit_offer_fill":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_offer"
                                />
                            </div>
                            <div>{op[1].credit_offer}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "pledge_offer_give_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].pledge_amount.amount}
                                    asset={op[1].pledge_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                    asset={op[1].credit_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                    asset={op[1].repay_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_days"
                                />
                            </div>
                            <div>{op[1].pledge_days}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "pledge_offer_take_create":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].pledge_amount.amount}
                                    asset={op[1].pledge_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                    asset={op[1].credit_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                    asset={op[1].repay_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_days"
                                />
                            </div>
                            <div>{op[1].pledge_days}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "pledge_offer_cancel":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creator"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creator} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_offer"
                                />
                            </div>
                            <div>{op[1].pledge_offer}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "pledge_offer_fill":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.credit_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].credit_amount.amount}
                                    asset={op[1].credit_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].pledge_amount.amount}
                                    asset={op[1].pledge_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                    asset={op[1].repay_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_days"
                                />
                            </div>
                            <div>{op[1].pledge_days}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "pledge_offer_repay":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.debitor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].debitor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.creditor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].creditor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.repay_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].repay_amount.amount}
                                    asset={op[1].repay_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_offer"
                                />
                            </div>
                            <div>{op[1].pledge_offer}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.credit_ops.pledge_amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].pledge_amount.amount}
                                    asset={op[1].pledge_amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "poc_vote":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.account"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.poc_vote_ops.poc3_vote"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].poc3_vote.amount}
                                    asset={op[1].poc3_vote.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.poc_vote_ops.poc6_vote"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].poc6_vote.amount}
                                    asset={op[1].poc6_vote.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.poc_vote_ops.poc12_vote"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].poc12_vote.amount}
                                    asset={op[1].poc12_vote.asset_id}
                                />
                            </div>
                        </div>
                    );
                    break;

                // ==========================================================================

                case "exchange_silver":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.account"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "poc_stak":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.account"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].stak_amount.amount}
                                    asset={op[1].stak_amount.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.poc_stak_ops.staking_type"
                                />
                            </div>
                            <div>
                                {op[1].staking_type}&nbsp;
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.poc_stak_ops.months"
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "buy_gcwd":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.account"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.amount"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].amount.amount}
                                    asset={op[1].amount.asset_id}
                                />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "change_referrer":
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.account"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].account_id} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.new_referrer"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].new_referrer} />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_team_create":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].name}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.description"
                                />
                            </div>
                            <div>{op[1].description}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_team_delete":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_invite_send":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.player"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_invite_accept":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.player"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_player_remove":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.player"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_team_leave":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].captain} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.player"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );

                    break;
                // ==========================================================================

                case "gr_vote":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.captain"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].player} />
                            </div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_range_bet":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.bettor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].bettor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.bet"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].bet.amount}
                                    asset={op[1].bet.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.great_race.team"
                                />
                            </div>
                            <div>{op[1].team}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.result"
                                />
                            </div>
                            <div>{op[1].result ?
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.result_true"
                                />
                                :
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.result_false"
                                />
                            }</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.lower_rank"
                                />
                            </div>
                            <div>{op[1].lower_rank}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.upper_rank"
                                />
                            </div>
                            <div>{op[1].upper_rank}</div>
                        </div>
                    );

                    break;

                // ==========================================================================

                case "gr_team_bet":

                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.bettor"
                                />
                            </div>
                            <div>
                                <LinkToAccountById account={op[1].bettor} />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.bet"
                                />
                            </div>
                            <div>
                                <FormattedAsset
                                    amount={op[1].bet.amount}
                                    asset={op[1].bet.asset_id}
                                />
                            </div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.team1"
                                />
                            </div>
                            <div>{op[1].team1}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.team2"
                                />
                            </div>
                            <div>{op[1].team2}</div>
                        </div>
                    );
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="transaction.trxTypes.gr_bets.winner"
                                />
                            </div>
                            <div>{op[1].winner}</div>
                        </div>
                    );
                    break;

                // ==========================================================================

                default:
                    rows.push(
                        <div key={key++} className="transaction__row">
                            <div className="transaction__legend">
                                <Translate
                                    component="span"
                                    content="explorer.block.op"
                                />
                            </div>
                            <div>
                                <Inspector data={op} search={false} />
                            </div>
                        </div>
                    );
                    break;
            }

            info.push(
                <OperationTable
                    txIndex={this.props.index}
                    key={opIndex}
                    opCount={opCount}
                    index={opIndex}
                    color={color}
                    type={op[0]}
                    fee={op[1].fee}
                >
                    {rows}
                </OperationTable>
            );
        });

        return <div className="transaction__wrap">{info}</div>;
    }
}

Transaction.defaultProps = {
    no_links: false
};

Transaction.propTypes = {
    trx: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    no_links: PropTypes.bool
};

export default Transaction;
