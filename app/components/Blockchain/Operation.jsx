import React from "react";
import FormattedAsset from "../Utility/FormattedAsset";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import utils from "common/utils";
import BlockTime from "./BlockTime";
import LinkToAccountById from "../Utility/LinkToAccountById";
import LinkToAssetById from "../Utility/LinkToAssetById";
import BindToChainState from "../Utility/BindToChainState";
import ChainTypes from "../Utility/ChainTypes";
import TranslateWithLinks from "../Utility/TranslateWithLinks";
import { ChainStore, ChainTypes as grapheneChainTypes } from "bitsharesjs";
import account_constants from "chain/account_constants";
import MemoText from "./MemoText";
import ProposedOperation from "./ProposedOperation";
import marketUtils from "common/market_utils";
import { connect } from "alt-react";
import SettingsStore from "stores/SettingsStore";
import PropTypes from "prop-types";
import { Tooltip } from "crowdwiz-ui-modal";

const { operations } = grapheneChainTypes;
require("./scss/_ops-all.scss");

let ops = Object.keys(operations);
let listings = account_constants.account_listing;

const ShortObjectId = ({ objectId }) => {
    if (typeof objectId === "string") {
        const parts = objectId.split(".");
        const { length } = parts;
        if (length > 0) return "#" + parts[length - 1];
    }
    return objectId;
};

class TransactionLabel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            nextProps.color !== this.props.color ||
            nextProps.type !== this.props.type
        );
    }
    render() {
        let trxTypes = counterpart.translate("transaction.trxTypes");
        return (
            <span className="operation__type">
                <span className={"operation__marker operation__marker--" + this.props.color}></span>

                <Tooltip
                    placement="bottom"
                    title={counterpart.translate("tooltip.show_block", {
                        block: utils.format_number(this.props.block, 0)
                    })}
                >
                    <Link to={`/block/${this.props.block}`} >
                        <span className="operation__name">
                            {trxTypes[ops[this.props.type]]}
                        </span>
                    </Link>
                </Tooltip>
            </span>
        );
    }
}

class Row extends React.Component {
    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0",
        tempComponent: "tr"
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        let { block, dynGlobalObject } = this.props;
        let last_irreversible_block_num = dynGlobalObject.get(
            "last_irreversible_block_num"
        );
        if (nextProps.dynGlobalObject === this.props.dynGlobalObject) {
            return false;
        }
        return block > last_irreversible_block_num;
    }

    render() {
        let {
            block,
            fee,
            color,
            type,
            hidePending,
            operationsInfo,
            mainPageMode,
            notificationMode,
            shortMode,
        } = this.props;

        let last_irreversible_block_num = this.props.dynGlobalObject.get(
            "last_irreversible_block_num"
        );
        let pending = null;

        if (!hidePending && block > last_irreversible_block_num) {
            pending =
                <Translate
                    content="operation.pending"
                    blocks={block - last_irreversible_block_num}
                />
        }

        fee.amount = parseInt(fee.amount, 10);

        let deviceWidth = window.innerWidth;

        if (mainPageMode) {
            return (
                <div className="ms-recent-ops__item">
                    {/* OP ID */}
                    <span className="ms-recent-ops__data-set ms-recent-ops__id">
                        # {this.props.block}
                    </span>

                    {/* OP NAME */}
                    <div className="ms-recent-ops__type">
                        <span className="ms-recent-ops__data-set ms-recent-ops__id">
                            <TransactionLabel
                                color={color}
                                type={type}
                                block={block}
                            />
                        </span>
                    </div>

                    {/* OP DESCRIPTION */}
                    <div className="ms-recent-ops__info">
                        {this.props.info}
                        {pending ? (
                            <span className="ms-recent-ops__pending">
                                {" "}
                                - {pending}
                            </span>
                        ) : null}
                    </div>
                </div>
            )
        }

        else if (notificationMode) {
            return (
                <div className="notification__item">

                    <div className="notification__data-block">
                        {/* OP NAME */}
                        <div className="notification__type">
                            <TransactionLabel
                                color={color}
                                type={type}
                                block={block}
                            />
                        </div>
                    </div>


                    {/* OP DESCRIPTION */}
                    <div className="notification__info">
                        {this.props.info}
                    </div>
                </div>
            )
        }

        else {
            return (
                <div className="operation__item">
                    <div className="operation__body">
                        <div className={shortMode ? "operation__data-block operation__data-block--short-mode" : "operation__data-block"}>
                            <TransactionLabel
                                color={color}
                                type={type}
                                block={block}
                            />
                            
                            {/* OP ID */}
                            <span className="operation__data-set operation__id">
                                {deviceWidth > 576 ? null :
                                    <span className="operation__legend">ID:</span>}

                                <span>#{this.props.operationId ? this.props.operationId : block}</span>
                            </span>

                            {/* OP TIME */}
                            <span className="operation__data-set operation__time-block">
                                {deviceWidth > 576 ? null :
                                    <Translate content="account.transactions.time" className="operation__legend" />
                                }
                                <BlockTime
                                    block_number={this.props.block}
                                    fullDate={true}
                                />
                            </span>

                            {/* OP FEE */}
                            <span className="operation__fee-block">
                                <Translate content="account.transactions.fee" className="operation__legend" />

                                <FormattedAsset
                                    amount={fee.amount}
                                    asset={fee.asset_id}
                                />
                            </span>
                        </div>

                        {/* OP DESCRIPTION */}
                        <div className="operation__description">
                            {this.props.info}
                            {pending ? (
                                <span className="operation__pending">
                                    {" "}
                                    - {pending}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            );
        }
    }
}
Row = BindToChainState(Row);

class Operation extends React.Component {
    static defaultProps = {
        op: [],
        current: "",
        block: null,
        hideOpLabel: false,
        csvExportMode: false
    };

    static propTypes = {
        op: PropTypes.array.isRequired,
        current: PropTypes.string,
        block: PropTypes.number,
        csvExportMode: PropTypes.bool
    };

    UNSAFE_componentWillReceiveProps(np) {
        if (np.marketDirections !== this.props.marketDirections) {
            this.forceUpdate();
        }
    }

    linkToAccount(name_or_id) {
        if (!name_or_id) return <span>-</span>;
        return utils.is_object_id(name_or_id) ? (
            <LinkToAccountById account={name_or_id} />
        ) : (
            <Link to={`/profile/${name_or_id}`}>{name_or_id}</Link>
        );
    }

    linkToAsset(symbol_or_id) {
        if (!symbol_or_id) return <span>-</span>;
        return utils.is_object_id(symbol_or_id) ? (
            <LinkToAssetById asset={symbol_or_id} />
        ) : (
            <Link to={`/asset/${symbol_or_id}`}>{symbol_or_id}</Link>
        );
    }

    shouldComponentUpdate(nextProps) {
        if (!this.props.op || !nextProps.op) {
            return false;
        }
        return (
            !utils.are_equal_shallow(nextProps.op[1], this.props.op[1]) ||
            nextProps.marketDirections !== this.props.marketDirections
        );
    }

    render() {
        let { op, current, block } = this.props;
        let line = null,
            column = null,
            color = "info";
        let memoComponent = null;

        switch (
        ops[op[0]] // For a list of trx types, see chain_types.coffee
        ) {
            case "transfer":
                if (op[1].memo) {
                    memoComponent = <MemoText memo={op[1].memo} />;
                }

                color = "success";
                op[1].amount.amount = parseFloat(op[1].amount.amount);

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.transfer"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount",
                                    decimalOffset:
                                        op[1].amount.asset_id === "1.3.0"
                                            ? 5
                                            : null
                                },
                                { type: "account", value: op[1].to, arg: "to" }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );

                break;

            // ==========================================================================

            case "limit_order_create":
                color = "warning";
                let o = op[1];

                column = (
                    <span>
                        <BindToChainState.Wrapper
                            base={o.min_to_receive.asset_id}
                            quote={o.amount_to_sell.asset_id}
                        >
                            {({ base, quote }) => {
                                const {
                                    marketName,
                                    first,
                                    second
                                } = marketUtils.getMarketName(base, quote);
                                const inverted = this.props.marketDirections.get(
                                    marketName
                                );

                                const isBid =
                                    o.amount_to_sell.asset_id ===
                                    (inverted
                                        ? first.get("id")
                                        : second.get("id"));

                                let priceBase = isBid
                                    ? o.amount_to_sell
                                    : o.min_to_receive;
                                let priceQuote = isBid
                                    ? o.min_to_receive
                                    : o.amount_to_sell;
                                const amount = isBid
                                    ? op[1].min_to_receive
                                    : op[1].amount_to_sell;
                                let orderId = this.props.result
                                    ? typeof this.props.result[1] == "string"
                                        ? "#" +
                                        this.props.result[1].substring(4)
                                        : ""
                                    : "";

                                return (
                                    <TranslateWithLinks
                                        string={
                                            isBid
                                                ? "operation.limit_order_buy"
                                                : "operation.limit_order_sell"
                                        }
                                        keys={[
                                            {
                                                type: "account",
                                                value: op[1].seller,
                                                arg: "account"
                                            },
                                            {
                                                type: "amount",
                                                value: amount,
                                                arg: "amount"
                                            },
                                            {
                                                type: "price",
                                                value: {
                                                    base: priceBase,
                                                    quote: priceQuote
                                                },
                                                arg: "price"
                                            }
                                        ]}
                                        params={{
                                            order: orderId
                                        }}
                                    />
                                );
                            }}
                        </BindToChainState.Wrapper>
                    </span>
                );
                break;

            // ==========================================================================

            case "limit_order_cancel":
                color = "cancel";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.limit_order_cancel"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].fee_paying_account,
                                    arg: "account"
                                }
                            ]}
                            params={{
                                order: op[1].order.substring(4)
                            }}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "call_order_update":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.call_order_update"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].funding_account,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].delta_debt.asset_id,
                                    arg: "debtSymbol"
                                },
                                {
                                    type: "amount",
                                    value: op[1].delta_debt,
                                    arg: "debt"
                                },
                                {
                                    type: "amount",
                                    value: op[1].delta_collateral,
                                    arg: "collateral"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "key_create":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.create_key"
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "account_create":
                column = (
                    <TranslateWithLinks
                        string="operation.reg_account"
                        keys={[
                            {
                                type: "account",
                                value: op[1].registrar,
                                arg: "registrar"
                            },
                            {
                                type: "account",
                                value: op[1].name,
                                arg: "new_account"
                            },
                            {
                                type: "account",
                                value: op[1].referrer,
                                arg: "referrer"
                            }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "account_update":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.update_account"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "account_whitelist":
                let label =
                    op[1].new_listing === listings.no_listing
                        ? "unlisted_by"
                        : op[1].new_listing === listings.white_listed
                            ? "whitelisted_by"
                            : "blacklisted_by";
                column = (
                    <span>
                        <TranslateWithLinks
                            string={"operation." + label}
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].authorizing_account,
                                    arg: "lister"
                                },
                                {
                                    type: "account",
                                    value: op[1].account_to_list,
                                    arg: "listee"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "account_upgrade":
                column = (
                    <span>
                        <TranslateWithLinks
                            string={
                                op[1].upgrade_to_lifetime_member
                                    ? "operation.lifetime_upgrade_account"
                                    : "operation.annual_upgrade_account"
                            }
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account_to_upgrade,
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "account_transfer":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.account_transfer"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account_id,
                                    arg: "account"
                                },
                                {
                                    type: "account",
                                    value: op[1].new_owner,
                                    arg: "to"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_create":
                color = "warning";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].issuer,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].symbol,
                                    arg: "asset"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_update":
            case "asset_update_bitasset":
                color = "warning";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_update"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].issuer,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].asset_to_update,
                                    arg: "asset"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_update_feed_producers":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_update_feed_producers"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].issuer,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].asset_to_update,
                                    arg: "asset"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_issue":
                color = "warning";

                if (op[1].memo) {
                    memoComponent = <MemoText memo={op[1].memo} />;
                }

                op[1].asset_to_issue.amount = parseInt(
                    op[1].asset_to_issue.amount,
                    10
                );
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_issue"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].issuer,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].asset_to_issue,
                                    arg: "amount"
                                },
                                {
                                    type: "account",
                                    value: op[1].issue_to_account,
                                    arg: "to"
                                }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_fund_fee_pool":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_fund_fee_pool"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from_account,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].asset_id,
                                    arg: "asset"
                                },
                                {
                                    type: "amount",
                                    value: {
                                        amount: op[1].amount,
                                        asset_id: "1.3.0"
                                    },
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_settle":
                color = "warning";
                const baseAmount = op[1].amount;
                const instantSettleCode = 2;
                if (
                    this.props.result &&
                    this.props.result[0] == instantSettleCode
                ) {
                    const quoteAmount = this.props.result[1];
                    column = (
                        <span>
                            <TranslateWithLinks
                                string="operation.asset_settle_instant"
                                keys={[
                                    {
                                        type: "account",
                                        value: op[1].account,
                                        arg: "account"
                                    },
                                    {
                                        type: "amount",
                                        value: baseAmount,
                                        arg: "amount"
                                    },
                                    {
                                        type: "price",
                                        value: {
                                            base: baseAmount,
                                            quote: quoteAmount
                                        },
                                        arg: "price"
                                    }
                                ]}
                            />
                        </span>
                    );
                } else {
                    column = (
                        <span>
                            <TranslateWithLinks
                                string="operation.asset_settle"
                                keys={[
                                    {
                                        type: "account",
                                        value: op[1].account,
                                        arg: "account"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].amount,
                                        arg: "amount"
                                    }
                                ]}
                            />
                        </span>
                    );
                }

                break;

            // ==========================================================================

            case "asset_global_settle":
                color = "warning";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_global_settle"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].issuer,
                                    arg: "account"
                                },
                                {
                                    type: "asset",
                                    value: op[1].asset_to_settle,
                                    arg: "asset"
                                },
                                {
                                    type: "price",
                                    value: op[1].settle_price,
                                    arg: "price"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_publish_feed":
                color = "warning";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.publish_feed"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].publisher,
                                    arg: "account"
                                },
                                {
                                    type: "price",
                                    value: op[1].feed.settlement_price,
                                    arg: "price"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "witness_create":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.witness_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].witness_account,
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "witness_update":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.witness_update"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].witness_account,
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "witness_withdraw_pay":
                if (current === op[1].witness_account) {
                    column = (
                        <span>
                            <Translate
                                component="span"
                                content="transaction.witness_pay"
                            />
                            &nbsp;
                            <FormattedAsset
                                amount={op[1].amount}
                                asset={"1.3.0"}
                            />
                            <Translate
                                component="span"
                                content="transaction.to"
                            />
                            &nbsp;
                            {this.linkToAccount(op[1].witness_account)}
                        </span>
                    );
                } else {
                    column = (
                        <span>
                            <Translate
                                component="span"
                                content="transaction.received"
                            />
                            &nbsp;
                            <FormattedAsset
                                amount={op[1].amount}
                                asset={"1.3.0"}
                            />
                            <Translate
                                component="span"
                                content="transaction.from"
                            />
                            &nbsp;
                            {this.linkToAccount(op[1].witness_account)}
                        </span>
                    );
                }
                break;

            // ==========================================================================

            case "proposal_create":
                column = (
                    <div className="inline-block">
                        <span>
                            <TranslateWithLinks
                                string="operation.proposal_create"
                                keys={[
                                    {
                                        type: "account",
                                        value: op[1].fee_paying_account,
                                        arg: "account"
                                    },
                                    {
                                        value: this.props.result ? (
                                            <ShortObjectId
                                                objectId={this.props.result[1]}
                                            />
                                        ) : (
                                            ""
                                        ),
                                        arg: "proposal"
                                    }
                                ]}
                            />
                            :
                        </span>
                        <div>
                            {op[1].proposed_ops.map((o, index) => {
                                return (
                                    <ProposedOperation
                                        op={o.op}
                                        key={index}
                                        index={index}
                                        inverted={false}
                                        hideFee={true}
                                        hideOpLabel={true}
                                        hideDate={true}
                                        proposal={true}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
                break;

            // ==========================================================================

            case "proposal_update":
                const fields = [
                    "active_approvals_to_add",
                    "active_approvals_to_remove",
                    "owner_approvals_to_add",
                    "owner_approvals_to_remove",
                    "key_approvals_to_add",
                    "key_approvals_to_remove"
                ];
                column = (
                    <div>
                        <span>
                            <TranslateWithLinks
                                string="operation.proposal_update"
                                keys={[
                                    {
                                        type: "account",
                                        value: op[1].fee_paying_account,
                                        arg: "account"
                                    },
                                    {
                                        value: (
                                            <ShortObjectId
                                                objectId={op[1].proposal}
                                            />
                                        ),
                                        arg: "proposal"
                                    }
                                ]}
                            />
                        </span>
                        <div className="proposal-update">
                            {fields.map(field => {
                                if (op[1][field].length) {
                                    return (
                                        <div key={field}>
                                            <Translate
                                                content={`proposal.updated.${field}`}
                                            />
                                            {op[1][field].map(value => {
                                                return (
                                                    <span key={value}>
                                                        {field.startsWith("key")
                                                            ? value
                                                            : this.linkToAccount(
                                                                value
                                                            )}{" "}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    );
                                } else return null;
                            })}
                        </div>
                    </div>
                );
                break;

            // ==========================================================================

            case "proposal_delete":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.proposal_delete"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].fee_paying_account,
                                    arg: "account"
                                },
                                {
                                    value: (
                                        <ShortObjectId
                                            objectId={op[1].proposal}
                                        />
                                    ),
                                    arg: "proposal"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "withdraw_permission_create":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.withdraw_permission_create"
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].withdraw_from_account)}
                        <Translate component="span" content="transaction.to" />
                        &nbsp;
                        {this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            // ==========================================================================

            case "withdraw_permission_update":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.withdraw_permission_update"
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].withdraw_from_account)}
                        <Translate component="span" content="transaction.to" />
                        &nbsp;
                        {this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            // ==========================================================================

            case "withdraw_permission_claim":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.withdraw_permission_claim"
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].withdraw_from_account)}
                        <Translate component="span" content="transaction.to" />
                        &nbsp;
                        {this.linkToAccount(op[1].withdraw_to_account)}
                    </span>
                );
                break;

            // ==========================================================================

            case "withdraw_permission_delete":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.withdraw_permission_delete"
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].withdraw_from_account)}
                        <Translate component="span" content="transaction.to" />
                        &nbsp;
                        {this.linkToAccount(op[1].authorized_account)}
                    </span>
                );
                break;

            // ==========================================================================

            case "fill_order":
                color = "success";
                o = op[1];

                /*
                marketName = OPEN.ETH_USD
                if (!inverted) (default)
                    price = USD / OPEN.ETH
                    buy / sell OPEN.ETH
                    isBid = amount_to_sell.asset_symbol = USD
                    amount = to_receive
                if (inverted)
                    price =  OPEN.ETH / USD
                    buy / sell USD
                    isBid = amount_to_sell.asset_symbol = OPEN.ETH
                    amount =

                    const {marketName, first, second} = marketUtils.getMarketName(base, quote);
                    const inverted = this.props.marketDirections.get(marketName);
                    // const paySymbol = base.get("symbol");
                    // const receiveSymbol = quote.get("symbol");

                    const isBid = o.amount_to_sell.asset_id === (inverted ? first.get("id") : second.get("id"));

                    let priceBase = (isBid) ? o.amount_to_sell : o.min_to_receive;
                    let priceQuote = (isBid) ? o.min_to_receive : o.amount_to_sell;
                    const amount = isBid ? op[1].min_to_receive : op[1].amount_to_sell;
                */

                column = (
                    <span>
                        <BindToChainState.Wrapper
                            base={o.receives.asset_id}
                            quote={o.pays.asset_id}
                        >
                            {({ base, quote }) => {
                                const {
                                    marketName,
                                    first,
                                    second
                                } = marketUtils.getMarketName(base, quote);
                                const inverted = this.props.marketDirections.get(
                                    marketName
                                );
                                const isBid =
                                    o.pays.asset_id ===
                                    (inverted
                                        ? first.get("id")
                                        : second.get("id"));

                                // const paySymbol = base.get("symbol");
                                // const receiveSymbol = quote.get("symbol");
                                let priceBase = isBid ? o.receives : o.pays;
                                let priceQuote = isBid ? o.pays : o.receives;
                                let amount = isBid ? o.receives : o.pays;
                                let receivedAmount =
                                    o.fee.asset_id === amount.asset_id
                                        ? amount.amount - o.fee.amount
                                        : amount.amount;

                                return (
                                    <TranslateWithLinks
                                        string={`operation.fill_order_${isBid ? "buy" : "sell"
                                            }`}
                                        keys={[
                                            {
                                                type: "account",
                                                value: op[1].account_id,
                                                arg: "account"
                                            },
                                            {
                                                type: "amount",
                                                value: {
                                                    amount: receivedAmount,
                                                    asset_id: amount.asset_id
                                                },
                                                arg: "amount"
                                            },
                                            {
                                                type: "price",
                                                value: {
                                                    base: priceBase,
                                                    quote: priceQuote
                                                },
                                                arg: "price"
                                            }
                                        ]}
                                        params={{
                                            order: o.order_id.substring(4)
                                        }}
                                    />
                                );
                            }}
                        </BindToChainState.Wrapper>
                    </span>
                );
                break;

            // ==========================================================================

            case "global_parameters_update":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.global_parameters_update"
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "vesting_balance_create":
                column = (
                    <span>
                        {this.linkToAccount(op[1].creator)}
                        &nbsp;
                        <Translate
                            component="span"
                            content="transaction.vesting_balance_create"
                        />
                        &nbsp;
                        <FormattedAsset
                            amount={op[1].amount.amount}
                            asset={op[1].amount.asset_id}
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].owner)}
                    </span>
                );
                break;

            // ==========================================================================

            case "vesting_balance_withdraw":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.vesting_balance_withdraw"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].owner,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "worker_create":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.worker_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].owner,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: {
                                        amount: op[1].daily_pay,
                                        asset_id: "1.3.0"
                                    },
                                    arg: "pay"
                                }
                            ]}
                            params={{
                                name: op[1].name
                            }}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "balance_claim":
                color = "success";
                op[1].total_claimed.amount = parseInt(
                    op[1].total_claimed.amount,
                    10
                );
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.balance_claim"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].deposit_to_account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].total_claimed,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "committee_member_create":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.committee_member_create"
                        />
                        &nbsp;
                        {this.linkToAccount(op[1].committee_member_account)}
                    </span>
                );
                break;

            // ==========================================================================

            case "transfer_to_blind":
                column = (
                    <span>
                        {this.linkToAccount(op[1].from)}
                        &nbsp;
                        <Translate
                            component="span"
                            content="transaction.sent"
                        />
                        &nbsp;
                        <FormattedAsset
                            amount={op[1].amount.amount}
                            asset={op[1].amount.asset_id}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "transfer_from_blind":
                column = (
                    <span>
                        {this.linkToAccount(op[1].to)}
                        &nbsp;
                        <Translate
                            component="span"
                            content="transaction.received"
                        />
                        &nbsp;
                        <FormattedAsset
                            amount={op[1].amount.amount}
                            asset={op[1].amount.asset_id}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_claim_fees":
                color = "success";
                op[1].amount_to_claim.amount = parseInt(
                    op[1].amount_to_claim.amount,
                    10
                );
                column = (
                    <span>
                        {this.linkToAccount(op[1].issuer)}
                        &nbsp;
                        <BindToChainState.Wrapper
                            asset={op[1].amount_to_claim.asset_id}
                        >
                            {({ asset }) => (
                                <TranslateWithLinks
                                    string="transaction.asset_claim_fees"
                                    keys={[
                                        {
                                            type: "amount",
                                            value: op[1].amount_to_claim,
                                            arg: "balance_amount"
                                        },
                                        {
                                            type: "asset",
                                            value: asset.get("id"),
                                            arg: "asset"
                                        }
                                    ]}
                                />
                            )}
                        </BindToChainState.Wrapper>
                    </span>
                );
                break;

            // ==========================================================================

            case "custom":
                column = (
                    <span>
                        <Translate
                            component="span"
                            content="transaction.custom"
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "asset_reserve":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.asset_reserve"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].payer,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount_to_reserve,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "committee_member_update_global_parameters":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.committee_member_update_global_parameters"
                            keys={[
                                {
                                    type: "account",
                                    value: "1.2.0",
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "override_transfer":
                column = (
                    <TranslateWithLinks
                        string="operation.override_transfer"
                        keys={[
                            {
                                type: "account",
                                value: op[1].issuer,
                                arg: "issuer"
                            },
                            { type: "account", value: op[1].from, arg: "from" },
                            { type: "account", value: op[1].to, arg: "to" },
                            { type: "amount", value: op[1].amount, arg: "amount" }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "asset_settle_cancel":
                column = (
                    <TranslateWithLinks
                        string="operation.asset_settle_cancel"
                        keys={[
                            {
                                type: "account",
                                value: op[1].account,
                                arg: "account"
                            },
                            { type: "amount", value: op[1].amount, arg: "amount" }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "asset_claim_pool":
                column = (
                    <TranslateWithLinks
                        string="operation.asset_claim_pool"
                        keys={[
                            {
                                type: "account",
                                value: op[1].issuer,
                                arg: "account"
                            },
                            {
                                type: "asset",
                                value: op[1].asset_id,
                                arg: "asset"
                            },
                            {
                                type: "amount",
                                value: op[1].amount_to_claim,
                                arg: "amount"
                            }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "asset_update_issuer":
                column = (
                    <TranslateWithLinks
                        string="operation.asset_update_issuer"
                        keys={[
                            {
                                type: "account",
                                value: op[1].issuer,
                                arg: "from_account"
                            },
                            {
                                type: "account",
                                value: op[1].new_issuer,
                                arg: "to_account"
                            },
                            {
                                type: "asset",
                                value: op[1].asset_to_update,
                                arg: "asset"
                            }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "bid_collateral":
                column = (
                    <TranslateWithLinks
                        string="operation.bid_collateral"
                        keys={[
                            {
                                type: "account",
                                value: op[1].bidder,
                                arg: "bid_account"
                            },
                            {
                                type: "amount",
                                value: op[1].additional_collateral,
                                arg: "collateral"
                            },
                            {
                                type: "amount",
                                value: op[1].debt_covered,
                                arg: "debt"
                            }
                        ]}
                    />
                );
                break;

            // ==========================================================================

            case "account_status_upgrade":
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.contract_upgrade"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account_to_upgrade,
                                    arg: "account"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "flipcoin_bet":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.flipcoin_bet"
                            keys={[
                                { type: "amount", value: op[1].bet, arg: "bet" },
                                {
                                    type: "account",
                                    value: op[1].bettor,
                                    arg: "bettor"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "flipcoin_call":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.flipcoin_call"
                            keys={[
                                { type: "amount", value: op[1].bet, arg: "bet" },
                                {
                                    type: "account",
                                    value: op[1].caller,
                                    arg: "caller"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "flipcoin_win":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.flipcoin_win"
                            keys={[
                                {
                                    type: "amount",
                                    value: op[1].payout,
                                    arg: "payout"
                                },
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "flipcoin_loose":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.flipcoin_loose"
                            keys={[
                                { type: "amount", value: op[1].bet, arg: "bet" },
                                {
                                    type: "account",
                                    value: op[1].looser,
                                    arg: "looser"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "flipcoin_cancel":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.flipcoin_cancel"
                            keys={[
                                { type: "amount", value: op[1].bet, arg: "bet" },
                                {
                                    type: "account",
                                    value: op[1].bettor,
                                    arg: "bettor"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_create_lot":
                color = "success";
                let lotId = this.props.result[1];

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_create_lot"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].owner,
                                    arg: "owner"
                                },
                                {
                                    type: "lottery_goods",
                                    value: lotId,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_buy_ticket":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_buy_ticket"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].participant,
                                    arg: "participant"
                                },
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_send_contacts":
                color = "success";

                if (op[1].winner_contacts) {
                    memoComponent = <MemoText memo={op[1].winner_contacts} />;
                }

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_send_contacts"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                },
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_confirm_delivery":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_confirm_delivery"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                },
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_win":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_win"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                },
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_loose":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_loose"
                            keys={[
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "lottery_goods_refund":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.lottery_goods_refund"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].participant,
                                    arg: "participant"
                                },
                                {
                                    type: "lottery_goods",
                                    value: op[1].lot_id,
                                    arg: "lot_id"
                                },
                                {
                                    type: "amount",
                                    value: op[1].ticket_price,
                                    arg: "ticket_price"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "matrix_open_room":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.matrix_open_room"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "matrix",
                                    value: op[1].matrix_id,
                                    arg: "matrix_id"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].matrix_level,
                                    arg: "matrix_level"
                                },
                                {
                                    type: "amount",
                                    value: op[1].level_price,
                                    arg: "level_price"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "matrix_room_closed":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.matrix_room_closed"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "matrix_rooms",
                                    value: op[1].matrix_room,
                                    arg: "matrix_room"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].matrix_level,
                                    arg: "matrix_level"
                                },
                                {
                                    type: "amount",
                                    value: op[1].level_reward,
                                    arg: "level_reward"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "matrix_cell_filled":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.matrix_cell_filled"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "account",
                                    value: op[1].cell_player,
                                    arg: "cell_player"
                                },
                                {
                                    type: "matrix_rooms",
                                    value: op[1].matrix_room,
                                    arg: "matrix_room"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].matrix_level,
                                    arg: "matrix_level"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "send_message":
                if (op[1].memo) {
                    memoComponent = <MemoText memo={op[1].memo} />;
                }

                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.send_message"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                { type: "account", value: op[1].to, arg: "to" }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );

                break;

            // ==========================================================================

            case "create_p2p_adv":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.create_p2p_adv"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "string",
                                    value: op[1].currency,
                                    arg: "currency"
                                },
                                {
                                    type: "string",
                                    value: op[1].geo,
                                    arg: "geo"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "edit_p2p_adv":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.edit_p2p_adv"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "p2p_adv",
                                    value: op[1].p2p_adv,
                                    arg: "p2p_adv"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "clear_p2p_adv_black_list":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.clear_p2p_adv_black_list"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "p2p_adv",
                                    value: op[1].p2p_adv,
                                    arg: "p2p_adv"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "remove_from_p2p_adv_black_list":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.remove_from_p2p_adv_black_list"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "account",
                                    value: op[1].blacklisted,
                                    arg: "blacklisted"
                                },
                                {
                                    type: "p2p_adv",
                                    value: op[1].p2p_adv,
                                    arg: "p2p_adv"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "create_p2p_order":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.create_p2p_order"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_client,
                                    arg: "p2p_client"
                                },
                                {
                                    type: "p2p_adv",
                                    value: op[1].p2p_adv,
                                    arg: "p2p_adv"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "cancel_p2p_order":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.cancel_p2p_order"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "p2p_adv",
                                    value: op[1].p2p_adv,
                                    arg: "p2p_adv"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "autocancel_p2p_order":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.autocancel_p2p_order"
                            keys={[
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "autorefund_p2p_order":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.autorefund_p2p_order"
                            keys={[
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "account",
                                    value: op[1].refund_to,
                                    arg: "refund_to"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "call_p2p_order":
                color = "info";
                if (op[1].payment_details) {
                    memoComponent = <MemoText memo={op[1].payment_details} />;
                }

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.call_p2p_order"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].p2p_gateway,
                                    arg: "p2p_gateway"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "account",
                                    value: op[1].p2p_client,
                                    arg: "p2p_client"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );
                break;

            // ==========================================================================

            case "payment_p2p_order":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.payment_p2p_order"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].paying_account,
                                    arg: "paying_account"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "account",
                                    value: op[1].recieving_account,
                                    arg: "recieving_account"
                                }
                            ]}
                        />
                        <MemoText memo={op[1].file_hash} />
                    </span>
                );
                break;

            // ==========================================================================

            case "release_p2p_order":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.release_p2p_order"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].paying_account,
                                    arg: "paying_account"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "account",
                                    value: op[1].recieving_account,
                                    arg: "recieving_account"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "open_p2p_dispute":
                color = "warning";
                if (op[1].contact_details) {
                    memoComponent = <MemoText memo={op[1].contact_details} />;
                }
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.open_p2p_dispute"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "account",
                                    value: op[1].defendant,
                                    arg: "defendant"
                                }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );
                break;

            // ==========================================================================

            case "reply_p2p_dispute":
                color = "warning";
                if (op[1].contact_details) {
                    memoComponent = <MemoText memo={op[1].contact_details} />;
                }
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.reply_p2p_dispute"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                }
                            ]}
                        />
                        {memoComponent}
                    </span>
                );
                break;

            // ==========================================================================
            case "resolve_p2p_dispute":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.resolve_p2p_dispute"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                },
                                {
                                    type: "account",
                                    value: op[1].looser,
                                    arg: "looser"
                                },
                                {
                                    type: "p2p_order",
                                    value: op[1].p2p_order,
                                    arg: "p2p_order"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_system_get":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_system_get"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_total_repay":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_total_repay"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_repay":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_repay"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_offer_create":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_offer_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].min_income,
                                    arg: "min_income"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_offer_cancel":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_offer_cancel"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "credit_offer",
                                    value: op[1].credit_offer,
                                    arg: "credit_offer"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "credit_offer_fill":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.credit_offer_fill"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                },
                                {
                                    type: "credit_offer",
                                    value: op[1].credit_offer,
                                    arg: "credit_offer"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_give_create":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_give_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].pledge_amount,
                                    arg: "pledge_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                },
                                {
                                    type: "uint16",
                                    value: op[1].pledge_days,
                                    arg: "pledge_days"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_take_create":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_take_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].pledge_amount,
                                    arg: "pledge_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                },
                                {
                                    type: "uint16",
                                    value: op[1].pledge_days,
                                    arg: "pledge_days"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_cancel":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_cancel"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].creator,
                                    arg: "creator"
                                },
                                {
                                    type: "pledge_offer",
                                    value: op[1].pledge_offer,
                                    arg: "pledge_offer"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_fill":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_fill"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].credit_amount,
                                    arg: "credit_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].pledge_amount,
                                    arg: "pledge_amount"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                },
                                {
                                    type: "uint16",
                                    value: op[1].pledge_days,
                                    arg: "pledge_days"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_repay":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_repay"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "amount",
                                    value: op[1].repay_amount,
                                    arg: "repay_amount"
                                },
                                {
                                    type: "pledge_offer",
                                    value: op[1].pledge_offer,
                                    arg: "pledge_offer"
                                },
                                {
                                    type: "amount",
                                    value: op[1].pledge_amount,
                                    arg: "pledge_amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "pledge_offer_auto_repay":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.pledge_offer_auto_repay"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].debitor,
                                    arg: "debitor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor"
                                },
                                {
                                    type: "account",
                                    value: op[1].creditor,
                                    arg: "creditor2"
                                },
                                {
                                    type: "pledge_offer",
                                    value: op[1].pledge_offer,
                                    arg: "pledge_offer"
                                },
                                {
                                    type: "amount",
                                    value: op[1].pledge_amount,
                                    arg: "pledge_amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "poc_vote":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.poc_vote"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].poc3_vote,
                                    arg: "poc3_vote"
                                },
                                {
                                    type: "amount",
                                    value: op[1].poc6_vote,
                                    arg: "poc6_vote"
                                },
                                {
                                    type: "amount",
                                    value: op[1].poc12_vote,
                                    arg: "poc12_vote"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "exchange_silver":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.exchange_silver"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "poc_stak":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.poc_stak"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].stak_amount,
                                    arg: "stak_amount"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].staking_type,
                                    arg: "staking_type"
                                }
                            ]}
                        />
                        &nbsp;
                        <Translate
                            content={
                                "operation.poc_stak_month" +
                                op[1].staking_type.toString()
                            }
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "poc_staking_referal":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.poc_staking_referal"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].referrer,
                                    arg: "referrer"
                                },
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].reward,
                                    arg: "reward"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].level,
                                    arg: "level"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "buy_gcwd":
                color = "warning";
                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.buy_gcwd"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account,
                                    arg: "account"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );
                break;

            // ==========================================================================

            case "approved_transfer_create":
                color = "warning";
                let myStdate = new Date(op[1].expiration + "Z");
                let expiration = myStdate.toLocaleString();

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.approved_transfer_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                },
                                {
                                    type: "string",
                                    value: expiration,
                                    arg: "expiration"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "approved_transfer_approve":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.approved_transfer_approve"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "approved_transfer",
                                    value: op[1].ato,
                                    arg: "ato"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "approved_transfer_cancel":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.approved_transfer_cancel"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "approved_transfer",
                                    value: op[1].ato,
                                    arg: "ato"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "approved_transfer_open_dispute":
                color = "warning";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.approved_transfer_open_dispute"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "approved_transfer",
                                    value: op[1].ato,
                                    arg: "ato"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "approved_transfer_resolve_dispute":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.approved_transfer_resolve_dispute"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "account",
                                    value: op[1].arbitr,
                                    arg: "arbitr"
                                },
                                {
                                    type: "account",
                                    value: op[1].winner,
                                    arg: "winner"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "approved_transfer",
                                    value: op[1].ato,
                                    arg: "ato"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "mass_payment":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.mass_payment"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "change_referrer":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.change_referrer"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].account_id,
                                    arg: "account_id"
                                },
                                {
                                    type: "account",
                                    value: op[1].new_referrer,
                                    arg: "new_referrer"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "mass_payment_pay":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.mass_payment_pay"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].from,
                                    arg: "from"
                                },
                                {
                                    type: "account",
                                    value: op[1].to,
                                    arg: "to"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_create":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_team_create"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "string",
                                    value: op[1].name,
                                    arg: "name"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_delete":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_team_delete"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_invite_send":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_invite_send"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_invite_accept":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_invite_accept"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                },
                                {
                                    type: "gr_invite",
                                    value: op[1].invite,
                                    arg: "invite"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_player_remove":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_player_remove"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_leave":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_team_leave"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_vote":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_vote"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_assign_rank":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_assign_rank"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].rank,
                                    arg: "rank"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_pay_rank_reward":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_pay_rank_reward"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].rank,
                                    arg: "rank"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_pay_top_reward":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_pay_top_reward"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].captain,
                                    arg: "captain"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                },
                                {
                                    type: "amount",
                                    value: op[1].amount,
                                    arg: "amount"
                                },
                                {
                                    type: "uint8",
                                    value: op[1].interval,
                                    arg: "interval"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            case "gr_apostolos":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string="operation.gr_apostolos"
                            keys={[
                                {
                                    type: "account",
                                    value: op[1].player,
                                    arg: "player"
                                },
                                {
                                    type: "gr_team",
                                    value: op[1].team,
                                    arg: "team"
                                }
                            ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_range_bet":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={op[1].result ?
                                "operation.gr_range_bet_true"
                                : "operation.gr_range_bet_false"
                            }
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].bet,
                                        arg: "bet"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team,
                                        arg: "team"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].lower_rank,
                                        arg: "lower_rank"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].upper_rank,
                                        arg: "upper_rank"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_bet":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={"operation.gr_team_bet"}
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].bet,
                                        arg: "bet"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team1,
                                        arg: "team1"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team2,
                                        arg: "team2"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].winner,
                                        arg: "winner"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_range_bet_win":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={op[1].result >= op[1].lower_rank && op[1].result <= op[1].upper_rank ?
                                "operation.gr_range_bet_win_true"
                                : "operation.gr_range_bet_win_false"
                            }
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].bettor_part,
                                        arg: "bettor_part"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team,
                                        arg: "team"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].lower_rank,
                                        arg: "lower_rank"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].upper_rank,
                                        arg: "upper_rank"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].reward,
                                        arg: "reward"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].total_bets,
                                        arg: "total_bets"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].total_wins,
                                        arg: "total_wins"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_range_bet_loose":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={op[1].result ?
                                "operation.gr_range_bet_loose_true"
                                : "operation.gr_range_bet_loose_false"
                            }
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team,
                                        arg: "team"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].lower_rank,
                                        arg: "lower_rank"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].upper_rank,
                                        arg: "upper_rank"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_bet_win":
                color = "success";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={"operation.gr_team_bet_win"}
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].bettor_part,
                                        arg: "bettor_part"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team1,
                                        arg: "team1"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team2,
                                        arg: "team2"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].winner,
                                        arg: "winner"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].reward,
                                        arg: "reward"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].total_bets,
                                        arg: "total_bets"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].total_wins,
                                        arg: "total_wins"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_bet_loose":
                color = "error";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={"operation.gr_team_bet_loose"}
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team1,
                                        arg: "team1"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team2,
                                        arg: "team2"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].winner,
                                        arg: "winner"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_range_bet_cancel":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={op[1].result ?
                                "operation.gr_range_bet_cancel_true"
                                : "operation.gr_range_bet_cancel_false"
                            }
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].payback,
                                        arg: "payback"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team,
                                        arg: "team"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].lower_rank,
                                        arg: "lower_rank"
                                    },
                                    {
                                        type: "uint8",
                                        value: op[1].upper_rank,
                                        arg: "upper_rank"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            case "gr_team_bet_cancel":
                color = "info";

                column = (
                    <span>
                        <TranslateWithLinks
                            string={"operation.gr_team_bet_cancel"}
                            keys={
                                [
                                    {
                                        type: "account",
                                        value: op[1].bettor,
                                        arg: "bettor"
                                    },
                                    {
                                        type: "amount",
                                        value: op[1].payback,
                                        arg: "payback"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team1,
                                        arg: "team1"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].team2,
                                        arg: "team2"
                                    },
                                    {
                                        type: "gr_team",
                                        value: op[1].winner,
                                        arg: "winner"
                                    }
                                ]}
                        />
                    </span>
                );

                break;

            // ==========================================================================

            default:
                column = (
                    <span>
                        <Link to={`/block/${block}`}>#{block}</Link>
                    </span>
                );
        }

        if (this.props.csvExportMode) {
            const globalObject = ChainStore.getObject("2.0.0");
            const dynGlobalObject = ChainStore.getObject("2.1.0");
            const block_time = utils.calc_block_time(
                block,
                globalObject,
                dynGlobalObject
            );
            return (
                <div>
                    <div>{block_time ? block_time.toLocaleString() : ""}</div>
                    <div>{ops[op[0]]}</div>
                    <div>{column}</div>
                    <div>
                        <FormattedAsset
                            amount={parseInt(op[1].fee.amount, 10)}
                            asset={op[1].fee.asset_id}
                        />
                    </div>
                </div>
            );
        }

        line = column ? (
            <Row
                operationId={this.props.operationId}
                txIndex={this.props.txIndex}
                includeOperationId={this.props.includeOperationId}
                block={block}
                type={op[0]}
                color={color}
                fee={op[1].fee}
                hideOpLabel={this.props.hideOpLabel}
                hideDate={this.props.hideDate}
                info={column}
                hideFee={this.props.hideFee}
                hidePending={this.props.hidePending}
                operationsInfo={this.props.operationsInfo}
                showBlock={this.props.showBlock}
                fullDate={this.props.fullDate}
                mainPageMode={this.props.mainPageMode}
                notificationMode={this.props.notificationMode}
                shortMode={this.props.shortMode}
            />
        ) : null;

        return line ? line : <tr />;
    }
}

Operation = connect(Operation, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            marketDirections: SettingsStore.getState().marketDirections
        };
    }
});

export default Operation;
